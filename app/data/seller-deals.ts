import { products } from '~/data/products'

export type SellerAmazingDeal = {
  id: string
  productId: string
  /** درصد تخفیف ۱–۹۹ */
  discountPercent: number
  startsAt: string
  endsAt: string
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SellerAmazingDealFormValues = {
  id: string
  productId: string
  discountPercent: string
  startsAt: string
  endsAt: string
  active: boolean
}

export const amazingDealIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyAmazingDealForm(): SellerAmazingDealFormValues {
  const start = new Date()
  const end = new Date(start.getTime() + 24 * 3600 * 1000)
  return {
    id: '',
    productId: '',
    discountPercent: '20',
    startsAt: toDatetimeLocalValue(start),
    endsAt: toDatetimeLocalValue(end),
    active: true,
  }
}

export function toAmazingDealForm(deal: SellerAmazingDeal): SellerAmazingDealFormValues {
  return {
    id: deal.id,
    productId: deal.productId,
    discountPercent: String(deal.discountPercent),
    startsAt: toDatetimeLocalValue(new Date(deal.startsAt)),
    endsAt: toDatetimeLocalValue(new Date(deal.endsAt)),
    active: deal.active,
  }
}

export function formToAmazingDeal(
  form: SellerAmazingDealFormValues,
  previous?: SellerAmazingDeal | null,
): SellerAmazingDeal {
  const now = new Date().toISOString()
  return {
    id: form.id.trim(),
    productId: form.productId.trim(),
    discountPercent: clampPercent(Number(form.discountPercent)),
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    active: form.active,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(99, Math.max(1, Math.round(value)))
}

export function dealPriceFrom(basePrice: number, discountPercent: number) {
  const percent = clampPercent(discountPercent)
  return Math.max(0, Math.round(basePrice * (100 - percent) / 100))
}

export function toDatetimeLocalValue(date: Date) {
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return new Date().toISOString()
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

export function formatDealRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const fmt = (d: Date) => {
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return `${fmt(start)} → ${fmt(end)}`
}

export function isDealLive(deal: SellerAmazingDeal, now = Date.now()) {
  if (!deal.active) return false
  const start = new Date(deal.startsAt).getTime()
  const end = new Date(deal.endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return now >= start && now <= end
}

/** Seed از محصولاتی که قیمت قبلی دارند */
export function buildDefaultAmazingDeals(): SellerAmazingDeal[] {
  const now = Date.now()
  const startsAt = new Date(now - 3600_000).toISOString()
  const endsAt = new Date(now + 6 * 3600_000).toISOString()
  const stamped = new Date().toISOString()

  return products
    .filter(p => p.oldPrice && p.oldPrice > p.price)
    .slice(0, 6)
    .map((p, index) => {
      const discountPercent = Math.min(
        99,
        Math.max(1, Math.round((1 - p.price / p.oldPrice!) * 100)),
      )
      return {
        id: `deal-${p.id}`,
        productId: p.id,
        discountPercent,
        startsAt,
        endsAt,
        active: index < 4,
        createdAt: stamped,
        updatedAt: stamped,
      }
    })
}
