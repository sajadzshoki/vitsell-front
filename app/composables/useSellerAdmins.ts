import {
  adminFullName,
  emptyAdminForm,
  isAdminAccessAllowed,
  toAdminForm,
  type SellerAdminFormValues,
  type SellerAdminUser,
} from '~/data/seller-admins'

export type SellerAdminsQuery = {
  q?: string
  status?: string
  roleId?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerAdminsPage = {
  items: SellerAdminUser[]
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

function toAdmin(raw: any): SellerAdminUser {
  return {
    id: String(raw?.id || ''),
    firstName: String(raw?.firstName || ''),
    lastName: String(raw?.lastName || ''),
    email: String(raw?.email || ''),
    phone: String(raw?.phone || ''),
    avatar: raw?.avatar ? String(raw.avatar) : null,
    status: (['active', 'inactive', 'suspended'].includes(raw?.status) ? raw.status : 'inactive'),
    roleIds: Array.isArray(raw?.roleIds) ? raw.roleIds.map(String) : [],
    primaryRoleKey: String(raw?.primaryRoleKey || 'VIEWER'),
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    lastLoginAt: raw?.lastLoginAt ? String(raw.lastLoginAt) : null,
    lastActivityAt: raw?.lastActivityAt ? String(raw.lastActivityAt) : null,
  }
}

function formToPayload(form: SellerAdminFormValues) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    avatar: form.avatar,
    status: form.status,
    roleIds: [...form.roleIds],
    ...(form.password?.trim() ? { password: form.password.trim() } : {}),
  }
}

