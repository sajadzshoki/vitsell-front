import { heroSlides } from '~/data/hero'
import { homeBannerRows } from '~/data/home'

export type SellerBannerType = 'main' | 'secondary'

export type SellerBanner = {
  id: string
  image: string
  link: string
  type: SellerBannerType
  categoryId: string | null
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type SellerBannerFormValues = {
  id: string
  image: string
  link: string
  type: SellerBannerType
  categoryId: string
  active: boolean
}

export const sellerBannerTypeMeta: Record<
  SellerBannerType,
  { label: string, color: 'primary' | 'neutral' }
> = {
  main: { label: 'بنر اصلی', color: 'primary' },
  secondary: { label: 'بنر فرعی', color: 'neutral' },
}

export const bannerIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function categoryIdFromLink(link: string): string | null {
  try {
    const url = new URL(link, 'https://digishop.local')
    const category = url.searchParams.get('category')?.trim()
    return category || null
  }
  catch {
    return null
  }
}

/** Seed اولیه برای پنل ادمین (فرانت‌only) */
export function buildDefaultSellerBanners(): SellerBanner[] {
  const now = new Date().toISOString()
  const mains: SellerBanner[] = heroSlides.map((slide, index) => ({
    id: `main-${slide.id}`,
    image: slide.image,
    link: slide.to,
    type: 'main',
    categoryId: categoryIdFromLink(slide.to),
    active: index < 3,
    createdAt: now,
    updatedAt: now,
  }))

  const secondaries: SellerBanner[] = homeBannerRows.flatMap(row =>
    row.items.map((banner, index) => ({
      id: `secondary-${banner.id}`,
      image: banner.image,
      link: banner.to,
      type: 'secondary' as const,
      categoryId: categoryIdFromLink(banner.to),
      active: index !== 2 || row.id !== 'row-3',
      createdAt: now,
      updatedAt: now,
    })),
  )

  return [...mains, ...secondaries]
}

export function emptyBannerForm(): SellerBannerFormValues {
  return {
    id: '',
    image: '',
    link: '',
    type: 'secondary',
    categoryId: '',
    active: true,
  }
}

export function toBannerForm(banner: SellerBanner): SellerBannerFormValues {
  return {
    id: banner.id,
    image: banner.image,
    link: banner.link,
    type: banner.type,
    categoryId: banner.categoryId ?? '',
    active: banner.active,
  }
}

export function formToSellerBanner(
  form: SellerBannerFormValues,
  previous?: SellerBanner | null,
): SellerBanner {
  const now = new Date().toISOString()
  return {
    id: form.id.trim(),
    image: form.image.trim(),
    link: form.link.trim(),
    type: form.type,
    categoryId: form.categoryId.trim() || null,
    active: form.active,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}
