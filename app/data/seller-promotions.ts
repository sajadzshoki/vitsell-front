import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '~/data/seller-deals'

import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import {
  emptyMarketingTargeting,
  type SellerMarketingDiscountType,
  type SellerMarketingTargeting,
} from '~/data/seller-marketing-shared'

export type SellerDiscountCode = {
  code: string
  /** درصد ۱–۹۹ — فیلد API */
  percent: number
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: number
  oncePerUser: boolean
  createdAt: string | null
  updatedAt: string | null
  /** FE overlay / future API */
  name?: string
  description?: string
  discountType?: SellerMarketingDiscountType
  fixedAmount?: number
  maxDiscount?: number | null
  usageLimit?: number | null
  usageCount?: number
  perCustomerLimit?: number | null
  priority?: number
  targeting?: SellerMarketingTargeting
  totalDiscountAmount?: number
  seo?: SeoMeta | null
}

export type SellerDiscountCodeForm = {
  code: string
  percent: string
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: string
  oncePerUser: boolean
  name: string
  description: string
  discountType: SellerMarketingDiscountType
  fixedAmount: string
  maxDiscount: string
  usageLimit: string
  perCustomerLimit: string
  priority: number
  targeting: SellerMarketingTargeting
  seo: SeoMeta
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
    name: '',
    description: '',
    discountType: 'percent',
    fixedAmount: '0',
    maxDiscount: '',
    usageLimit: '',
    perCustomerLimit: '1',
    priority: 100,
    targeting: emptyMarketingTargeting(),
    seo: emptySeoMeta(),
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
    name: raw.name ?? '',
    description: raw.description ?? '',
    discountType: raw.discountType === 'fixed' ? 'fixed' : 'percent',
    fixedAmount: Math.max(0, Math.round(Number(raw.fixedAmount ?? 0))),
    maxDiscount: raw.maxDiscount == null ? null : Math.max(0, Math.round(Number(raw.maxDiscount))),
    usageLimit: raw.usageLimit == null ? null : Math.max(0, Math.round(Number(raw.usageLimit))),
    usageCount: Math.max(0, Math.round(Number(raw.usageCount ?? 0))),
    perCustomerLimit: raw.perCustomerLimit == null
      ? (raw.oncePerUser ? 1 : null)
      : Math.max(0, Math.round(Number(raw.perCustomerLimit))),
    priority: Math.max(0, Math.round(Number(raw.priority ?? 100))),
    targeting: raw.targeting
      ? { ...emptyMarketingTargeting(), ...raw.targeting }
      : emptyMarketingTargeting(),
    totalDiscountAmount: Math.max(0, Math.round(Number(raw.totalDiscountAmount ?? 0))),
    seo: raw.seo ? { ...emptySeoMeta(), ...raw.seo } : null,
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
    name: item.name || '',
    description: item.description || '',
    discountType: item.discountType || 'percent',
    fixedAmount: String(item.fixedAmount ?? 0),
    maxDiscount: item.maxDiscount == null ? '' : String(item.maxDiscount),
    usageLimit: item.usageLimit == null ? '' : String(item.usageLimit),
    perCustomerLimit: item.perCustomerLimit == null ? '' : String(item.perCustomerLimit),
    priority: item.priority ?? 100,
    targeting: item.targeting
      ? { ...emptyMarketingTargeting(), ...item.targeting }
      : emptyMarketingTargeting(),
    seo: item.seo ? { ...emptySeoMeta(), ...item.seo } : emptySeoMeta(),
  }
}

export function formToDiscountCodePayload(
  form: SellerDiscountCodeForm,
): SellerDiscountCodeApiPayload {
  return {
    code: form.code.trim().toUpperCase(),
    percent: form.discountType === 'fixed'
      ? 1
      : clampPercent(Number(form.percent)),
    active: form.active,
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    minAmount: Math.max(0, Math.round(Number(form.minAmount) || 0)),
    oncePerUser: form.oncePerUser || Number(form.perCustomerLimit) === 1,
  }
}

/** Merge API code with FE overlay fields from form */
export function applyCouponOverlay(
  base: SellerDiscountCode,
  form: SellerDiscountCodeForm,
): SellerDiscountCode {
  const maxRaw = form.maxDiscount.trim()
  const usageRaw = form.usageLimit.trim()
  const perRaw = form.perCustomerLimit.trim()
  return {
    ...base,
    name: form.name.trim(),
    description: form.description.trim(),
    discountType: form.discountType,
    fixedAmount: Math.max(0, Math.round(Number(form.fixedAmount) || 0)),
    maxDiscount: maxRaw ? Math.max(0, Math.round(Number(maxRaw) || 0)) : null,
    usageLimit: usageRaw ? Math.max(0, Math.round(Number(usageRaw) || 0)) : null,
    perCustomerLimit: perRaw ? Math.max(0, Math.round(Number(perRaw) || 0)) : null,
    priority: Math.max(0, Math.round(Number(form.priority) || 0)),
    targeting: { ...emptyMarketingTargeting(), ...form.targeting },
    seo: { ...emptySeoMeta(), ...form.seo },
    oncePerUser: form.oncePerUser || Number(form.perCustomerLimit) === 1,
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
