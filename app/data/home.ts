export const homeBrands = [
  'Apple',
  'Samsung',
  'Sony',
  'LG',
  'Xiaomi',
  'ASUS',
  'Dyson',
  'Bose',
] as const

export type HomeCircleItem = {
  id: string
  title: string
  image: string
  to: string
}

/** Circular shortcut strip above popular categories (Digikala-style) */
export const homeCircleItems: HomeCircleItem[] = [
  {
    id: 'samsung-phone',
    title: 'گوشی سامسونگ',
    image: '/images/mock/galaxy-s25-ultra.jpg',
    to: '/search?q=گوشی سامسونگ&category=mobile',
  },
  {
    id: 'smartwatch',
    title: 'ساعت هوشمند',
    image: '/images/mock/apple-watch-ultra.jpg',
    to: '/search?q=ساعت هوشمند&category=watch',
  },
  {
    id: 'iphone',
    title: 'گوشی آیفون',
    image: '/images/mock/iphone16pro-desert.jpg',
    to: '/product/iphone-16-pro',
  },
  {
    id: 'tablet',
    title: 'تبلت',
    image: '/images/mock/ipad-pro-m4.jpg',
    to: '/search?q=تبلت&category=laptop',
  },
  {
    id: 'headphones',
    title: 'هدفون',
    image: '/images/mock/sony-xm5-midnight.jpg',
    to: '/search?q=هدفون&category=audio',
  },
  {
    id: 'console',
    title: 'کنسول بازی',
    image: '/images/mock/ps5-pro.jpg',
    to: '/search?q=کنسول بازی&category=gaming',
  },
  {
    id: 'laptop',
    title: 'لپ‌تاپ',
    image: '/images/mock/macbook-m4-spaceblack.jpg',
    to: '/search?q=لپ‌تاپ&category=laptop',
  },
  {
    id: 'xiaomi',
    title: 'شیائومی NFC کف قیمت بازار',
    image: '/images/mock/galaxy-s25-ultra.jpg',
    to: '/search?q=شیائومی&category=mobile',
  },
]

export type HomePromo = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  tone: 'primary' | 'warning'
  icon: string
  primaryCta: { label: string; to?: string }
  secondaryCta?: { label: string; to?: string }
}

export const homePromos: HomePromo[] = [
  {
    id: 'plus',
    eyebrow: 'ویژه اعضای دیجی‌شاپ پلاس',
    title: 'اشتراک دیجی‌شاپ پلاس',
    subtitle: 'ارسال رایگان نامحدود، تخفیف‌های اختصاصی و پشتیبانی ویژه.',
    tone: 'primary',
    icon: 'sparkles',
    primaryCta: { label: 'عضویت رایگان', to: '/account' },
  },
  {
    id: 'app',
    eyebrow: 'اپلیکیشن موبایل',
    title: 'تجربه‌ای بهتر با اپ دیجی‌شاپ',
    subtitle: 'با نصب اپلیکیشن، از تخفیف‌های ویژه و پیشنهادهای اختصاصی بهره‌مند شوید.',
    tone: 'warning',
    icon: 'device-mobile',
    primaryCta: { label: 'اندروید' },
    secondaryCta: { label: 'iOS' },
  },
]
