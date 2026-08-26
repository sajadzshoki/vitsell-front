export type CartShippingMethod = 'express' | 'post'

export type CartShippingOption = {
  id: CartShippingMethod
  name: string
  desc: string
}

export const cartShippingOptions: CartShippingOption[] = [
  {
    id: 'express',
    name: 'پیک اکسپرس',
    desc: 'تحویل ۲۴ ساعته',
  },
  {
    id: 'post',
    name: 'پست پیشتاز',
    desc: '۳ تا ۵ روز کاری',
  },
]

/** Valid promo codes → percent off subtotal */
export const cartDiscountCodes: Record<string, number> = {
  BAZAR10: 0.1,
  WELCOME20: 0.2,
  TECH15: 0.15,
}

export const cartFreeShippingThreshold = 500_000

export function getShippingPrice(
  method: CartShippingMethod | 'pickup',
  subtotal: number,
): number {
  if (method === 'pickup') return 0
  if (subtotal <= 0) return 0
  const freeEligible = subtotal >= cartFreeShippingThreshold
  if (method === 'express') return freeEligible ? 45_000 : 55_000
  return freeEligible ? 0 : 40_000
}
