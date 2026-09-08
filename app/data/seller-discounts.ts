import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import {
  emptyMarketingTargeting,
  type SellerMarketingDiscountType,
  type SellerMarketingTargeting,
} from '~/data/seller-marketing-shared'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '~/data/seller-deals'

export type SellerDiscountStatus = 'active' | 'inactive'

export type SellerDiscount = {
  id: string
  name: string
  description: string
  type: SellerMarketingDiscountType
  value: number
  minOrder: number
  maxDiscount: number | null
  startsAt: string | null
  endsAt: string | null
  status: SellerDiscountStatus
  usageLimit: number | null
  usageCount: number
  perCustomerLimit: number | null
  priority: number
  targeting: SellerMarketingTargeting
  createdAt: string
  updatedAt: string
}

export type SellerDiscountFormValues = {
  id: string
  name: string
  description: string
  type: SellerMarketingDiscountType
  value: string
  minOrder: string
  maxDiscount: string
  startsAt: string
  endsAt: string
  status: SellerDiscountStatus
  usageLimit: string
  perCustomerLimit: string
  priority: number
  targeting: SellerMarketingTargeting
}

export const discountIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyDiscountForm(): SellerDiscountFormValues {
  return {
    id: '',
    name: '',
    description: '',
    type: 'percent',
    value: '10',
    minOrder: '0',
    maxDiscount: '',
    startsAt: '',
    endsAt: '',
    status: 'active',
    usageLimit: '',
    perCustomerLimit: '',
    priority: 100,
    targeting: emptyMarketingTargeting(),
  }
}

export function toDiscountForm(d: SellerDiscount): SellerDiscountFormValues {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    type: d.type,
    value: String(d.value),
    minOrder: String(d.minOrder),
    maxDiscount: d.maxDiscount == null ? '' : String(d.maxDiscount),
    startsAt: d.startsAt ? toDatetimeLocalValue(new Date(d.startsAt)) : '',
    endsAt: d.endsAt ? toDatetimeLocalValue(new Date(d.endsAt)) : '',
    status: d.status,
    usageLimit: d.usageLimit == null ? '' : String(d.usageLimit),
    perCustomerLimit: d.perCustomerLimit == null ? '' : String(d.perCustomerLimit),
    priority: d.priority,
    targeting: { ...emptyMarketingTargeting(), ...d.targeting },
  }
}

function parseOptionalInt(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Math.round(Number(t))
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function formToDiscount(form: SellerDiscountFormValues, previous?: SellerDiscount): SellerDiscount {
  const now = new Date().toISOString()
  const valueNum = Number(form.value)
  return {
    id: form.id.trim() || previous?.id || `disc-${Date.now()}`,
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    value: form.type === 'percent'
      ? Math.min(99, Math.max(1, Math.round(valueNum) || 1))
      : Math.max(0, Math.round(valueNum) || 0),
    minOrder: Math.max(0, Math.round(Number(form.minOrder) || 0)),
    maxDiscount: parseOptionalInt(form.maxDiscount),
    startsAt: form.startsAt.trim() ? fromDatetimeLocalValue(form.startsAt) : null,
    endsAt: form.endsAt.trim() ? fromDatetimeLocalValue(form.endsAt) : null,
    status: form.status,
    usageLimit: parseOptionalInt(form.usageLimit),
    usageCount: previous?.usageCount ?? 0,
    perCustomerLimit: parseOptionalInt(form.perCustomerLimit),
    priority: Math.max(0, Math.round(Number(form.priority) || 0)),
    targeting: { ...emptyMarketingTargeting(), ...form.targeting },
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function buildDefaultSellerDiscounts(): SellerDiscount[] {
  const now = new Date()
  const start = new Date(now.getTime() - 2 * 24 * 3600_000).toISOString()
  const end = new Date(now.getTime() + 20 * 24 * 3600_000).toISOString()
  return [
    {
      id: 'sitewide-10',
      name: 'تخفیف سراسری ۱۰٪',
      description: 'روی کل فروشگاه — حداقل سفارش ندارد',
      type: 'percent',
      value: 10,
      minOrder: 0,
      maxDiscount: 500_000,
      startsAt: start,
      endsAt: end,
      status: 'active',
      usageLimit: null,
      usageCount: 42,
      perCustomerLimit: 3,
      priority: 50,
      targeting: emptyMarketingTargeting(),
      createdAt: start,
      updatedAt: start,
    },
    {
      id: 'mobile-fixed',
      name: 'تخفیف ثابت موبایل',
      description: 'مبلغ ثابت برای دسته موبایل',
      type: 'fixed',
      value: 200_000,
      minOrder: 5_000_000,
      maxDiscount: null,
      startsAt: start,
      endsAt: end,
      status: 'active',
      usageLimit: 100,
      usageCount: 12,
      perCustomerLimit: 1,
      priority: 20,
      targeting: {
        ...emptyMarketingTargeting(),
        scope: 'categories',
        categoryIds: ['mobile'],
      },
      createdAt: start,
      updatedAt: start,
    },
  ]
}

/** Campaign SEO reuse placeholder export for type consumers */
export type { SeoMeta }
export { emptySeoMeta }
