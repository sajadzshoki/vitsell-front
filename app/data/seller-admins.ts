import type { SellerSystemRoleKey } from '~/data/seller-permissions'

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
  }
}

export function adminFullName(admin: Pick<SellerAdminUser, 'firstName' | 'lastName'>) {
  return `${admin.firstName} ${admin.lastName}`.trim()
}

const seedNow = '2024-11-20T08:00:00.000Z'

/** Seed staff — frontend-only until `/seller/admins` API exists */
export function buildDefaultSellerAdmins(): SellerAdminUser[] {
  return [
    {
      id: 'adm-super-1',
      firstName: 'مدیر',
      lastName: 'اصلی',
      email: 'admin@digishop.ir',
      phone: '',
      avatar: null,
      status: 'active',
      roleIds: ['role-super_admin'],
      primaryRoleKey: 'SUPER_ADMIN' satisfies SellerSystemRoleKey,
      createdAt: seedNow,
      lastLoginAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    },
    {
      id: 'adm-product-1',
      firstName: 'سارا',
      lastName: 'محصولی',
      email: 'products@digishop.ir',
      phone: '09121112233',
      avatar: null,
      status: 'active',
      roleIds: ['role-product_manager'],
      primaryRoleKey: 'PRODUCT_MANAGER',
      createdAt: '2024-10-01T10:00:00.000Z',
      lastLoginAt: '2024-12-10T14:20:00.000Z',
      lastActivityAt: '2024-12-10T15:00:00.000Z',
    },
    {
      id: 'adm-order-1',
      firstName: 'رضا',
      lastName: 'سفارشی',
      email: 'orders@digishop.ir',
      phone: '09123334455',
      avatar: null,
      status: 'active',
      roleIds: ['role-order_manager'],
      primaryRoleKey: 'ORDER_MANAGER',
      createdAt: '2024-09-15T09:00:00.000Z',
      lastLoginAt: '2024-12-09T11:00:00.000Z',
      lastActivityAt: '2024-12-09T12:30:00.000Z',
    },
    {
      id: 'adm-support-1',
      firstName: 'نگار',
      lastName: 'پشتیبانی',
      email: 'support@digishop.ir',
      phone: '09124445566',
      avatar: null,
      status: 'active',
      roleIds: ['role-support_manager'],
      primaryRoleKey: 'SUPPORT_MANAGER',
      createdAt: '2024-10-20T10:00:00.000Z',
      lastLoginAt: '2024-12-11T09:00:00.000Z',
      lastActivityAt: '2024-12-11T10:00:00.000Z',
    },
    {
      id: 'adm-viewer-1',
      firstName: 'مینا',
      lastName: 'ناظر',
      email: 'viewer@digishop.ir',
      phone: '09125556677',
      avatar: null,
      status: 'active',
      roleIds: ['role-viewer'],
      primaryRoleKey: 'VIEWER',
      createdAt: '2024-11-01T12:00:00.000Z',
      lastLoginAt: '2024-12-08T09:00:00.000Z',
      lastActivityAt: '2024-12-08T09:40:00.000Z',
    },
    {
      id: 'adm-inactive-1',
      firstName: 'علی',
      lastName: 'غیرفعال',
      email: 'old@digishop.ir',
      phone: '09127778899',
      avatar: null,
      status: 'inactive',
      roleIds: ['role-support_agent'],
      primaryRoleKey: 'SUPPORT_AGENT',
      createdAt: '2024-06-01T08:00:00.000Z',
      lastLoginAt: '2024-08-01T10:00:00.000Z',
      lastActivityAt: '2024-08-01T10:00:00.000Z',
    },
    {
      id: 'adm-suspended-1',
      firstName: 'حسین',
      lastName: 'معلق',
      email: 'suspended@digishop.ir',
      phone: '09128889900',
      avatar: null,
      status: 'suspended',
      roleIds: ['role-viewer'],
      primaryRoleKey: 'VIEWER',
      createdAt: '2024-07-01T08:00:00.000Z',
      lastLoginAt: '2024-09-01T10:00:00.000Z',
      lastActivityAt: '2024-09-01T10:00:00.000Z',
    },
  ]
}
