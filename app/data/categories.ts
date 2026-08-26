export type CategorySub = {
  name: string
  items: string[]
}

export type Category = {
  id: string
  name: string
  icon: string
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
    subs: [
      { name: 'برندهای موبایل', items: ['اپل', 'سامسونگ', 'شیائومی', 'هوآوی', 'آنر', 'نوکیا'] },
      { name: 'لوازم جانبی', items: ['قاب و کاور', 'گلس', 'شارژر و کابل', 'پاوربانک'] },
    ],
  },
  {
    id: 'laptop',
    name: 'لپ‌تاپ',
    icon: 'laptop',
    subs: [
      { name: 'برندها', items: ['اپل', 'ایسوس', 'لنوو', 'اچ‌پی', 'ایسر', 'مایکروسافت'] },
      { name: 'کاربری', items: ['گیمینگ', 'دانشجویی', 'برنامه‌نویسی', 'طراحی'] },
    ],
  },
  {
    id: 'audio',
    name: 'صوتی و هدفون',
    icon: 'audio',
    subs: [
      { name: 'انواع', items: ['هدفون بلوتوثی', 'ایرپاد', 'اسپیکر قابل حمل', 'ساندبار'] },
      { name: 'برندها', items: ['اپل', 'سونی', 'جی‌بی‌ال', 'انکر', 'سنهایزر'] },
    ],
  },
  { id: 'tv', name: 'تلویزیون', icon: 'tv', subs: [] },
  { id: 'camera', name: 'دوربین', icon: 'camera', subs: [] },
  { id: 'watch', name: 'ساعت هوشمند', icon: 'watch', subs: [] },
  { id: 'gaming', name: 'کنسول بازی', icon: 'gaming', subs: [] },
  { id: 'home', name: 'لوازم خانگی', icon: 'home', subs: [] },
  { id: 'fashion', name: 'مد و پوشاک', icon: 'fashion', subs: [] },
  { id: 'beauty', name: 'زیبایی و سلامت', icon: 'beauty', subs: [] },
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

export function toSearchRoute(query: { q?: string, category?: string }) {
  const q = query.q?.trim()
  const category = query.category?.trim()
  return {
    path: '/search',
    query: {
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
    },
  }
}
