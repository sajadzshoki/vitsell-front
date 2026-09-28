import type { CheckoutAddress } from '~/data/checkout'
import { defaultAddresses } from '~/data/checkout'

export type AccountTabId =
  | 'dashboard'
  | 'wishlist'
  | 'orders'
  | 'reviews'
  | 'wallet'
  | 'addresses'
  | 'profile'

/** Storefront status follows the seller fulfillment status. Legacy buyer values stay for older rows. */
export type OrderStatus =
  | 'new'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'cancelled'
  | 'shipping'
  | 'processing'

export type OrderItem = {
  productId: string
  qty: number
  price: number
  variantId?: string | null
  variantLabel?: string
}

export const accountOrderStatusFilters = [
  { id: 'all', label: 'همه', statuses: null },
  { id: 'new', label: 'سفارش جدید', statuses: ['new'] },
  { id: 'packing', label: 'در حال آماده‌سازی', statuses: ['packing', 'processing'] },
  { id: 'shipped', label: 'ارسال شده', statuses: ['shipped', 'shipping'] },
  { id: 'delivered', label: 'تحویل شده', statuses: ['delivered'] },
  { id: 'returned', label: 'مرجوعی', statuses: ['returned'] },
  { id: 'cancelled', label: 'لغو شده', statuses: ['cancelled'] },
] as const

export type AccountOrderStatusFilterId = (typeof accountOrderStatusFilters)[number]['id']

export const orderReturnHoldStatuses = [
  'requested',
  'approved',
  'received',
  'processing',
  'completed',
] as const

export type AccountOrderReturnItem = {
  productId: string
  productTitle: string
  variantId?: string | null
  variantLabel?: string | null
  qty: number
  unitPrice: number
}

export type AccountOrderReturn = {
  id: string
  orderId: string
  status: string
  reason: string
  adminNote: string
  requestedAt: string
  photos: string[]
  items: AccountOrderReturnItem[]
}

export type ShopOrder = {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  shippingMethod: string
  paymentMethod: string
  address: CheckoutAddress
  trackingCode?: string
  carrier?: string
  /** Present on order detail only. One code per seller sub-order. */
  deliveryCodes?: { id: string, code: string }[]
}

export type AccountProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birth: string
  gender: string
  avatar?: string
  hasPassword?: boolean
  role?: 'customer' | 'seller' | 'admin' | 'courier'
  /** Staff admin id (users.id) when role=admin */
  adminId?: string
  adminStatus?: 'active' | 'inactive' | 'suspended'
  roleIds?: string[]
  abilities?: string[]
  primaryRoleKey?: string | null
}

export const defaultProfile: AccountProfile = {
  firstName: 'علی',
  lastName: 'احمدی',
  email: 'ali.ahmadi@example.com',
  phone: '09121234567',
  birth: '۱۳۷۰/۰۵/۱۲',
  gender: 'مرد',
  hasPassword: false,
}

export const accountNavItems: {
  id: AccountTabId
  label: string
  icon: string
  to: string
}[] = [
  { id: 'dashboard', label: 'پیشخوان', icon: 'i-tabler-layout-dashboard', to: '/account' },
  { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: 'i-tabler-heart', to: '/account/wishlist' },
  { id: 'orders', label: 'سفارش‌های من', icon: 'i-tabler-package', to: '/account/orders' },
  { id: 'wallet', label: 'کیف پول', icon: 'i-tabler-wallet', to: '/account/wallet' },
  { id: 'reviews', label: 'نظرات و پرسش‌ها', icon: 'i-tabler-message-2', to: '/account/reviews' },
  { id: 'addresses', label: 'آدرس‌ها', icon: 'i-tabler-map-pin', to: '/account/addresses' },
  { id: 'profile', label: 'اطلاعات حساب', icon: 'i-tabler-user', to: '/account/profile' },
]

export const orderStatusMeta: Record<
  OrderStatus,
  {
    label: string
    color: 'success' | 'info' | 'warning' | 'primary' | 'error' | 'neutral'
    icon: string
    step: number
  }
> = {
  new: {
    label: 'سفارش جدید',
    color: 'warning',
    icon: 'i-tabler-bell',
    step: 0,
  },
  packing: {
    label: 'در حال آماده‌سازی',
    color: 'info',
    icon: 'i-tabler-box',
    step: 1,
  },
  shipped: {
    label: 'ارسال شده',
    color: 'primary',
    icon: 'i-tabler-truck-delivery',
    step: 2,
  },
  delivered: {
    label: 'تحویل شده',
    color: 'success',
    icon: 'i-tabler-check',
    step: 3,
  },
  returned: {
    label: 'مرجوعی',
    color: 'error',
    icon: 'i-tabler-arrow-back-up',
    step: 0,
  },
  cancelled: {
    label: 'لغو شده',
    color: 'neutral',
    icon: 'i-tabler-x',
    step: 0,
  },
  shipping: {
    label: 'ارسال شده',
    color: 'primary',
    icon: 'i-tabler-truck-delivery',
    step: 2,
  },
  processing: {
    label: 'در حال آماده‌سازی',
    color: 'info',
    icon: 'i-tabler-box',
    step: 1,
  },
}

export const orderTrackingSteps = [
  'ثبت سفارش',
  'در حال آماده‌سازی',
  'ارسال شد',
  'تحویل داده شد',
]

const defaultAddress = defaultAddresses[0]!

export const defaultOrders: ShopOrder[] = [
  {
    id: 'BZ-108452',
    date: '۱۴۰۳/۰۸/۱۲',
    status: 'delivered',
    items: [
      { productId: 'apple-watch-ultra', qty: 1, price: 21_800_000 },
      { productId: 'sony-xm5', qty: 1, price: 18_500_000 },
    ],
    total: 40_300_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
    address: defaultAddress,
  },
  {
    id: 'BZ-108911',
    date: '۱۴۰۳/۰۹/۰۳',
    status: 'shipping',
    items: [{ productId: 'sony-xm5', qty: 1, price: 18_500_000 }],
    total: 18_500_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت در محل',
    address: defaultAddress,
  },
  {
    id: 'BZ-109204',
    date: '۱۴۰۳/۰۹/۱۸',
    status: 'processing',
    items: [{ productId: 'iphone-16-pro', qty: 1, price: 89_900_000 }],
    total: 89_900_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
    address: defaultAddress,
  },
  {
    id: 'BZ-107833',
    date: '۱۴۰۳/۰۷/۲۱',
    status: 'cancelled',
    items: [{ productId: 'ps5-pro', qty: 1, price: 32_500_000 }],
    total: 32_500_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
    address: defaultAddress,
  },
]
