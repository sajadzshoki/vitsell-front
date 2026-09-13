import { heroSlides } from '~/data/hero'
import { homeBannerRows } from '~/data/home'

export type SellerBannerType = 'main' | 'secondary'

export type SellerBannerLinkType =
  | 'none'
  | 'url'
  | 'product'
  | 'category'
  | 'brand'
  | 'campaign'

/** Explicit placement slots — scalable, not hardcoded in storefront consumers yet */
export type SellerBannerPlacement =
  | 'homepage_hero'
  | 'homepage_promo_strip'
  | 'homepage_category'
  | 'homepage_product_section'
  | 'product_listing'
  | 'category_page'
  | 'category_page_hero'
  | 'category_page_promo'
  | 'product_detail'
  | 'sidebar'
  | 'footer_promo'

export type SellerBanner = {
  id: string
  title: string
  internalName: string
  alt: string
  image: string
  /** Optional mobile-specific image */
  imageMobile: string | null
  link: string
  linkType: SellerBannerLinkType
  productId: string | null
  brandId: string | null
  campaignId: string | null
  buttonText: string | null
  type: SellerBannerType
  placement: SellerBannerPlacement
  categoryId: string | null
  active: boolean
  startsAt: string | null
  endsAt: string | null
  sortOrder: number
  priority: number
  createdAt: string | null
  updatedAt: string | null
}

export type SellerBannerFormValues = {
  id: string
  title: string
  internalName: string
  alt: string
  image: string
  imageMobile: string
  link: string
  linkType: SellerBannerLinkType
  productId: string
  brandId: string
  campaignId: string
  buttonText: string
  type: SellerBannerType
  placement: SellerBannerPlacement
  categoryId: string
  active: boolean
  startsAt: string
  endsAt: string
  sortOrder: number
  priority: number
}

export const sellerBannerTypeMeta: Record<
  SellerBannerType,
  { label: string, color: 'primary' | 'neutral' }
> = {
  main: { label: 'بنر اصلی', color: 'primary' },
  secondary: { label: 'بنر فرعی', color: 'neutral' },
}

export const sellerBannerPlacementMeta: Record<
  SellerBannerPlacement,
  { label: string }
> = {
  homepage_hero: { label: 'هیرو صفحه اصلی' },
  homepage_promo_strip: { label: 'نوار پرومو صفحه اصلی' },
  homepage_category: { label: 'سکشن دسته صفحه اصلی' },
  homepage_product_section: { label: 'سکشن محصول صفحه اصلی' },
  product_listing: { label: 'لیست محصولات' },
  category_page: { label: 'صفحه دسته' },
  category_page_hero: { label: 'هیرو صفحه دسته' },
  category_page_promo: { label: 'پرومو صفحه دسته' },
  product_detail: { label: 'جزئیات محصول' },
  sidebar: { label: 'سایدبار' },
  footer_promo: { label: 'پرومو فوتر' },
}

export const sellerBannerLinkTypeMeta: Record<
  SellerBannerLinkType,
  { label: string }
> = {
  none: { label: 'بدون لینک' },
  url: { label: 'لینک مستقیم' },
  product: { label: 'محصول' },
  category: { label: 'دسته‌بندی' },
  brand: { label: 'برند' },
  campaign: { label: 'کمپین' },
}

export const bannerIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function categoryIdFromLink(link: string): string | null {
  try {
    const url = new URL(link, 'https://vitsell.local')
    const category = url.searchParams.get('category')?.trim()
    return category || null
  }
  catch {
    return null
  }
}

function defaultPlacementForType(type: SellerBannerType): SellerBannerPlacement {
  return type === 'main' ? 'homepage_hero' : 'homepage_promo_strip'
}

function inScheduleWindow(
  startsAt: string | null,
  endsAt: string | null,
  now: Date,
): boolean {
  const t = now.getTime()
  if (startsAt) {
    const start = Date.parse(startsAt)
    if (!Number.isNaN(start) && t < start) return false
  }
  if (endsAt) {
    const end = Date.parse(endsAt)
    if (!Number.isNaN(end) && t > end) return false
  }
  return true
}

/** Active banners for a placement within the schedule window, sorted by priority then sortOrder */
export function bannersForPlacement(
  banners: SellerBanner[],
  placement: SellerBannerPlacement,
  now: Date = new Date(),
): SellerBanner[] {
  return banners
    .filter(b =>
      b.placement === placement
      && b.active
      && inScheduleWindow(b.startsAt, b.endsAt, now),
    )
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return a.sortOrder - b.sortOrder
    })
}

