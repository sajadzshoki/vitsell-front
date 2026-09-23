import type { SeoMeta } from '~/data/seo'

export type CategorySub = {
  name: string
  items: string[]
  image?: string | null
}

export type Category = {
  id: string
  name: string
  icon: string
  image?: string | null
  text?: string | null
  /** Null / omitted = root category */
  parentId?: string | null
  sortOrder?: number
  subs: CategorySub[]
  seo?: Partial<SeoMeta> | null
}

/** Chip shown in search header — always a real taxonomy category. */
export type SearchSubcategoryChip = {
  id: string
  name: string
  image?: string | null
}

/** Tabler icon name per category id (without i-tabler- prefix) */
export const categoryIcons: Record<string, string> = {
  mobile: 'device-mobile',
  laptop: 'device-laptop',
  audio: 'headphones',
  tv: 'device-tv',
  camera: 'camera',
  watch: 'device-watch',
  gaming: 'device-gamepad-2',
  home: 'home',
  fashion: 'shirt',
  beauty: 'sparkles',
}

export const categories: Category[] = [
  {
    id: 'mobile',
    name: 'موبایل',
    icon: 'mobile',
    parentId: null,
    image: '/images/mock/iphone16pro-desert.jpg',
    text: 'در ویتسل می‌توانید انواع گوشی موبایل از برندهای اپل، سامسونگ، شیائومی، هوآوی و سایر سازندگان معتبر را با بهترین قیمت و ارسال سریع تهیه کنید. از پرچمدارهای پرقدرت تا گوشی‌های اقتصادی، همه در یکجا.',
    subs: [
      { name: 'برندهای موبایل', items: ['اپل', 'سامسونگ', 'شیائومی', 'هوآوی', 'آنر', 'نوکیا'] },
      { name: 'لوازم جانبی', items: ['قاب و کاور', 'گلس', 'شارژر و کابل', 'پاوربانک'] },
    ],
  },
  {
    id: 'mobile-accessories',
    name: 'لوازم جانبی موبایل',
    icon: 'mobile',
    parentId: 'mobile',
    image: '/images/mock/iphone16pro-desert.jpg',
    text: 'قاب، گلس، شارژر، کابل و پاوربانک برای گوشی موبایل.',
    subs: [],
  },
  {
    id: 'laptop',
    name: 'لپ‌تاپ',
    icon: 'laptop',
    parentId: null,
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    text: 'مجموعه‌ای گسترده از لپ‌تاپ‌های اپل، ایسوس، لنوو، اچ‌پی و سایر برندها برای برنامه‌نویسی، طراحی، گیمینگ و استفاده روزمره.',
    subs: [
      { name: 'برندها', items: ['اپل', 'ایسوس', 'لنوو', 'اچ‌پی', 'ایسر', 'مایکروسافت'] },
      { name: 'کاربری', items: ['گیمینگ', 'دانشجویی', 'برنامه‌نویسی', 'طراحی'] },
    ],
  },
  {
    id: 'laptop-gaming',
    name: 'لپ‌تاپ گیمینگ',
    icon: 'laptop',
    parentId: 'laptop',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    text: 'لپ‌تاپ‌های مخصوص بازی با کارت گرافیک قدرتمند.',
    subs: [],
  },
  {
    id: 'laptop-ultrabook',
    name: 'اولترابوک',
    icon: 'laptop',
    parentId: 'laptop',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    text: 'لپ‌تاپ‌های سبک و باریک برای حمل روزمره.',
    subs: [],
  },
  {
    id: 'laptop-student',
    name: 'لپ‌تاپ دانشجویی',
    icon: 'laptop',
    parentId: 'laptop',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    text: 'گزینه‌های اقتصادی و مناسب تحصیل و کارهای روزمره.',
    subs: [],
  },
  {
    id: 'audio',
    name: 'صوتی و هدفون',
    icon: 'audio',
    parentId: null,
    image: '/images/mock/sony-xm5-midnight.jpg',
    text: 'از هدفون‌های بی‌سیم نویزکنسلینگ تا اسپیکرهای قابل حمل و ساندبار خانگی — همه در دسته صوتی ویتسل.',
    subs: [
      { name: 'انواع', items: ['هدفون بلوتوثی', 'ایرپاد', 'اسپیکر قابل حمل', 'ساندبار'] },
      { name: 'برندها', items: ['اپل', 'سونی', 'جی‌بی‌ال', 'انکر', 'سنهایزر'] },
    ],
  },
  {
    id: 'audio-headphones',
    name: 'هدفون و ایرپاد',
    icon: 'audio',
    parentId: 'audio',
    image: '/images/mock/sony-xm5-midnight.jpg',
    text: 'هدفون بلوتوثی، ایرپاد و هدست.',
    subs: [],
  },
  {
    id: 'audio-speakers',
    name: 'اسپیکر و ساندبار',
    icon: 'audio',
    parentId: 'audio',
    image: '/images/mock/sony-xm5-midnight.jpg',
    text: 'اسپیکر قابل حمل و ساندبار خانگی.',
    subs: [],
  },
  {
    id: 'tv',
    name: 'تلویزیون',
    icon: 'tv',
    parentId: null,
    image: '/images/mock/ipad-pro-m4.jpg',
    text: 'تلویزیون‌های سامسونگ، ال‌جی و سونی با پنل QLED، OLED و Mini LED برای تجربه تصویری بی‌نظیر.',
    subs: [],
  },
  {
    id: 'camera',
    name: 'دوربین',
    icon: 'camera',
    parentId: null,
    image: '/images/mock/apple-watch-ultra.jpg',
    text: 'دوربین‌های بدون آینه، کامپکت و اکشن‌کم از برندهای کانن، سونی، گوپرو و DJI.',
    subs: [],
  },
  {
    id: 'watch',
    name: 'ساعت هوشمند',
    icon: 'watch',
    parentId: null,
    image: '/images/mock/apple-watch-ultra.jpg',
    text: 'ساعت‌های هوشمند با قابلیت ردیابی سلامت، GPS، پرداخت و اتصال بلوتوث.',
    subs: [],
  },
  {
    id: 'gaming',
    name: 'کنسول بازی',
    icon: 'gaming',
    parentId: null,
    image: '/images/mock/ps5-pro.jpg',
    text: 'کنسول‌های نسل جدید، دسته بازی، هدست گیمینگ و اکسسوری‌های مرتبط.',
    subs: [],
  },
  {
    id: 'home',
    name: 'لوازم خانگی',
    icon: 'home',
    parentId: null,
    image: '/images/mock/hero-tech-ecosystem.jpg',
    text: 'لوازم خانگی برندهای دایسون، ال‌جی، سامسونگ و شیائومی با ارسال سریع.',
    subs: [],
  },
  {
    id: 'fashion',
    name: 'مد و پوشاک',
    icon: 'fashion',
    parentId: null,
    image: '/images/mock/galaxy-s25-ultra.jpg',
    text: 'کالکشن‌های فصل جدید از برندهای معتبر داخلی و بین‌المللی.',
    subs: [],
  },
  {
    id: 'beauty',
    name: 'زیبایی و سلامت',
    icon: 'beauty',
    parentId: null,
    image: '/images/mock/sony-xm5-midnight.jpg',
    text: 'محصولات اصل برندهای معتبر آرایشی و بهداشتی.',
    subs: [],
  },
]

