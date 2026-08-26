export type HeroSlideTone = 'inverted' | 'primary' | 'secondary' | 'success'

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  to: string
  image: string
  icon: string
  tone: HeroSlideTone
  discount?: number
}

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
