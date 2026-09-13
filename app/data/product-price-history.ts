import type { Product } from '~/data/products'

export type ProductPricePoint = {
  /** ISO date for ordering */
  date: string
  /** Persian calendar label e.g. ۱۰ - مرداد */
  label: string
  price: number
  inStock: boolean
  seller: string
  warranty: string
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const

function hashId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h || 1
}

function toPersianDayLabel(date: Date) {
  // Approximate Jalali-style label without heavy deps (demo mock only)
  const gMonth = date.getMonth()
  const day = date.getDate()
  const monthName = PERSIAN_MONTHS[Math.min(11, Math.max(0, (gMonth + 9) % 12))]!
  return `${day.toLocaleString('fa-IR')} - ${monthName}`
}

/**
 * Mock price history for product detail chart (API later).
 * ~45 daily points ending today, with a short out-of-stock gap.
 */
export function getProductPriceHistory(product: Product, days = 45): ProductPricePoint[] {
  const seed = hashId(product.id)
  const end = product.price
  const start = product.oldPrice && product.oldPrice > end
    ? Number(product.oldPrice)
    : Math.round(end * (1.08 + (seed % 7) / 100))

  const points: ProductPricePoint[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const oosStart = 18 + (seed % 5)
  const oosLen = 4 + (seed % 3)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)

    const t = (days - 1 - i) / Math.max(1, days - 1)
    const wave = Math.sin((i + seed) * 0.35) * 0.015 + Math.cos((i + seed) * 0.11) * 0.01
    const price = Math.round(start + (end - start) * t + start * wave)
    const dayIndex = days - 1 - i
    const inStock = !(dayIndex >= oosStart && dayIndex < oosStart + oosLen)

    points.push({
      date: d.toISOString().slice(0, 10),
      label: toPersianDayLabel(d),
      price: Math.max(Math.round(end * 0.85), price),
      inStock,
      seller: 'فروشگاه رسمی ویتسل',
      warranty: '۱۸ ماه گارانتی اصالت و سلامت فیزیکی',
    })
  }

  // Last point matches current product price / stock
  const last = points[points.length - 1]
  if (last) {
    last.price = product.price
    last.inStock = product.inStock !== false
  }

  return points
}
