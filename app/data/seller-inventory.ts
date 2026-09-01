export type SellerWarehouseStatus = 'active' | 'inactive'

export type SellerWarehouse = {
  id: string
  name: string
  code: string
  city: string
  address: string
  status: SellerWarehouseStatus
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type SellerWarehouseFormValues = {
  id: string
  name: string
  code: string
  city: string
  address: string
  status: SellerWarehouseStatus
  isDefault: boolean
}

export type SellerStockMovementType =
  | 'add'
  | 'remove'
  | 'adjust'
  | 'reserve'
  | 'release'
  | 'return'
  | 'refund'
  | 'correction'

export type SellerStockMovement = {
  id: string
  productId: string
  productTitle: string
  variantId: string | null
  variantLabel: string | null
  warehouseId: string
  type: SellerStockMovementType
  quantity: number
  before: number
  after: number
  reason: string
  actorName: string
  createdAt: string
}

export type SellerInventoryRow = {
  id: string
  productId: string
  productTitle: string
  sku: string
  variantId: string | null
  variantLabel: string | null
  warehouseId: string
  stock: number
  reserved: number
  available: number
  lowStockThreshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export const sellerStockMovementMeta: Record<SellerStockMovementType, { label: string }> = {
  add: { label: 'افزایش موجودی' },
  remove: { label: 'کاهش موجودی' },
  adjust: { label: 'تنظیم دستی' },
  reserve: { label: 'رزرو سفارش' },
  release: { label: 'آزادسازی رزرو' },
  return: { label: 'مرجوعی' },
  refund: { label: 'بازپرداخت' },
  correction: { label: 'اصلاح' },
}

export function emptyWarehouseForm(): SellerWarehouseFormValues {
  return {
    id: '',
    name: '',
    code: '',
    city: '',
    address: '',
    status: 'active',
    isDefault: false,
  }
}

export function toWarehouseForm(w: SellerWarehouse): SellerWarehouseFormValues {
  return {
    id: w.id,
    name: w.name,
    code: w.code,
    city: w.city,
    address: w.address,
    status: w.status,
    isDefault: w.isDefault,
  }
}

export function buildDefaultWarehouses(): SellerWarehouse[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'wh-tehran',
      name: 'انبار مرکزی تهران',
      code: 'THR-01',
      city: 'تهران',
      address: 'جاده قدیم کرج، کیلومتر ۱۲',
      status: 'active',
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'wh-karaj',
      name: 'انبار کرج',
      code: 'KRJ-01',
      city: 'کرج',
      address: 'شهرک صنعتی سیمین دشت',
      status: 'active',
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function buildDefaultStockMovements(): SellerStockMovement[] {
  const base = Date.now()
  return [
    {
      id: 'mov-1',
      productId: 'iphone-16-pro',
      productTitle: 'آیفون ۱۶ پرو',
      variantId: null,
      variantLabel: null,
      warehouseId: 'wh-tehran',
      type: 'add',
      quantity: 20,
      before: 0,
      after: 20,
      reason: 'ورود محموله',
      actorName: 'سارا محصولی',
      createdAt: new Date(base - 3 * 86400_000).toISOString(),
    },
    {
      id: 'mov-2',
      productId: 'iphone-16-pro',
      productTitle: 'آیفون ۱۶ پرو',
      variantId: null,
      variantLabel: null,
      warehouseId: 'wh-tehran',
      type: 'reserve',
      quantity: -2,
      before: 20,
      after: 18,
      reason: 'رزرو سفارش SL-20411',
      actorName: 'سیستم',
      createdAt: new Date(base - 1 * 86400_000).toISOString(),
    },
    {
      id: 'mov-3',
      productId: 'sony-xm5',
      productTitle: 'سونی XM5',
      variantId: null,
      variantLabel: null,
      warehouseId: 'wh-tehran',
      type: 'adjust',
      quantity: -3,
      before: 35,
      after: 32,
      reason: 'اصلاح شمارش انبار',
      actorName: 'مدیر اصلی',
      createdAt: new Date(base - 5 * 3600_000).toISOString(),
    },
    {
      id: 'mov-4',
      productId: 'jbl-charge-5',
      productTitle: 'JBL Charge 5',
      variantId: null,
      variantLabel: null,
      warehouseId: 'wh-karaj',
      type: 'remove',
      quantity: -8,
      before: 8,
      after: 0,
      reason: 'اتمام موجودی',
      actorName: 'سیستم',
      createdAt: new Date(base - 10 * 86400_000).toISOString(),
    },
  ]
}