export function useSellerAdmins() {
  const admins = useState<SellerAdminUser[]>('seller-admins', () => [])
  const listMeta = useState('seller-admins-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 8,
    statusCounts: {
      all: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-admins-seeded', () => false)
  const pending = useState('seller-admins-pending', () => false)
  /** Optional role-preview for demo (SUPER_ADMIN only) */
  const previewRoleId = useState<string | null>('seller-rbac-preview-role-id', () => null)

  function upsertLocal(admin: SellerAdminUser) {
    const index = admins.value.findIndex(a => a.id === admin.id)
    if (index === -1) admins.value = [admin, ...admins.value]
    else {
      const copy = [...admins.value]
      copy[index] = admin
      admins.value = copy
    }
  }

  function getById(id: string) {
    return admins.value.find(a => a.id === id) ?? null
  }

  function findByPhone(phone: string) {
    const normalized = phone.trim()
    if (!normalized) return null
    return admins.value.find(a => a.phone === normalized) ?? null
  }

  async function fetchList(query?: SellerAdminsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.roleId && query.roleId !== 'all') params.roleId = query.roleId
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 8
      }

      const { result, error } = await useGet<SellerAdminsPage | SellerAdminUser[]>(
        '/seller/admins',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'admins-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        admins.value = result.map(toAdmin)
        listMeta.value = {
          total: admins.value.length,
          page: 1,
          pageSize: admins.value.length,
          statusCounts: {
            all: admins.value.length,
            active: admins.value.filter(a => a.status === 'active').length,
            inactive: admins.value.filter(a => a.status === 'inactive').length,
            suspended: admins.value.filter(a => a.status === 'suspended').length,
          },
        }
      }
      else {
        admins.value = Array.isArray(result.items) ? result.items.map(toAdmin) : []
        listMeta.value = {
          total: Number(result.total) || admins.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 8,
          statusCounts: {
            all: Number(result.statusCounts?.all) || admins.value.length,
            active: Number(result.statusCounts?.active) || 0,
            inactive: Number(result.statusCounts?.inactive) || 0,
            suspended: Number(result.statusCounts?.suspended) || 0,
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
    if (seeded.value && !options?.force) return admins.value
    await fetchList({ page: 1, pageSize: 100, all: true })
    return admins.value
  }

  async function fetchById(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, admin: cached, error: null as null }
    }
    const { result, error } = await useGet<any>(
      `/seller/admins/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error }
    }
    const admin = toAdmin(result)
    upsertLocal(admin)
    seeded.value = true
    return { ok: true as const, admin, error: null as null }
  }

  function currentAdminUser(): SellerAdminUser | null {
    const { profile } = useAccount()
    if (profile.value?.adminId) {
      const byId = getById(String(profile.value.adminId))
      if (byId) return byId
      if (profile.value.role === 'admin') {
        return {
          id: String(profile.value.adminId),
          firstName: profile.value.firstName || '',
          lastName: profile.value.lastName || '',
          email: profile.value.email || '',
          phone: profile.value.phone || '',
          avatar: profile.value.avatar?.trim() || null,
          status: (profile.value.adminStatus as SellerAdminUser['status']) || 'active',
          roleIds: Array.isArray(profile.value.roleIds) ? profile.value.roleIds : ['role-super_admin'],
          primaryRoleKey: profile.value.primaryRoleKey || 'SUPER_ADMIN',
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
          lastActivityAt: null,
        }
      }
    }
    const byPhone = findByPhone(profile.value?.phone || '')
    if (byPhone) return byPhone
    return null
  }

  function countSuperAdmins(excludeId?: string) {
    return admins.value.filter(
      a => isAdminAccessAllowed(a.status)
        && a.roleIds.includes('role-super_admin')
        && a.id !== excludeId,
    ).length
  }

  async function createAdmin(form: SellerAdminFormValues) {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error: 'نام و نام خانوادگی الزامی است' }
    }
    if (!form.email.trim()) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error: 'ایمیل الزامی است' }
    }
    if (!form.phone.trim()) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error: 'تلفن الزامی است' }
    }
    if (!form.password?.trim() || form.password.trim().length < 8) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error: 'رمز عبور حداقل ۸ کاراکتر الزامی است' }
    }
    if (!form.roleIds.length) {
      return { ok: false as const, admin: null as SellerAdminUser | null, error: 'حداقل یک نقش انتخاب کنید' }
    }

    const { result, error } = await usePost<any>('/seller/admins', formToPayload(form), {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return {
        ok: false as const,
        admin: null as SellerAdminUser | null,
        error: apiErrorMessage(error, 'ثبت ادمین ناموفق بود'),
      }
    }
    const admin = toAdmin(result)
    upsertLocal(admin)
    return { ok: true as const, admin, error: null as null }
  }

  async function updateAdmin(id: string, form: SellerAdminFormValues) {
    const { result, error } = await usePut<any>(
      `/seller/admins/${encodeURIComponent(id)}`,
      formToPayload(form),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        admin: null as SellerAdminUser | null,
        error: apiErrorMessage(error, 'به‌روزرسانی ادمین ناموفق بود'),
      }
    }
    const admin = toAdmin(result)
    upsertLocal(admin)
    return { ok: true as const, admin, error: null as null }
  }

  async function setAdminStatus(id: string, status: SellerAdminUser['status']) {
    const { result, error } = await usePatch<any>(
      `/seller/admins/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        admin: null as SellerAdminUser | null,
        error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود'),
      }
    }
    const admin = toAdmin(result)
    upsertLocal(admin)
    return { ok: true as const, admin, error: null as null }
  }

  async function deleteAdmin(id: string) {
    const { error } = await useDelete(`/seller/admins/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف ادمین ناموفق بود') }
    }
    const admin = getById(id)
    if (admin) upsertLocal({ ...admin, status: 'inactive' })
    return { ok: true as const, error: null as null }
  }

  return {
    admins,
    listMeta,
    pending,
    previewRoleId,
    ensureLoaded,
    fetchList,
    fetchById,
    getById,
    findByPhone,
    currentAdminUser,
    countSuperAdmins,
    createAdmin,
    updateAdmin,
    setAdminStatus,
    deleteAdmin,
    emptyAdminForm,
    toAdminForm,
    adminFullName,
    isAdminAccessAllowed,
  }
}
