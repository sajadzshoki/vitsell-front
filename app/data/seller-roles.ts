import {
  sellerDefaultRolePermissions,
  type SellerPermission,
  type SellerSystemRoleKey,
} from '~/data/seller-permissions'

export type SellerRoleStatus = 'active' | 'inactive'

export type SellerRole = {
  id: string
  /** Stable key — system roles use SellerSystemRoleKey */
  key: string
  name: string
  description: string
  status: SellerRoleStatus
  permissions: SellerPermission[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
  /** Populated by GET /seller/roles */
  adminCount?: number
}

export type SellerRoleFormValues = {
  key: string
  name: string
  description: string
  status: SellerRoleStatus
  permissions: SellerPermission[]
}

const now = '2024-12-01T10:00:00.000Z'

export const sellerSystemRoleMeta: Record<
  SellerSystemRoleKey,
  { name: string, description: string }
> = {
  SUPER_ADMIN: {
    name: 'سوپر ادمین',
    description: 'دسترسی کامل به تمام بخش‌های پنل مدیریت',
  },
  ADMIN: {
    name: 'ادمین',
    description: 'دسترسی گسترده بدون مدیریت نقش‌ها و کاربران ادمین',
  },
  PRODUCT_MANAGER: {
    name: 'مدیر محصول',
    description: 'مدیریت کاتالوگ، موجودی و ویژگی‌ها',
  },
  ORDER_MANAGER: {
    name: 'مدیر سفارش',
    description: 'مدیریت سفارش‌ها، ارسال و مرجوعی',
  },
  CONTENT_MANAGER: {
    name: 'مدیر محتوا',
    description: 'وبلاگ، صفحات، درباره ما و رسانه',
  },
  MARKETING_MANAGER: {
    name: 'مدیر بازاریابی',
    description: 'بنر، شگفت‌انگیز، پروموشن و اعلان',
  },
  FINANCE_MANAGER: {
    name: 'مدیر مالی',
    description: 'مالی، تسویه و گزارش‌های مرتبط',
  },
  SUPPORT_MANAGER: {
    name: 'مدیر پشتیبانی',
    description: 'مشتریان، نظرات، پرسش‌ها و پشتیبانی سفارش',
  },
  SUPPORT_AGENT: {
    name: 'پشتیبان',
    description: 'سفارش‌ها، نظرات و پرسش مشتریان (سازگاری قدیمی)',
  },
  VIEWER: {
    name: 'بازدیدکننده',
    description: 'فقط مشاهده بخش‌های مجاز',
  },
}

export function buildDefaultSellerRoles(): SellerRole[] {
  return (Object.keys(sellerSystemRoleMeta) as SellerSystemRoleKey[]).map((key, index) => ({
    id: `role-${key.toLowerCase()}`,
    key,
    name: sellerSystemRoleMeta[key].name,
    description: sellerSystemRoleMeta[key].description,
    status: 'active',
    permissions: [...sellerDefaultRolePermissions[key]],
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  }))
}

export function emptyRoleForm(): SellerRoleFormValues {
  return {
    key: '',
    name: '',
    description: '',
    status: 'active',
    permissions: [],
  }
}

export function toRoleForm(role: SellerRole): SellerRoleFormValues {
  return {
    key: role.key,
    name: role.name,
    description: role.description,
    status: role.status,
    permissions: [...role.permissions],
  }
}

export const roleKeyPattern = /^[A-Z][A-Z0-9_]*$/

/** Build a valid role key from a display name when possible */
export function suggestRoleKey(name: string) {
  const latin = name
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]+/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase()
  if (!latin || !/^[A-Z]/.test(latin)) return ''
  return latin.slice(0, 48)
}
