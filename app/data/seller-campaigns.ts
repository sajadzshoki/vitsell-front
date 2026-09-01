import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import {
  emptyMarketingTargeting,
  type SellerMarketingTargeting,
  type SellerScheduleStatus,
} from '~/data/seller-marketing-shared'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '~/data/seller-deals'

export type SellerCampaignManualStatus = 'draft' | 'paused' | 'archived' | 'active'

export type SellerCampaign = {
  id: string
  name: string
  description: string
  manualStatus: SellerCampaignManualStatus
  startsAt: string
  endsAt: string
  priority: number
  image: string | null
  landingUrl: string
  slug: string
  seo: SeoMeta
  targeting: SellerMarketingTargeting
  discountIds: string[]
  couponCodes: string[]
  dealIds: string[]
  bannerIds: string[]
  createdAt: string
  updatedAt: string
}

export type SellerCampaignFormValues = {
  id: string
  name: string
  description: string
  manualStatus: SellerCampaignManualStatus
  startsAt: string
  endsAt: string
  priority: number
  image: string
  landingUrl: string
  slug: string
  seo: SeoMeta
  targeting: SellerMarketingTargeting
  discountIds: string[]
  couponCodes: string[]
  dealIds: string[]
  bannerIds: string[]
}

export const campaignIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyCampaignForm(): SellerCampaignFormValues {
  const start = new Date()
  const end = new Date(start.getTime() + 30 * 24 * 3600_000)
  return {
    id: '',
    name: '',
    description: '',
    manualStatus: 'draft',
    startsAt: toDatetimeLocalValue(start),
    endsAt: toDatetimeLocalValue(end),
    priority: 100,
    image: '',
    landingUrl: '',
    slug: '',
    seo: emptySeoMeta(),
    targeting: emptyMarketingTargeting(),
    discountIds: [],
    couponCodes: [],
    dealIds: [],
    bannerIds: [],
  }
}

export function toCampaignForm(c: SellerCampaign): SellerCampaignFormValues {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    manualStatus: c.manualStatus,
    startsAt: toDatetimeLocalValue(new Date(c.startsAt)),
    endsAt: toDatetimeLocalValue(new Date(c.endsAt)),
    priority: c.priority,
    image: c.image || '',
    landingUrl: c.landingUrl,
    slug: c.slug,
    seo: { ...emptySeoMeta(), ...c.seo },
    targeting: { ...emptyMarketingTargeting(), ...c.targeting },
    discountIds: [...c.discountIds],
    couponCodes: [...c.couponCodes],
    dealIds: [...c.dealIds],
    bannerIds: [...c.bannerIds],
  }
}

export function formToCampaign(form: SellerCampaignFormValues, previous?: SellerCampaign): SellerCampaign {
  const now = new Date().toISOString()
  const slug = form.slug.trim().toLowerCase() || form.id.trim()
  return {
    id: form.id.trim() || previous?.id || `camp-${Date.now()}`,
    name: form.name.trim(),
    description: form.description.trim(),
    manualStatus: form.manualStatus,
    startsAt: fromDatetimeLocalValue(form.startsAt),
    endsAt: fromDatetimeLocalValue(form.endsAt),
    priority: Math.max(0, Math.round(Number(form.priority) || 0)),
    image: form.image.trim() || null,
    landingUrl: form.landingUrl.trim(),
    slug,
    seo: { ...emptySeoMeta(), ...form.seo },
    targeting: { ...emptyMarketingTargeting(), ...form.targeting },
    discountIds: [...form.discountIds],
    couponCodes: [...form.couponCodes],
    dealIds: [...form.dealIds],
    bannerIds: [...form.bannerIds],
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function campaignLifecycle(c: SellerCampaign, now = new Date()): SellerScheduleStatus {
  if (c.manualStatus === 'archived') return 'archived'
  if (c.manualStatus === 'draft') return 'draft'
  if (c.manualStatus === 'paused') return 'paused'
  const start = Date.parse(c.startsAt)
  const end = Date.parse(c.endsAt)
  if (!Number.isNaN(end) && end <= now.getTime()) return 'expired'
  if (!Number.isNaN(start) && start > now.getTime()) return 'scheduled'
  return 'active'
}

export function buildDefaultSellerCampaigns(): SellerCampaign[] {
  const now = new Date()
  const start = new Date(now.getTime() - 24 * 3600_000).toISOString()
  const end = new Date(now.getTime() + 14 * 24 * 3600_000).toISOString()
  return [
    {
      id: 'norouz-sale',
      name: 'فروش ویژه نوروز',
      description: 'کمپین ترکیبی بنر + کوپن + شگفت‌انگیز',
      manualStatus: 'active',
      startsAt: start,
      endsAt: end,
      priority: 10,
      image: null,
      landingUrl: '/search',
      slug: 'norouz-sale',
      seo: emptySeoMeta(),
      targeting: emptyMarketingTargeting(),
      discountIds: ['sitewide-10'],
      couponCodes: [],
      dealIds: [],
      bannerIds: [],
      createdAt: start,
      updatedAt: start,
    },
  ]
}
