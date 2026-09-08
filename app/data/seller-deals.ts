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
  /** FE overlay / extended fields */
  name?: string
  specialPrice?: number | null
  maxQuantity?: number | null
  perCustomerLimit?: number | null
  priority?: number
  variantId?: string | null
}

export type SellerAmazingDealFormValues = {
  id: string
  productId: string
  discountPercent: string
  startsAt: string
  endsAt: string
  active: boolean
  name: string
  specialPrice: string
  maxQuantity: string
  perCustomerLimit: string
  priority: number
  variantId: string
}

export type SellerAmazingDealApiPayload = {
  id?: string
  productId: string
  discountPercent: number
  startsAt: string
  endsAt: string
  active: boolean
}

export const amazingDealIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function clampPercent(value: number) {
  return Math.min(99, Math.max(1, Math.round(value) || 1))
}

export function dealPriceFrom(price: number, percent: number) {
  return Math.max(0, Math.round(price * (1 - clampPercent(percent) / 100)))
}

export function formatDealRange(startsAt: string, endsAt: string) {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return `${fmt(startsAt)} → ${fmt(endsAt)}`
}

export function isDealLive(deal: SellerAmazingDeal, now = Date.now()) {
  return isAmazingDealLive(deal, now)
}

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Math.round(Number(t))
  return Number.isFinite(n) && n >= 0 ? n : null
}

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
    name: '',
    specialPrice: '',
    maxQuantity: '',
    perCustomerLimit: '',
    priority: 100,
    variantId: '',
  }
}

export function toAmazingDeal(raw: Partial<SellerAmazingDeal> & { id: string, productId: string }): SellerAmazingDeal {
  return {
    id: raw.id,
    productId: raw.productId,
    discountPercent: clampPercent(Number(raw.discountPercent ?? 1)),
    startsAt: raw.startsAt || new Date().toISOString(),
    endsAt: raw.endsAt || new Date().toISOString(),
    active: Boolean(raw.active),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    name: raw.name ?? '',
    specialPrice: raw.specialPrice == null ? null : Math.max(0, Math.round(Number(raw.specialPrice))),
    maxQuantity: raw.maxQuantity == null ? null : Math.max(0, Math.round(Number(raw.maxQuantity))),
    perCustomerLimit: raw.perCustomerLimit == null ? null : Math.max(0, Math.round(Number(raw.perCustomerLimit))),
    priority: Math.max(0, Math.round(Number(raw.priority ?? 100))),
    variantId: raw.variantId?.trim() || null,
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
    name: deal.name || '',
    specialPrice: deal.specialPrice == null ? '' : String(deal.specialPrice),
    maxQuantity: deal.maxQuantity == null ? '' : String(deal.maxQuantity),
    perCustomerLimit: deal.perCustomerLimit == null ? '' : String(deal.perCustomerLimit),
    priority: deal.priority ?? 100,
    variantId: deal.variantId || '',
  }
}

export function formToAmazingDealPayload(form: SellerAmazingDealFormValues): SellerAmazingDealApiPayload {
  const payload: SellerAmazingDealApiPayload = {
    productId: form.productId.trim(),
    discountPercent: clampPercent(Number(form.discountPercent)),
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    active: form.active,
  }
  const id = form.id.trim()
  if (id) payload.id = id
  return payload
}

export function applyDealOverlay(
  base: SellerAmazingDeal,
  form: SellerAmazingDealFormValues,
): SellerAmazingDeal {
  return {
    ...base,
    name: form.name.trim(),
    specialPrice: parseOptionalNumber(form.specialPrice),
    maxQuantity: parseOptionalNumber(form.maxQuantity),
    perCustomerLimit: parseOptionalNumber(form.perCustomerLimit),
    priority: Math.max(0, Math.round(Number(form.priority) || 0)),
    variantId: form.variantId.trim() || null,
  }
}

export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

export function isAmazingDealLive(deal: SellerAmazingDeal, now = Date.now()) {
  if (!deal.active) return false
  const start = new Date(deal.startsAt).getTime()
  const end = new Date(deal.endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return now >= start && now <= end
}
