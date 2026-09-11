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
  subs: CategorySub[]
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
    image: '/images/mock/iphone16pro-desert.jpg',
    text: 'در دیجی‌شاپ می‌توانید انواع گوشی موبایل از برندهای اپل، سامسونگ، شیائومی، هوآوی و سایر سازندگان معتبر را با بهترین قیمت و ارسال سریع تهیه کنید. از پرچمدارهای پرقدرت تا گوشی‌های اقتصادی، همه در یکجا.',
    subs: [
      { name: 'برندهای موبایل', items: ['اپل', 'سامسونگ', 'شیائومی', 'هوآوی', 'آنر', 'نوکیا'] },
      { name: 'لوازم جانبی', items: ['قاب و کاور', 'گلس', 'شارژر و کابل', 'پاوربانک'] },
    ],
  },
  {
    id: 'laptop',
    name: 'لپ‌تاپ',
    icon: 'laptop',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    text: 'مجموعه‌ای گسترده از لپ‌تاپ‌های اپل، ایسوس، لنوو، اچ‌پی و سایر برندها برای برنامه‌نویسی، طراحی، گیمینگ و استفاده روزمره.',
    subs: [
      { name: 'برندها', items: ['اپل', 'ایسوس', 'لنوو', 'اچ‌پی', 'ایسر', 'مایکروسافت'] },
      { name: 'کاربری', items: ['گیمینگ', 'دانشجویی', 'برنامه‌نویسی', 'طراحی'] },
    ],
  },
  {
    id: 'audio',
    name: 'صوتی و هدفون',
    icon: 'audio',
    image: '/images/mock/sony-xm5-midnight.jpg',
    text: 'از هدفون‌های بی‌سیم نویزکنسلینگ تا اسپیکرهای قابل حمل و ساندبار خانگی — همه در دسته صوتی دیجی‌شاپ.',
    subs: [
      { name: 'انواع', items: ['هدفون بلوتوثی', 'ایرپاد', 'اسپیکر قابل حمل', 'ساندبار'] },
      { name: 'برندها', items: ['اپل', 'سونی', 'جی‌بی‌ال', 'انکر', 'سنهایزر'] },
    ],
  },
  {
    id: 'tv',
    name: 'تلویزیون',
    icon: 'tv',
    image: '/images/mock/ipad-pro-m4.jpg',
    text: 'تلویزیون‌های سامسونگ، ال‌جی و سونی با پنل QLED، OLED و Mini LED برای تجربه تصویری بی‌نظیر.',
    subs: [],
  },
  {
    id: 'camera',
    name: 'دوربین',
    icon: 'camera',
    image: '/images/mock/apple-watch-ultra.jpg',
    text: 'دوربین‌های بدون آینه، کامپکت و اکشن‌کم از برندهای کانن، سونی، گوپرو و DJI.',
    subs: [],
  },
  {
    id: 'watch',
    name: 'ساعت هوشمند',
    icon: 'watch',
    image: '/images/mock/apple-watch-ultra.jpg',
    text: 'ساعت‌های هوشمند با قابلیت ردیابی سلامت، GPS، پرداخت و اتصال بلوتوث.',
    subs: [],
  },
  {
    id: 'gaming',
    name: 'کنسول بازی',
    icon: 'gaming',
    image: '/images/mock/ps5-pro.jpg',
    text: 'کنسول‌های نسل جدید، دسته بازی، هدست گیمینگ و اکسسوری‌های مرتبط.',
    subs: [],
  },
  {
    id: 'home',
    name: 'لوازم خانگی',
    icon: 'home',
    image: '/images/mock/hero-tech-ecosystem.jpg',
    text: 'لوازم خانگی برندهای دایسون، ال‌جی، سامسونگ و شیائومی با ارسال سریع.',
    subs: [],
  },
  {
    id: 'fashion',
    name: 'مد و پوشاک',
    icon: 'fashion',
    image: '/images/mock/galaxy-s25-ultra.jpg',
    text: 'کالکشن‌های فصل جدید از برندهای معتبر داخلی و بین‌المللی.',
    subs: [],
  },
  {
    id: 'beauty',
    name: 'زیبایی و سلامت',
    icon: 'beauty',
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
}) {
  const q = query.q?.trim()
  const category = query.category?.trim()
  const brandsRaw = query.brands
  const brands = (Array.isArray(brandsRaw) ? brandsRaw : brandsRaw ? [brandsRaw] : [])
    .map(b => String(b || '').trim())
    .filter(Boolean)
  const minPrice = Number(query.minPrice || 0) || 0
  const maxPrice = Number(query.maxPrice || 0) || 0
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
