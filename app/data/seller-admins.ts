export type SellerAdminStatus = 'active' | 'inactive' | 'suspended'

export type SellerAdminUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string | null
  status: SellerAdminStatus
  roleIds: string[]
  /** Primary system role key for quick display */
  primaryRoleKey: string
  createdAt: string
  lastLoginAt: string | null
  lastActivityAt: string | null
}

export type SellerAdminFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string | null
  status: SellerAdminStatus
  roleIds: string[]
  /** Required on create; optional on update */
  password?: string
}

export const sellerAdminStatusMeta: Record<
  SellerAdminStatus,
  { label: string, color: 'success' | 'warning' | 'error' | 'neutral' }
> = {
  active: { label: 'فعال', color: 'success' },
  inactive: { label: 'غیرفعال', color: 'neutral' },
  suspended: { label: 'معلق', color: 'error' },
}

export function isAdminAccessAllowed(status: SellerAdminStatus) {
  return status === 'active'
}

export function emptyAdminForm(): SellerAdminFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
    status: 'active',
    roleIds: ['role-viewer'],
    password: '',
  }
}

export function toAdminForm(admin: SellerAdminUser): SellerAdminFormValues {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    phone: admin.phone,
    avatar: admin.avatar,
    status: admin.status,
    roleIds: [...admin.roleIds],
    password: '',
  }
}

export function adminFullName(admin: Pick<SellerAdminUser, 'firstName' | 'lastName'>) {
  return `${admin.firstName} ${admin.lastName}`.trim()
}

/** @deprecated Library is loaded from GET /seller/admins */
export function buildDefaultSellerAdmins(): SellerAdminUser[] {
  return []
}
