import {
  buildDefaultSellerRoles,
  emptyRoleForm,
  roleKeyPattern,
  toRoleForm,
  type SellerRole,
  type SellerRoleFormValues,
} from '~/data/seller-roles'
import type { SellerPermission } from '~/data/seller-permissions'
import { expandPermissions } from '~/data/seller-permissions'

export function useSellerRoles() {
  const roles = useState<SellerRole[]>('seller-roles', () => [])
  const seeded = useState('seller-roles-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      roles.value = buildDefaultSellerRoles()
      seeded.value = true
    }
    return roles.value
  }

  function getById(id: string) {
    return roles.value.find(r => r.id === id) ?? null
  }

  function getByKey(key: string) {
    return roles.value.find(r => r.key === key) ?? null
  }

  function permissionsForRoleIds(roleIds: string[]): SellerPermission[] {
    ensureLoaded()
    const list = roleIds
      .map(id => getById(id))
      .filter(Boolean)
      .flatMap(role => role!.permissions)
    return expandPermissions(list)
  }

  function countAdminsForRole(roleId: string, admins: { roleIds: string[] }[]) {
    return admins.filter(a => a.roleIds.includes(roleId)).length
  }

  function createRole(form: SellerRoleFormValues) {
    ensureLoaded()
    const key = form.key.trim().toUpperCase()
    if (!roleKeyPattern.test(key)) {
      return { ok: false as const, error: 'کلید نقش باید لاتین بزرگ با خط زیر باشد' }
    }
    if (roles.value.some(r => r.key === key)) {
      return { ok: false as const, error: 'کلید نقش تکراری است' }
    }
    if (!form.name.trim()) {
      return { ok: false as const, error: 'نام نقش الزامی است' }
    }
    const now = new Date().toISOString()
    const role: SellerRole = {
      id: `role-${key.toLowerCase()}`,
      key,
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      permissions: [...new Set(form.permissions)],
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    }
    roles.value = [role, ...roles.value]
    return { ok: true as const, role }
  }

  function updateRole(id: string, form: SellerRoleFormValues) {
    ensureLoaded()
    const index = roles.value.findIndex(r => r.id === id)
    if (index === -1) return { ok: false as const, error: 'نقش پیدا نشد' }
    const previous = roles.value[index]!

    if (previous.isSystem && previous.key === 'SUPER_ADMIN') {
      const nextPerms = [...new Set(form.permissions)]
      if (!nextPerms.length) {
        return { ok: false as const, error: 'نقش سوپر ادمین نمی‌تواند بدون دسترسی باشد' }
      }
    }

    if (previous.isSystem && form.key.trim().toUpperCase() !== previous.key) {
      return { ok: false as const, error: 'کلید نقش سیستمی قابل تغییر نیست' }
    }

    const next: SellerRole = {
      ...previous,
      name: form.name.trim() || previous.name,
      description: form.description.trim(),
      status: previous.key === 'SUPER_ADMIN' ? 'active' : form.status,
      permissions: previous.key === 'SUPER_ADMIN'
        ? [...previous.permissions]
        : [...new Set(form.permissions)],
      updatedAt: new Date().toISOString(),
    }

    if (previous.key === 'SUPER_ADMIN' && form.permissions.length) {
      // Allow expanding SUPER_ADMIN if catalog grows; never shrink below default full set unless already full
      next.permissions = [...new Set([...previous.permissions, ...form.permissions])]
    }

    const copy = [...roles.value]
    copy[index] = next
    roles.value = copy
    return { ok: true as const, role: next }
  }

  function deleteRole(id: string, adminCount: number) {
    ensureLoaded()
    const role = getById(id)
    if (!role) return { ok: false as const, error: 'نقش پیدا نشد' }
    if (role.isSystem) return { ok: false as const, error: 'نقش‌های سیستمی قابل حذف نیستند' }
    if (adminCount > 0) return { ok: false as const, error: 'نقش به ادمین اختصاص دارد؛ ابتدا کاربران را تغییر دهید' }
    roles.value = roles.value.filter(r => r.id !== id)
    return { ok: true as const }
  }

  function cloneRole(id: string) {
    ensureLoaded()
    const source = getById(id)
    if (!source) return { ok: false as const, error: 'نقش پیدا نشد' }
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
    ensureLoaded,
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
