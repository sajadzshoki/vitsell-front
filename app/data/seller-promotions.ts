import { cartDiscountCodes } from '~/data/cart'
import { homePromos, type HomePromo } from '~/data/home'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '~/data/seller-deals'

export type SellerDiscountCode = {
  code: string
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

export type SellerPromoTone = HomePromo['tone']

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

export const discountCodePattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/

export const sellerPromoToneMeta: Record<
  SellerPromoTone,
  { label: string, color: 'primary' | 'warning' }
> = {
  primary: { label: 'اصلی', color: 'primary' },
  warning: { label: 'هشدار / ویژه', color: 'warning' },
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

export function formToDiscountCode(
  form: SellerDiscountCodeForm,
  previous?: SellerDiscountCode | null,
): SellerDiscountCode {
  const now = new Date().toISOString()
  const percent = Math.min(99, Math.max(1, Math.round(Number(form.percent) || 1)))
  const minAmount = Math.max(0, Math.round(Number(form.minAmount) || 0))
  return {
    code: form.code.trim().toUpperCase(),
    percent,
    active: form.active,
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    minAmount,
    oncePerUser: form.oncePerUser,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
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

export function formToContentPromo(
  form: SellerContentPromoForm,
  previous?: SellerContentPromo | null,
): SellerContentPromo {
  const now = new Date().toISOString()
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
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
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

export function buildDefaultDiscountCodes(): SellerDiscountCode[] {
  const now = Date.now()
  const startsAt = new Date(now - 7 * 24 * 3600_000).toISOString()
  const endsAt = new Date(now + 60 * 24 * 3600_000).toISOString()
  const stamped = new Date().toISOString()

  return Object.entries(cartDiscountCodes).map(([code, ratio], index) => ({
    code,
    percent: Math.round(ratio * 100),
    active: true,
    startsAt,
    endsAt,
    minAmount: index === 0 ? 0 : 500_000,
    oncePerUser: code.startsWith('WELCOME'),
    createdAt: stamped,
    updatedAt: stamped,
  }))
}

export function buildDefaultContentPromos(): SellerContentPromo[] {
  const stamped = new Date().toISOString()
  return homePromos.map(promo => ({
    id: promo.id,
    eyebrow: promo.eyebrow,
    title: promo.title,
    subtitle: promo.subtitle,
    tone: promo.tone,
    icon: promo.icon,
    primaryCtaLabel: promo.primaryCta.label,
    primaryCtaTo: promo.primaryCta.to ?? '',
    secondaryCtaLabel: promo.secondaryCta?.label ?? '',
    secondaryCtaTo: promo.secondaryCta?.to ?? '',
    active: true,
    createdAt: stamped,
    updatedAt: stamped,
  }))
}

export const promoIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
