import type { CheckoutAddress } from '~/data/checkout'
import { defaultAddresses } from '~/data/checkout'

export type AccountTabId = 'dashboard' | 'orders' | 'addresses' | 'profile'

export type OrderStatus = 'delivered' | 'shipping' | 'processing' | 'cancelled'

export type OrderItem = {
  productId: string
  qty: number
  price: number
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
}

export type AccountProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birth: string
  gender: string
}

export const defaultProfile: AccountProfile = {
  firstName: 'علی',
  lastName: 'احمدی',
  email: 'ali.ahmadi@example.com',
  phone: '09121234567',
  birth: '۱۳۷۰/۰۵/۱۲',
  gender: 'مرد',
}

export const accountNavItems: {
  id: AccountTabId
  label: string
  icon: string
  to: string
}[] = [
  { id: 'dashboard', label: 'پیشخوان', icon: 'i-tabler-layout-dashboard', to: '/account' },
  { id: 'orders', label: 'سفارش‌های من', icon: 'i-tabler-package', to: '/account/orders' },
  { id: 'addresses', label: 'آدرس‌ها', icon: 'i-tabler-map-pin', to: '/account/addresses' },
  { id: 'profile', label: 'اطلاعات حساب', icon: 'i-tabler-user', to: '/account/profile' },
]

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; color: 'success' | 'info' | 'warning' | 'neutral'; icon: string; step: number }
> = {
  delivered: {
    label: 'تحویل شده',
    color: 'success',
    icon: 'i-tabler-check',
    step: 3,
  },
  shipping: {
    label: 'در حال ارسال',
    color: 'info',
    icon: 'i-tabler-truck-delivery',
    step: 2,
  },
  processing: {
    label: 'در حال پردازش',
    color: 'warning',
    icon: 'i-tabler-clock',
    step: 1,
  },
  cancelled: {
    label: 'لغو شده',
    color: 'neutral',
    icon: 'i-tabler-x',
    step: 0,
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
