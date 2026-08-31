import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '~/data/seller-deals'

export type SellerDiscountCode = {
  code: string
  /** درصد ۱–۹۹ */
  percent: number
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: number
  oncePerUser: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SellerDiscountCodeForm = {
  code: string
  percent: string
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: string
  oncePerUser: boolean
}

export type SellerDiscountCodeApiPayload = {
  code?: string
  percent: number
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: number
  oncePerUser: boolean
}

export type SellerPromoTone = 'primary' | 'warning'

export type SellerContentPromo = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  tone: SellerPromoTone
  icon: string
  primaryCtaLabel: string
  primaryCtaTo: string
  secondaryCtaLabel: string
  secondaryCtaTo: string
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SellerContentPromoForm = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  tone: SellerPromoTone
  icon: string
  primaryCtaLabel: string
  primaryCtaTo: string
  secondaryCtaLabel: string
  secondaryCtaTo: string
  active: boolean
}

export type SellerContentPromoApiPayload = {
  id?: string
  eyebrow: string
  title: string
  subtitle: string
  tone: SellerPromoTone
  icon: string
  primaryCtaLabel: string
  primaryCtaTo: string
  secondaryCtaLabel: string
  secondaryCtaTo: string
  active: boolean
}

export const discountCodePattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/
export const promoIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const sellerPromoToneMeta: Record<
  SellerPromoTone,
  { label: string, color: 'primary' | 'warning' }
> = {
  primary: { label: 'اصلی', color: 'primary' },
  warning: { label: 'هشدار / ویژه', color: 'warning' },
}

function clampPercent(value: number) {
  return Math.min(99, Math.max(1, Math.round(value) || 1))
}

export function emptyDiscountCodeForm(): SellerDiscountCodeForm {
  const start = new Date()
  const end = new Date(start.getTime() + 30 * 24 * 3600_000)
  return {
    code: '',
    percent: '10',
    active: true,
    startsAt: toDatetimeLocalValue(start),
    endsAt: toDatetimeLocalValue(end),
    minAmount: '0',
    oncePerUser: true,
  }
}

export function toDiscountCode(
  raw: Partial<SellerDiscountCode> & { code: string },
): SellerDiscountCode {
  return {
    code: String(raw.code).toUpperCase(),
    percent: clampPercent(Number(raw.percent ?? 1)),
    active: Boolean(raw.active),
    startsAt: raw.startsAt ?? new Date().toISOString(),
    endsAt: raw.endsAt ?? new Date().toISOString(),
    minAmount: Math.max(0, Math.round(Number(raw.minAmount ?? 0))),
    oncePerUser: Boolean(raw.oncePerUser),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  }
}

export function toDiscountCodeForm(item: SellerDiscountCode): SellerDiscountCodeForm {
  return {
    code: item.code,
    percent: String(item.percent),
    active: item.active,
    startsAt: toDatetimeLocalValue(new Date(item.startsAt)),
    endsAt: toDatetimeLocalValue(new Date(item.endsAt)),
    minAmount: String(item.minAmount),
    oncePerUser: item.oncePerUser,
  }
}

export function formToDiscountCodePayload(
  form: SellerDiscountCodeForm,
): SellerDiscountCodeApiPayload {
  return {
    code: form.code.trim().toUpperCase(),
    percent: clampPercent(Number(form.percent)),
    active: form.active,
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    minAmount: Math.max(0, Math.round(Number(form.minAmount) || 0)),
    oncePerUser: form.oncePerUser,
  }
}

export function emptyContentPromoForm(): SellerContentPromoForm {
  return {
    id: '',
    eyebrow: '',
    title: '',
    subtitle: '',
    tone: 'primary',
    icon: 'sparkles',
    primaryCtaLabel: '',
    primaryCtaTo: '',
    secondaryCtaLabel: '',
    secondaryCtaTo: '',
    active: true,
  }
}

export function toContentPromo(
  raw: Partial<SellerContentPromo> & { id: string },
): SellerContentPromo {
  return {
    id: raw.id,
    eyebrow: raw.eyebrow ?? '',
    title: raw.title ?? '',
    subtitle: raw.subtitle ?? '',
    tone: raw.tone === 'warning' ? 'warning' : 'primary',
    icon: raw.icon?.trim() || 'sparkles',
    primaryCtaLabel: raw.primaryCtaLabel ?? '',
    primaryCtaTo: raw.primaryCtaTo ?? '',
    secondaryCtaLabel: raw.secondaryCtaLabel ?? '',
    secondaryCtaTo: raw.secondaryCtaTo ?? '',
    active: Boolean(raw.active),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  }
}

export function toContentPromoForm(item: SellerContentPromo): SellerContentPromoForm {
  return {
    id: item.id,
    eyebrow: item.eyebrow,
    title: item.title,
    subtitle: item.subtitle,
    tone: item.tone,
    icon: item.icon,
    primaryCtaLabel: item.primaryCtaLabel,
    primaryCtaTo: item.primaryCtaTo,
    secondaryCtaLabel: item.secondaryCtaLabel,
    secondaryCtaTo: item.secondaryCtaTo,
    active: item.active,
  }
}

export function formToContentPromoPayload(
  form: SellerContentPromoForm,
): SellerContentPromoApiPayload {
  return {
    id: form.id.trim(),
    eyebrow: form.eyebrow.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    tone: form.tone,
    icon: form.icon.trim() || 'sparkles',
    primaryCtaLabel: form.primaryCtaLabel.trim(),
    primaryCtaTo: form.primaryCtaTo.trim(),
    secondaryCtaLabel: form.secondaryCtaLabel.trim(),
    secondaryCtaTo: form.secondaryCtaTo.trim(),
    active: form.active,
  }
}

export function formatMoneyFa(amount: number) {
  return amount.toLocaleString('fa-IR')
}

export function formatPromoRange(startsAt: string, endsAt: string) {
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

export function isDiscountCodeLive(item: SellerDiscountCode, now = Date.now()) {
  if (!item.active) return false
  const start = new Date(item.startsAt).getTime()
  const end = new Date(item.endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return now >= start && now <= end
}
