export type HeroSlideTone = 'inverted' | 'primary' | 'secondary' | 'success'

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  to: string
  image: string
  /** Optional mobile crop/image — used below md breakpoint */
  imageMobile?: string
  /** CSS aspect-ratio, e.g. "16/9" or "4/1" */
  aspectDesktop?: string
  aspectMobile?: string
  icon: string
  tone: HeroSlideTone
  discount?: number
}

/** Normalize "16:9" / "16*9" → "16/9" for CSS aspect-ratio */
export function normalizeHeroAspect(value: string | null | undefined, fallback = '4/1') {
  const raw = String(value || '').trim()
  if (!raw) return fallback
  const m = raw
    .replace(/×/g, 'x')
    .match(/^(\d+(?:\.\d+)?)\s*[:/*xX]\s*(\d+(?:\.\d+)?)$/)
  if (!m) return fallback
  return `${m[1]}/${m[2]}`
}

export const heroAspectPresets = [
  { label: '۴∶۱ (عریض کلاسیک)', value: '4/1' },
  { label: '۳∶۱', value: '3/1' },
  { label: '۲∶۱', value: '2/1' },
  { label: '۱۶∶۹', value: '16/9' },
  { label: '۲۱∶۹', value: '21/9' },
  { label: '۵∶۲', value: '5/2' },
  { label: '۱∶۱', value: '1/1' },
] as const

export type HeroFeature = {
  id: string
  icon: string
  title: string
  subtitle: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'iphone-16-pro',
    eyebrow: 'کمپین جشنواره فناوری',
    title: 'iPhone 16 Pro Max',
    subtitle: 'قدرتمندترین آیفون با تراشه A18 Pro و بدنه تیتانیومی',
    cta: 'مشاهده و خرید',
    to: '/product/iphone-16-pro',
    image: '/images/mock/iphone16pro-desert.jpg',
    icon: 'device-mobile',
    tone: 'inverted',
    discount: 12,
  },
  {
    id: 'sony-xm5',
    eyebrow: 'پیشنهاد شگفت‌انگیز هفته',
    title: 'دنیای صدای بی‌سیم',
    subtitle: 'تا ۳۰٪ تخفیف روی هدفون‌ها و ایرپادهای برندهای معتبر',
    cta: 'مشاهده تخفیف‌ها',
    to: '/search?q=هدفون&category=audio',
    image: '/images/mock/sony-xm5-midnight.jpg',
    icon: 'headphones',
    tone: 'primary',
    discount: 30,
  },
  {
    id: 'macbook-m4',
    eyebrow: 'قدرت خلاقیت',
    title: 'MacBook Pro M4',
    subtitle: 'پردازش خیره‌کننده با تراشه اپل سیلیکون M4 و ۱۸ گیگ رم',
    cta: 'کشف کنید',
    to: '/product/macbook-m4',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    icon: 'device-laptop',
    tone: 'secondary',
  },
  {
    id: 'ps5-pro',
    eyebrow: 'کنسول‌های نسل جدید',
    title: 'PlayStation 5 Pro',
    subtitle: 'تجربه گیمینگ در بالاترین سطح، حالا در انبار موجود شد',
    cta: 'خرید کنسول',
    to: '/product/ps5-pro',
    image: '/images/mock/ps5-pro.jpg',
    icon: 'device-gamepad-2',
    tone: 'success',
  },
]

export const heroFeatures: HeroFeature[] = [
  {
    id: 'shipping',
    icon: 'truck-delivery',
    title: 'ارسال سریع',
    subtitle: 'تحویل ۲۴ ساعته',
  },
  {
    id: 'authenticity',
    icon: 'shield-check',
    title: 'اصالت کالا',
    subtitle: 'ضمانت اصل بودن',
  },
  {
    id: 'return',
    icon: 'refresh',
    title: 'بازگشت کالا',
    subtitle: '۷ روز فرصت',
  },
  {
    id: 'payment',
    icon: 'credit-card',
    title: 'پرداخت امن',
    subtitle: 'درگاه معتبر',
  },
]
