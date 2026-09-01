import {
  adminFullName,
  buildDefaultSellerAdmins,
  emptyAdminForm,
  isAdminAccessAllowed,
  toAdminForm,
  type SellerAdminFormValues,
  type SellerAdminUser,
} from '~/data/seller-admins'

export function useSellerAdmins() {
  const admins = useState<SellerAdminUser[]>('seller-admins', () => [])
  const seeded = useState('seller-admins-seeded', () => false)
  /** Optional role-preview for demo (SUPER_ADMIN only) */
  const previewRoleId = useState<string | null>('seller-rbac-preview-role-id', () => null)

  function ensureLoaded() {
    if (!seeded.value) {
      admins.value = buildDefaultSellerAdmins()
      seeded.value = true
    }
    // Sync primary SUPER_ADMIN phone from current profile when available
    const { profile } = useAccount()
    const phone = profile.value?.phone?.trim()
    if (phone) {
      const superAdmin = admins.value.find(a => a.id === 'adm-super-1')
      if (superAdmin && !superAdmin.phone) {
        const copy = [...admins.value]
        const idx = copy.findIndex(a => a.id === 'adm-super-1')
        if (idx !== -1) {
          copy[idx] = { ...copy[idx]!, phone }
          admins.value = copy
        }
      }
    }
    return admins.value
  }

  function getById(id: string) {
    return admins.value.find(a => a.id === id) ?? null
  }

  function findByPhone(phone: string) {
    const normalized = phone.trim()
    if (!normalized) return null
    return admins.value.find(a => a.phone === normalized) ?? null
  }

  function currentAdminUser(): SellerAdminUser | null {
    ensureLoaded()
    const { profile } = useAccount()
    const byPhone = findByPhone(profile.value?.phone || '')
    if (byPhone) return byPhone
    if (profile.value?.role === 'admin') {
      return getById('adm-super-1')
    }
    return null
  }

  function countSuperAdmins(excludeId?: string) {
    ensureLoaded()
    return admins.value.filter(
      a => isAdminAccessAllowed(a.status)
        && a.roleIds.includes('role-super_admin')
        && a.id !== excludeId,
    ).length
  }

  function createAdmin(form: SellerAdminFormValues) {
    ensureLoaded()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return { ok: false as const, error: 'نام و نام خانوادگی الزامی است' }
    }
    if (!form.email.trim()) {
      return { ok: false as const, error: 'ایمیل الزامی است' }
    }
    if (!form.roleIds.length) {
      return { ok: false as const, error: 'حداقل یک نقش انتخاب کنید' }
    }
    if (admins.value.some(a => a.email.toLowerCase() === form.email.trim().toLowerCase())) {
      return { ok: false as const, error: 'ایمیل تکراری است' }
    }
    const now = new Date().toISOString()
    const primary = form.roleIds[0] || 'role-viewer'
    const admin: SellerAdminUser = {
      id: `adm-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      avatar: form.avatar,
      status: form.status,
      roleIds: [...form.roleIds],
      primaryRoleKey: primary.replace(/^role-/, '').toUpperCase(),
      createdAt: now,
      lastLoginAt: null,
      lastActivityAt: null,
    }
    admins.value = [admin, ...admins.value]
    return { ok: true as const, admin }
  }

  function updateAdmin(id: string, form: SellerAdminFormValues) {
    ensureLoaded()
    const index = admins.value.findIndex(a => a.id === id)
    if (index === -1) return { ok: false as const, error: 'ادمین پیدا نشد' }
    const previous = admins.value[index]!
    const self = currentAdminUser()

    const nextRoles = form.roleIds.length ? form.roleIds : previous.roleIds
    const wasSuper = previous.roleIds.includes('role-super_admin') && isAdminAccessAllowed(previous.status)
    const willBeSuper = nextRoles.includes('role-super_admin') && isAdminAccessAllowed(form.status)

    if (wasSuper && !willBeSuper && countSuperAdmins(id) === 0) {
      return { ok: false as const, error: 'نمی‌توان آخرین سوپر ادمین فعال را حذف یا غیرفعال کرد' }
    }

    // Self-lockout: cannot remove own only super role or suspend/deactivate yourself as last super
    if (self && self.id === id) {
      if (!isAdminAccessAllowed(form.status) && wasSuper && countSuperAdmins(id) === 0) {
        return { ok: false as const, error: 'نمی‌توانید دسترسی خود را به‌عنوان آخرین سوپر ادمین قطع کنید' }
      }
      if (wasSuper && !nextRoles.includes('role-super_admin') && countSuperAdmins(id) === 0) {
        return { ok: false as const, error: 'نمی‌توانید تنها نقش سوپر ادمین خود را حذف کنید' }
      }
      if (!isAdminAccessAllowed(form.status) && previous.status === 'active') {
        return { ok: false as const, error: 'نمی‌توانید وضعیت حساب خود را غیرفعال یا معلق کنید' }
      }
    }

    if (admins.value.some(a => a.id !== id && a.email.toLowerCase() === form.email.trim().toLowerCase())) {
      return { ok: false as const, error: 'ایمیل تکراری است' }
    }

    const next: SellerAdminUser = {
      ...previous,
      firstName: form.firstName.trim() || previous.firstName,
      lastName: form.lastName.trim() || previous.lastName,
      email: form.email.trim().toLowerCase() || previous.email,
      phone: form.phone.trim(),
      avatar: form.avatar,
      status: form.status,
      roleIds: [...nextRoles],
      primaryRoleKey: (nextRoles[0] || previous.primaryRoleKey).replace(/^role-/, '').toUpperCase(),
      lastActivityAt: new Date().toISOString(),
    }
    const copy = [...admins.value]
    copy[index] = next
    admins.value = copy
    return { ok: true as const, admin: next }
  }

  function setAdminStatus(id: string, status: SellerAdminUser['status']) {
    const admin = getById(id)
    if (!admin) return { ok: false as const, error: 'ادمین پیدا نشد' }
    return updateAdmin(id, { ...toAdminForm(admin), status })
  }

  function deleteAdmin(id: string) {
    ensureLoaded()
    const admin = getById(id)
    if (!admin) return { ok: false as const, error: 'ادمین پیدا نشد' }
    const self = currentAdminUser()
    if (self && self.id === id) {
      return { ok: false as const, error: 'نمی‌توانید حساب خود را حذف کنید' }
    }
    if (admin.roleIds.includes('role-super_admin') && isAdminAccessAllowed(admin.status) && countSuperAdmins(id) === 0) {
      return { ok: false as const, error: 'نمی‌توان آخرین سوپر ادمین را حذف کرد' }
    }
    return setAdminStatus(id, 'inactive')
  }

  return {
    admins,
    previewRoleId,
    ensureLoaded,
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
