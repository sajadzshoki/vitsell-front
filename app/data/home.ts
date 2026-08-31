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
    subtitle: 'ارسال رایگان نامحدود، تخفیف‌های اختصاصی و پشتیبانی ویژه برای خریدهای روزمره.',
    tone: 'primary',
    icon: 'sparkles',
    primaryCta: { label: 'عضویت رایگان', to: '/account' },
  },
]

export type HomeBanner = {
  id: string
  title: string
  subtitle?: string
  image: string
  to: string
  tone: 'primary' | 'secondary' | 'warning' | 'success' | 'inverted'
}

export type HomeBannerRow = {
  id: string
  items: HomeBanner[]
}

/** Compact promo banner rows (shown 2–3 times on home) */
export const homeBannerRows: HomeBannerRow[] = [
  {
    id: 'row-1',
    items: [
      {
        id: 'installment',
        title: 'خرید اقساطی تا ۴۰۰ میلیون',
        subtitle: 'بدون ضامن، تایید سریع',
        image: '/images/mock/hero-tech-ecosystem.jpg',
        to: '/search?q=اقساط',
        tone: 'success',
      },
      {
        id: 'storage',
        title: 'هارد اکسترنال مقاوم',
        subtitle: 'تا ۴۰۰۰ کیلوگرم فشار',
        image: '/images/mock/macbook-m4-spaceblack.jpg',
        to: '/search?q=هارد اکسترنال',
        tone: 'inverted',
      },
      {
        id: 'gold-cash',
        title: 'نقد کردن طلای دیجیتال',
        subtitle: 'شروع رایگان با کد DIGI20',
        image: '/images/mock/apple-watch-ultra.jpg',
        to: '/account',
        tone: 'primary',
      },
    ],
  },
  {
    id: 'row-2',
    items: [
      {
        id: 'audio-fest',
        title: 'جشنواره هدفون و اسپیکر',
        subtitle: 'تا ۴۰٪ تخفیف',
        image: '/images/mock/sony-xm5-midnight.jpg',
        to: '/search?category=audio',
        tone: 'secondary',
      },
      {
        id: 'gaming-week',
        title: 'هفته کنسول و گیمینگ',
        subtitle: 'PS5، Xbox و لوازم جانبی',
        image: '/images/mock/ps5-pro.jpg',
        to: '/search?category=gaming',
        tone: 'warning',
      },
      {
        id: 'laptop-back',
        title: 'لپ‌تاپ دانشجویی',
        subtitle: 'سبک، قوی، مناسب کلاس',
        image: '/images/mock/ipad-pro-m4.jpg',
        to: '/search?category=laptop',
        tone: 'primary',
      },
    ],
  },
  {
    id: 'row-3',
    items: [
      {
        id: 'watch-deal',
        title: 'ساعت‌های هوشمند منتخب',
        subtitle: 'ورزش، سلامت و اعلان‌ها',
        image: '/images/mock/apple-watch-ultra.jpg',
        to: '/search?category=watch',
        tone: 'inverted',
      },
      {
        id: 'phone-case',
        title: 'قاب و لوازم جانبی موبایل',
        subtitle: 'محافظت با استایل',
        image: '/images/mock/iphone16pro-desert.jpg',
        to: '/search?q=قاب گوشی&category=mobile',
        tone: 'success',
      },
      {
        id: 'plus-banner',
        title: 'ارسال رایگان با پلاس',
        subtitle: 'عضویت و تجربه بهتر خرید',
        image: '/images/mock/galaxy-s25-ultra.jpg',
        to: '/account',
        tone: 'primary',
      },
    ],
  },
]

export type HomeTopBrand = {
  id: string
  name: string
  images: [string, string]
  to: string
}

