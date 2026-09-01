export type SellerAuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'login'
  | 'permission_change'
  | 'other'

export type SellerAuditEntity =
  | 'product'
  | 'order'
  | 'category'
  | 'promotion'
  | 'banner'
  | 'admin'
  | 'role'
  | 'inventory'
  | 'customer'
  | 'settings'
  | 'system'
  | 'payment'
  | 'refund'
  | 'settlement'
  | 'adjustment'
  | 'finance'

export type SellerAuditLog = {
  id: string
  actorId: string
  actorName: string
  action: SellerAuditAction
  entity: SellerAuditEntity
  entityId: string
  summary: string
  previousValue?: string | null
  newValue?: string | null
  createdAt: string
}

export const sellerAuditActionMeta: Record<SellerAuditAction, { label: string }> = {
  create: { label: 'ایجاد' },
  update: { label: 'ویرایش' },
  delete: { label: 'حذف' },
  status_change: { label: 'تغییر وضعیت' },
  login: { label: 'ورود' },
  permission_change: { label: 'تغییر دسترسی' },
  other: { label: 'سایر' },
}

export const sellerAuditEntityMeta: Record<SellerAuditEntity, { label: string }> = {
  product: { label: 'محصول' },
  order: { label: 'سفارش' },
  category: { label: 'دسته' },
  promotion: { label: 'پروموشن' },
  banner: { label: 'بنر' },
  admin: { label: 'ادمین' },
  role: { label: 'نقش' },
  inventory: { label: 'موجودی' },
  customer: { label: 'مشتری' },
  settings: { label: 'تنظیمات' },
  system: { label: 'سیستم' },
  payment: { label: 'پرداخت' },
  refund: { label: 'بازپرداخت' },
  settlement: { label: 'تسویه' },
  adjustment: { label: 'تعدیل مالی' },
  finance: { label: 'مالی' },
}

export function buildDefaultSellerAuditLogs(): SellerAuditLog[] {
  const base = Date.now()
  return [
    {
      id: 'aud-1',
      actorId: 'adm-super-1',
      actorName: 'مدیر اصلی',
      action: 'status_change',
      entity: 'order',
      entityId: 'SL-20411',
      summary: 'وضعیت سفارش به «در حال آماده‌سازی» تغییر کرد',
      previousValue: 'new',
      newValue: 'packing',
      createdAt: new Date(base - 15 * 60_000).toISOString(),
    },
    {
      id: 'aud-2',
      actorId: 'adm-product-1',
      actorName: 'سارا محصولی',
      action: 'update',
      entity: 'product',
      entityId: 'iphone-16-pro',
      summary: 'قیمت محصول به‌روزرسانی شد',
      previousValue: '89900000',
      newValue: '87900000',
      createdAt: new Date(base - 2 * 3600_000).toISOString(),
    },
    {
      id: 'aud-3',
      actorId: 'adm-super-1',
      actorName: 'مدیر اصلی',
      action: 'create',
      entity: 'promotion',
      entityId: 'WELCOME10',
      summary: 'کد تخفیف جدید ایجاد شد',
      createdAt: new Date(base - 5 * 3600_000).toISOString(),
    },
    {
      id: 'aud-4',
      actorId: 'adm-order-1',
      actorName: 'رضا سفارشی',
      action: 'status_change',
      entity: 'order',
      entityId: 'SL-20391',
      summary: 'سفارش ارسال شد',
      previousValue: 'packing',
      newValue: 'shipped',
      createdAt: new Date(base - 26 * 3600_000).toISOString(),
    },
    {
      id: 'aud-5',
      actorId: 'adm-product-1',
      actorName: 'سارا محصولی',
      action: 'update',
      entity: 'inventory',
      entityId: 'sony-xm5',
      summary: 'موجودی انبار تنظیم شد',
      previousValue: '12',
      newValue: '32',
      createdAt: new Date(base - 30 * 3600_000).toISOString(),
    },
    {
      id: 'aud-6',
      actorId: 'adm-super-1',
      actorName: 'مدیر اصلی',
      action: 'permission_change',
      entity: 'role',
      entityId: 'role-viewer',
      summary: 'دسترسی‌های نقش بازدیدکننده به‌روز شد',
      createdAt: new Date(base - 48 * 3600_000).toISOString(),
    },
    {
      id: 'aud-7',
      actorId: 'adm-super-1',
      actorName: 'مدیر اصلی',
      action: 'create',
      entity: 'admin',
      entityId: 'adm-viewer-1',
      summary: 'کاربر ادمین جدید افزوده شد',
      createdAt: new Date(base - 72 * 3600_000).toISOString(),
    },
    {
      id: 'aud-8',
      actorId: 'adm-product-1',
      actorName: 'سارا محصولی',
      action: 'create',
      entity: 'product',
      entityId: 'galaxy-s25-ultra',
      summary: 'محصول جدید ثبت شد',
      createdAt: new Date(base - 96 * 3600_000).toISOString(),
    },
  ]
}