/** Seed اولیه برای پنل ادمین (فرانت‌only) */
export function buildDefaultSellerBanners(): SellerBanner[] {
  const now = new Date().toISOString()
  const mains: SellerBanner[] = heroSlides.map((slide, index) => ({
    id: `main-${slide.id}`,
    title: slide.title || '',
    internalName: `main-${slide.id}`,
    alt: slide.title || '',
    image: slide.image,
    imageMobile: null,
    link: slide.to,
    linkType: 'url' as const,
    productId: null,
    brandId: null,
    campaignId: null,
    buttonText: slide.cta || null,
    type: 'main',
    placement: 'homepage_hero',
    categoryId: categoryIdFromLink(slide.to),
    active: index < 3,
    startsAt: null,
    endsAt: null,
    sortOrder: index,
    priority: (index + 1) * 10,
    createdAt: now,
    updatedAt: now,
  }))

  const secondaries: SellerBanner[] = homeBannerRows.flatMap(row =>
    row.items.map((banner, index) => ({
      id: `secondary-${banner.id}`,
      title: '',
      internalName: `secondary-${banner.id}`,
      alt: '',
      image: banner.image,
      imageMobile: null,
      link: banner.to,
      linkType: 'url' as const,
      productId: null,
      brandId: null,
      campaignId: null,
      buttonText: null,
      type: 'secondary' as const,
      placement: 'homepage_promo_strip' as const,
      categoryId: categoryIdFromLink(banner.to),
      active: index !== 2 || row.id !== 'row-3',
      startsAt: null,
      endsAt: null,
      sortOrder: index,
      priority: 100 + index,
      createdAt: now,
      updatedAt: now,
    })),
  )

  return [...mains, ...secondaries]
}

export function emptyBannerForm(): SellerBannerFormValues {
  return {
    id: '',
    title: '',
    internalName: '',
    alt: '',
    image: '',
    imageMobile: '',
    link: '',
    linkType: 'none',
    productId: '',
    brandId: '',
    campaignId: '',
    buttonText: '',
    type: 'secondary',
    placement: 'homepage_promo_strip',
    categoryId: '__none__',
    active: true,
    startsAt: '',
    endsAt: '',
    sortOrder: 0,
    priority: 100,
  }
}

export function toBannerForm(banner: SellerBanner): SellerBannerFormValues {
  return {
    id: banner.id,
    title: banner.title ?? '',
    internalName: banner.internalName ?? '',
    alt: banner.alt ?? '',
    image: banner.image,
    imageMobile: banner.imageMobile ?? '',
    link: banner.link,
    linkType: banner.linkType ?? 'url',
    productId: banner.productId ?? '',
    brandId: banner.brandId ?? '',
    campaignId: banner.campaignId ?? '',
    buttonText: banner.buttonText ?? '',
    type: banner.type,
    placement: banner.placement ?? defaultPlacementForType(banner.type),
    categoryId: banner.categoryId || '__none__',
    active: banner.active,
    startsAt: banner.startsAt || '',
    endsAt: banner.endsAt || '',
    sortOrder: banner.sortOrder ?? 0,
    priority: banner.priority ?? 100,
  }
}

export function formToSellerBanner(
  form: SellerBannerFormValues,
  previous?: SellerBanner | null,
): SellerBanner {
  const now = new Date().toISOString()
  const linkType = form.linkType || 'none'
  return {
    id: form.id.trim(),
    title: form.title.trim(),
    internalName: form.internalName.trim() || form.id.trim(),
    alt: form.alt.trim() || form.title.trim(),
    image: form.image.trim(),
    imageMobile: form.imageMobile.trim() || null,
    link: linkType === 'none' ? '' : form.link.trim(),
    linkType,
    productId: linkType === 'product' ? (form.productId.trim() || null) : null,
    brandId: linkType === 'brand' ? (form.brandId.trim() || null) : null,
    campaignId: linkType === 'campaign' ? (form.campaignId.trim() || null) : null,
    buttonText: linkType === 'none' ? null : (form.buttonText.trim() || null),
    type: form.type,
    placement: form.placement || defaultPlacementForType(form.type),
    categoryId: (() => {
      if (linkType === 'category') {
        const raw = form.categoryId.trim()
        if (!raw || raw === '__none__') return null
        return raw
      }
      const raw = form.categoryId.trim()
      if (!raw || raw === '__none__') return null
      return raw
    })(),
    active: form.active,
    startsAt: form.startsAt.trim() ? new Date(form.startsAt).toISOString() : null,
    endsAt: form.endsAt.trim() ? new Date(form.endsAt).toISOString() : null,
    sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
    priority: Math.max(0, Math.round(Number(form.priority) || 0)),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}