export const homeTopMobileBrands: HomeTopBrand[] = [
  {
    id: 'samsung',
    name: 'سامسونگ',
    images: ['/images/mock/galaxy-s25-ultra.jpg', '/images/mock/iphone16pro-desert.jpg'],
    to: '/search?q=سامسونگ&category=mobile',
  },
  {
    id: 'poco',
    name: 'پوکو',
    images: ['/images/mock/galaxy-s25-ultra.jpg', '/images/mock/galaxy-s25-ultra.jpg'],
    to: '/search?q=پوکو&category=mobile',
  },
  {
    id: 'iphone',
    name: 'آیفون',
    images: ['/images/mock/iphone16pro-desert.jpg', '/images/mock/iphone16pro-desert.jpg'],
    to: '/search?q=آیفون&category=mobile',
  },
  {
    id: 'honor',
    name: 'آنر',
    images: ['/images/mock/iphone16pro-desert.jpg', '/images/mock/galaxy-s25-ultra.jpg'],
    to: '/search?q=آنر&category=mobile',
  },
  {
    id: 'xiaomi',
    name: 'شیائومی',
    images: ['/images/mock/galaxy-s25-ultra.jpg', '/images/mock/iphone16pro-desert.jpg'],
    to: '/search?q=شیائومی&category=mobile',
  },
]

export type HomeCategoryShelf = {
  id: string
  title: string
  category: string
  viewAllTo: string
}

export const homeCategoryShelves: HomeCategoryShelf[] = [
  {
    id: 'shelf-mobile',
    title: 'پرفروش‌ترین‌های موبایل',
    category: 'mobile',
    viewAllTo: '/search?category=mobile',
  },
  {
    id: 'shelf-laptop',
    title: 'پرفروش‌ترین‌های لپ‌تاپ',
    category: 'laptop',
    viewAllTo: '/search?category=laptop',
  },
  {
    id: 'shelf-audio',
    title: 'پرفروش‌ترین‌های صوتی',
    category: 'audio',
    viewAllTo: '/search?category=audio',
  },
]

export type HomeSeoBlock = {
  title: string
  paragraphs: string[]
  inlineLink?: { label: string, to: string }
}

export const homeSeoBlocks: HomeSeoBlock[] = [
  {
    title: 'فروشگاه اینترنتی دیجی‌شاپ',
    paragraphs: [
      'دیجی‌شاپ فروشگاه اینترنتی تخصصی محصولات دیجیتال و کالای مصرفی است؛ از گوشی موبایل و لپ‌تاپ تا لوازم خانگی و پوشاک. با تنوع برند، فیلتر دقیق، ارسال سریع و امکان خرید اقساطی، مسیر خرید آنلاین را ساده‌تر کرده‌ایم.',
    ],
  },
  {
    title: 'خرید انواع گوشی موبایل',
    paragraphs: [
      'در دیجی‌شاپ می‌توانید انواع گوشی موبایل اپل، سامسونگ، شیائومی، آنر، گوگل و دیگر برندها را با گارانتی معتبر مقایسه و خریداری کنید. فیلترهای قیمت، حافظه، رم و امتیاز کاربران کمک می‌کند سریع‌تر به گزینه مناسب برسید. برای شروع،',
    ],
    inlineLink: { label: 'خرید گوشی موبایل', to: '/search?category=mobile' },
  },
  {
    title: 'لپ‌تاپ و تبلت برای کار و تحصیل',
    paragraphs: [
      'اگر به‌دنبال لپ‌تاپ دانشجویی، لپ‌تاپ گیمینگ یا تبلت سبک هستید، دسته‌بندی‌های لپ‌تاپ و تبلت دیجی‌شاپ مدل‌های متنوعی از اپل، ایسوس، لنوو و سامسونگ را پوشش می‌دهد. مشخصات پردازنده، رم و نمایشگر را کنار هم ببینید و با خیال راحت انتخاب کنید.',
    ],
  },
  {
    title: 'ارسال سریع و ضمانت اصالت',
    paragraphs: [
      'اصالت کالا، امکان مرجوعی طبق قوانین فروشگاه و پشتیبانی پاسخ‌گو از اصول خرید در دیجی‌شاپ است. سفارش‌های واجد شرایط در بازه‌های اعلام‌شده ارسال می‌شوند تا تجربه خرید آنلاین شفاف و قابل‌اطمینان باشد.',
    ],
  },
]

export type HomeAppStore = {
  id: string
  label: string
  icon: string
  href: string
}

export const homeAppStores: HomeAppStore[] = [
  { id: 'bazaar', label: 'دریافت از بازار', icon: 'shopping-bag', href: '#' },
  { id: 'myket', label: 'دریافت از مایکت', icon: 'brand-android', href: '#' },
  { id: 'sibapp', label: 'دریافت نسخه iOS سیب‌اپ', icon: 'brand-apple', href: '#' },
]
