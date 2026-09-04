import {
  buildDefaultSellerRoles,
  emptyRoleForm,
  roleKeyPattern,
  toRoleForm,
  type SellerRole,
  type SellerRoleFormValues,
} from '~/data/seller-roles'
import {
  expandPermissions,
  sellerAllPermissions,
  type SellerPermission,
} from '~/data/seller-permissions'

export type SellerRolesQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerRolesPage = {
  items: SellerRole[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toRole(raw: any): SellerRole {
  const permissions = Array.isArray(raw?.permissions)
    ? raw.permissions.map(String)
    : []
  const normalized = permissions.includes('*')
    ? [...sellerAllPermissions]
    : permissions as SellerPermission[]

  return {
    id: String(raw?.id || ''),
    key: String(raw?.key || ''),
    name: String(raw?.name || ''),
    description: String(raw?.description || ''),
    status: raw?.status === 'inactive' ? 'inactive' : 'active',
    permissions: normalized,
    isSystem: Boolean(raw?.isSystem),
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : new Date().toISOString(),
    adminCount: raw?.adminCount == null ? undefined : Number(raw.adminCount) || 0,
  }
}

export function useSellerRoles() {
  const roles = useState<SellerRole[]>('seller-roles', () => [])
  const listMeta = useState('seller-roles-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 50,
    statusCounts: {
      all: 0,
      active: 0,
      inactive: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-roles-seeded', () => false)
  const pending = useState('seller-roles-pending', () => false)

  function upsertLocal(role: SellerRole) {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index === -1) roles.value = [role, ...roles.value]
    else {
      const copy = [...roles.value]
      copy[index] = role
      roles.value = copy
    }
  }

  function getById(id: string) {
    return roles.value.find(r => r.id === id) ?? null
  }

  function getByKey(key: string) {
    return roles.value.find(r => r.key === key) ?? null
  }

  function permissionsForRoleIds(roleIds: string[]): SellerPermission[] {
    const list = roleIds
      .map(id => getById(id))
      .filter(Boolean)
      .flatMap(role => role!.permissions)
    return expandPermissions(list)
  }

  function countAdminsForRole(roleId: string, admins: { roleIds: string[] }[]) {
    return admins.filter(a => a.roleIds.includes(roleId)).length
  }

  async function fetchList(query?: SellerRolesQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 50
      }

      const { result, error } = await useGet<SellerRolesPage | SellerRole[]>(
        '/seller/roles',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'roles-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        roles.value = result.map(toRole)
        listMeta.value = {
          total: roles.value.length,
          page: 1,
          pageSize: roles.value.length,
          statusCounts: {
            all: roles.value.length,
            active: roles.value.filter(r => r.status === 'active').length,
            inactive: roles.value.filter(r => r.status === 'inactive').length,
          },
        }
      }
      else {
        roles.value = Array.isArray(result.items) ? result.items.map(toRole) : []
        listMeta.value = {
          total: Number(result.total) || roles.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 50,
          statusCounts: {
            all: Number(result.statusCounts?.all) || roles.value.length,
            active: Number(result.statusCounts?.active) || 0,
            inactive: Number(result.statusCounts?.inactive) || 0,
          },
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return roles.value
    await fetchList({ all: true, pageSize: 200 })
    if (!roles.value.length) {
      roles.value = buildDefaultSellerRoles()
      seeded.value = true
    }
    return roles.value
  }

  async function fetchById(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, role: cached, error: null as null }
    }
    const { result, error } = await useGet<any>(
      `/seller/roles/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true }, server: false },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        role: null as SellerRole | null,
        error: apiErrorMessage(error, 'بارگذاری نقش ناموفق بود'),
      }
    }
    const role = toRole(result)
    upsertLocal(role)
    seeded.value = true
    return { ok: true as const, role, error: null as null }
  }

  async function createRole(form: SellerRoleFormValues) {
    const key = form.key.trim().toUpperCase()
    if (!roleKeyPattern.test(key)) {
      return { ok: false as const, role: null as SellerRole | null, error: 'کلید نقش باید لاتین بزرگ با خط زیر باشد' }
    }
    if (!form.name.trim()) {
      return { ok: false as const, role: null as SellerRole | null, error: 'نام نقش الزامی است' }
    }
    const permissions = [...new Set(form.permissions)].filter(p => p && p !== '*') as SellerPermission[]
    if (!permissions.length) {
      return { ok: false as const, role: null as SellerRole | null, error: 'حداقل یک مجوز انتخاب کنید' }
    }

    const { result, error } = await usePost<any>('/seller/roles', {
      key,
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      permissions,
    }, { headers: { 'no-error': true } })

    if (error || !result?.id) {
      return {
        ok: false as const,
        role: null as SellerRole | null,
        error: apiErrorMessage(error, 'ثبت نقش ناموفق بود'),
      }
    }
    const role = toRole(result)
    upsertLocal(role)
    return { ok: true as const, role, error: null as null }
  }

  async function updateRole(id: string, form: SellerRoleFormValues) {
    const permissions = [...new Set(form.permissions)].filter(p => p && p !== '*') as SellerPermission[]
    if (!permissions.length && form.key !== 'SUPER_ADMIN') {
      return {
        ok: false as const,
        role: null as SellerRole | null,
        error: 'حداقل یک مجوز انتخاب کنید',
      }
    }

    const { result, error } = await usePut<any>(`/seller/roles/${encodeURIComponent(id)}`, {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      permissions,
    }, { headers: { 'no-error': true } })

    if (error || !result?.id) {
      return {
        ok: false as const,
        role: null as SellerRole | null,
        error: apiErrorMessage(error, 'به‌روزرسانی نقش ناموفق بود'),
      }
    }
    const role = toRole(result)
    upsertLocal(role)
    return { ok: true as const, role, error: null as null }
  }

  async function deleteRole(id: string, _adminCount?: number) {
    const { error } = await useDelete(`/seller/roles/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف نقش ناموفق بود') }
    }
    roles.value = roles.value.filter(r => r.id !== id)
    return { ok: true as const, error: null as null }
  }

  async function cloneRole(id: string) {
    const source = getById(id)
    if (!source) return { ok: false as const, role: null as SellerRole | null, error: 'نقش پیدا نشد' }
    let key = `${source.key}_COPY`
    let n = 1
    while (roles.value.some(r => r.key === key)) {
      n++
      key = `${source.key}_COPY${n}`
    }
    return createRole({
      key,
      name: `${source.name} (کپی)`,
      description: source.description,
      status: 'active',
      permissions: [...source.permissions],
    })
  }

  return {
    roles,
    listMeta,
    pending,
    ensureLoaded,
    fetchList,
    fetchById,
    getById,
    getByKey,
    permissionsForRoleIds,
    countAdminsForRole,
    createRole,
    updateRole,
    deleteRole,
    cloneRole,
    emptyRoleForm,
    toRoleForm,
  }
}
