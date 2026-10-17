export type CheckoutStepId = 0 | 1 | 2 | 3 | 4

export type CheckoutAddress = {
  id: string
  title: string
  fullName: string
  phone: string
  province: string
  city: string
  address: string
  postalCode: string
  isDefault?: boolean
}

export type CheckoutShippingId = string
export type CheckoutPaymentId = 'online' | 'cod' | 'installment'

export type CheckoutShippingOption = {
  id: string
  name: string
  desc: string
  price: number
  icon: string
  coverage?: 'nationwide' | 'cities'
  slotsEnabled?: boolean
  expressEnabled?: boolean
  expressPrice?: number
  expressDeadlineHour?: number
}

export type CheckoutAvailabilitySlot = {
  startTime: string
  endTime: string
  capacity: number
  remaining: number
  full: boolean
  price: number
  selectable: boolean
}

export type CheckoutAvailabilityDay = {
  date: string
  weekday: number
  label: string
  isHoliday: boolean
  isFriday: boolean
  isClosed: boolean
  hasSelectable: boolean
  slots: CheckoutAvailabilitySlot[]
}

export type CheckoutAddressForm = {
  title: string
  fullName: string
  phone: string
  province: string
  city: string
  address: string
  postalCode: string
}

export const checkoutSteps = [
  { id: 0 as CheckoutStepId, name: 'سبد خرید' },
  { id: 1 as CheckoutStepId, name: 'آدرس تحویل' },
  { id: 2 as CheckoutStepId, name: 'روش ارسال' },
  { id: 3 as CheckoutStepId, name: 'روش پرداخت' },
  { id: 4 as CheckoutStepId, name: 'بازبینی سفارش' },
]

export const defaultAddresses: CheckoutAddress[] = [
  {
    id: 'a1',
    title: 'خانه',
    fullName: 'علی احمدی',
    phone: '09121234567',
    province: 'تهران',
    city: 'تهران',
    address: 'خیابان ولیعصر، بالاتر از میدان ونک، کوچه شهید احمدی، پلاک ۱۲، واحد ۳',
    postalCode: '1435698765',
    isDefault: true,
  },
]

export const emptyAddressForm = (): CheckoutAddressForm => ({
  title: '',
  fullName: '',
  phone: '',
  province: 'تهران',
  city: 'تهران',
  address: '',
  postalCode: '',
})

export const addressToForm = (address: CheckoutAddress): CheckoutAddressForm => ({
  title: address.title,
  fullName: address.fullName,
  phone: address.phone,
  province: address.province,
  city: address.city,
  address: address.address,
  postalCode: address.postalCode,
})

export const checkoutShippingOptions: CheckoutShippingOption[] = [
  {
    id: 'express',
    name: 'پیک اکسپرس',
    desc: 'تحویل ۲۴ ساعته در تهران',
    price: 45_000,
    icon: 'bolt',
  },
  {
    id: 'post',
    name: 'پست پیشتاز',
    desc: '۳ تا ۵ روز کاری',
    price: 40_000,
    icon: 'truck-delivery',
  },
  {
    id: 'pickup',
    name: 'دریافت حضوری',
    desc: 'از فروشگاه در تهران',
    price: 0,
    icon: 'building-store',
  },
]

export function shippingOptionIcon(id: string, name: string) {
  const key = `${id} ${name}`.toLowerCase()
  if (key.includes('pickup') || name.includes('حضوری')) return 'building-store'
  if (key.includes('express') || name.includes('پیک')) return 'bolt'
  if (name.includes('تیپاکس') || key.includes('tipax')) return 'truck'
  if (key.includes('post') || name.includes('پست')) return 'truck-delivery'
  return 'truck-delivery'
}

export const checkoutPaymentOptions = [
  {
    id: 'online' as CheckoutPaymentId,
    name: 'پرداخت آنلاین',
    desc: 'پرداخت با کارت‌های عضو شتاب',
    icon: 'credit-card',
  },
  {
    id: 'cod' as CheckoutPaymentId,
    name: 'پرداخت در محل',
    desc: 'پرداخت هنگام تحویل کالا',
    icon: 'cash',
  },
  {
    id: 'installment' as CheckoutPaymentId,
    name: 'پرداخت اقساطی',
    desc: 'با اعتبار دیجی‌پی و ازکی',
    icon: 'calendar-stats',
  },
]

export const checkoutGateways = ['ملت', 'پارسیان', 'سامان', 'زرین‌پال']
