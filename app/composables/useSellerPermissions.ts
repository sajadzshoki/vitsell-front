import {
  expandPermissions,
  resolveSellerAdminRole,
  setHasPermission,
  type SellerPermission,
  type SellerSystemRoleKey,
} from '~/data/seller-permissions'

export function useSellerPermissions() {
  const { profile } = useAccount()
  const { currentAdminUser, previewRoleId, ensureLoaded: ensureAdmins } = useSellerAdmins()
  const { permissionsForRoleIds, getById: getRoleById, ensureLoaded: ensureRoles } = useSellerRoles()

  const adminRole = computed<SellerSystemRoleKey | null>(() => {
    ensureAdmins()
    ensureRoles()
    if (previewRoleId.value) {
      const role = getRoleById(previewRoleId.value)
      if (role?.key) return role.key as SellerSystemRoleKey
    }
    const admin = currentAdminUser()
    if (admin?.primaryRoleKey) {
      return admin.primaryRoleKey as SellerSystemRoleKey
    }
    return resolveSellerAdminRole(profile.value?.role)
  })

  const permissions = computed(() => {
    ensureAdmins()
    ensureRoles()
    if (previewRoleId.value) {
      const role = getRoleById(previewRoleId.value)
      if (role) return expandPermissions(role.permissions)
    }
    const admin = currentAdminUser()
    if (admin?.roleIds?.length) {
      return permissionsForRoleIds(admin.roleIds)
    }
    const fallback = resolveSellerAdminRole(profile.value?.role)
    if (!fallback) return [] as SellerPermission[]
    const role = getRoleById(`role-${fallback.toLowerCase()}`)
    return expandPermissions(role?.permissions ?? [])
  })

  const permissionSet = computed(() => new Set(permissions.value))

  const isSuperAdmin = computed(() => {
    const admin = currentAdminUser()
    if (previewRoleId.value) {
      return getRoleById(previewRoleId.value)?.key === 'SUPER_ADMIN'
    }
    return Boolean(admin?.roleIds.includes('role-super_admin'))
      || resolveSellerAdminRole(profile.value?.role) === 'SUPER_ADMIN'
  })

  function can(permission: SellerPermission) {
    return setHasPermission(permissionSet.value, permission)
  }

  function canAny(...list: SellerPermission[]) {
    return list.some(p => can(p))
  }

  function canAll(...list: SellerPermission[]) {
    return list.every(p => can(p))
  }

  function setPreviewRole(roleId: string | null) {
    if (!isSuperAdmin.value && roleId) return
    // When setting preview, current user must actually be super (ignore preview for gate)
    const admin = currentAdminUser()
    const reallySuper = Boolean(admin?.roleIds.includes('role-super_admin'))
      || resolveSellerAdminRole(profile.value?.role) === 'SUPER_ADMIN'
    if (!reallySuper && roleId) return
    previewRoleId.value = roleId
  }

  return {
    adminRole,
    permissions,
    isSuperAdmin,
    can,
    canAny,
    canAll,
    setPreviewRole,
    previewRoleId,
  }
}