export const popularSearches = [
  'آیفون ۱۵',
  'مک‌بوک پرو',
  'ایرپاد پرو',
  'پلی‌استیشن ۵',
]

export function getCategoryIcon(id: string) {
  const name = categoryIcons[id] || 'category'
  return `i-tabler-${name}`
}

export function getCategoryById(id: string) {
  return categories.find(c => c.id === id)
}

export function toCategoryIndexRoute(query?: { cat?: string }) {
  return {
    path: '/category',
    ...(query?.cat ? { query: { cat: query.cat } } : {}),
  }
}

export function toCategoryRoute(id: string) {
  return { name: 'category-catId', params: { catId: id } }
}

/** Digikala-style category listing path: `/search/category-mobile` */
export function toSearchCategoryPath(categoryId: string) {
  return `/search/category-${String(categoryId || '').trim()}`
}

/**
 * Search / category listing route.
 * - Category browse → path `/search/category-{id}` (SEO); `q` / `brands` stay in query.
 * - Text-only → `/search?q=...`
 */
export function toSearchRoute(query: {
  q?: string
  category?: string
  brands?: string | string[]
  minPrice?: number
  maxPrice?: number
  attrs?: Record<string, string[]>
  onlyDiscount?: boolean
  onlyInStock?: boolean
  fastDelivery?: boolean
  minRating?: number
}) {
  const q = query.q?.trim()
  const category = query.category?.trim()
  const brandsRaw = query.brands
  const brands = (Array.isArray(brandsRaw) ? brandsRaw : brandsRaw ? [brandsRaw] : [])
    .map(b => String(b || '').trim())
    .filter(Boolean)
  const minPrice = Number(query.minPrice || 0) || 0
  const maxPrice = Number(query.maxPrice || 0) || 0
  const minRating = Number(query.minRating || 0) || 0
  const attrs = query.attrs || {}
  const attrsClean: Record<string, string[]> = {}
  for (const [slug, values] of Object.entries(attrs)) {
    const list = (values || []).map(v => String(v).trim()).filter(Boolean)
    if (slug.trim() && list.length) attrsClean[slug.trim()] = list
  }

  const searchQuery: Record<string, string> = {
    ...(q ? { q } : {}),
    ...(brands.length === 1
      ? { brands: brands[0]! }
      : brands.length
        ? { brands: brands.join(',') }
        : {}),
    ...(minPrice > 0 ? { minPrice: String(minPrice) } : {}),
    ...(maxPrice > 0 ? { maxPrice: String(maxPrice) } : {}),
    ...(Object.keys(attrsClean).length ? { attrs: JSON.stringify(attrsClean) } : {}),
    ...(query.onlyDiscount ? { onlyDiscount: 'true' } : {}),
    ...(query.onlyInStock ? { onlyInStock: 'true' } : {}),
    ...(query.fastDelivery ? { fastDelivery: 'true' } : {}),
    ...(minRating > 0 ? { minRating: String(minRating) } : {}),
  }

  if (category) {
    return {
      path: toSearchCategoryPath(category),
      query: searchQuery,
    }
  }

  return {
    path: '/search',
    query: searchQuery,
  }
}

/** Serialize `toSearchRoute` result to a path+query string (redirects / absolute building). */
export function searchRouteToHref(route: { path: string, query?: Record<string, string> }) {
  const qs = new URLSearchParams(
    Object.entries(route.query || {}).filter(([, v]) => v != null && v !== '') as [string, string][],
  ).toString()
  return `${route.path}${qs ? `?${qs}` : ''}`
}

function storefrontHref(storeUrl: string, route: { path: string, query: Record<string, string> }) {
  const base = String(storeUrl || '').replace(/\/+$/, '')
  const qs = new URLSearchParams(
    Object.entries(route.query).filter(([, v]) => v != null && v !== '') as [string, string][],
  ).toString()
  return `${base}${route.path}${qs ? `?${qs}` : ''}`
}

/** Absolute storefront URL for a brand's product listing (admin → store). */
export function brandStorefrontHref(storeUrl: string, brandName: string) {
  return storefrontHref(storeUrl, toSearchRoute({ brands: brandName }))
}

/** Absolute storefront URL for a category's product listing (admin → store). */
export function categoryStorefrontHref(storeUrl: string, categoryId: string) {
  return storefrontHref(storeUrl, toSearchRoute({ category: categoryId }))
}
