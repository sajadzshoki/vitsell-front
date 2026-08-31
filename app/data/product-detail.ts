import { defaultSellerShop } from '~/data/seller'
import type { Product, ProductSpec } from '~/data/products'
import { categoryLabels } from '~/data/products'

export type ProductSpecGroup = {
  title: string
  items: ProductSpec[]
}

export type ProductReviewSort = 'newest' | 'helpful' | 'high' | 'low'

export type ProductReview = {
  id: string
  name: string
  date: string
  rating: number
  text: string
  verified: boolean
  pros?: string[]
  cons?: string[]
  hasImage?: boolean
  helpfulCount: number
}

export type StarDistribution = {
  stars: 1 | 2 | 3 | 4 | 5
  percent: number
  count: number
}

export type ProductReviewSummary = {
  recommendPercent: number
  distribution: StarDistribution[]
}

export type ProductQuestionAnswer = {
  author: string
  date: string
  text: string
  helpfulYes: number
  helpfulNo: number
}

export type ProductQuestion = {
  id: string
  name: string
  date: string
  verified: boolean
  question: string
  answer?: ProductQuestionAnswer
}

export type ProductBuyNote = {
  icon: string
  text: string
}

export const productDetailFeatures = [
  'گارانتی ۱۸ ماهه رسمی',
  'ارسال از انبار مرکزی تهران',
  'تحویل ۲۴ ساعته',
  'امکان پرداخت در محل',
] as const

export const productBuyNotes: ProductBuyNote[] = [
  {
    icon: 'truck-delivery',
    text: 'ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان',
  },
  {
    icon: 'refresh',
    text: '۷ روز ضمانت بازگشت کالا',
  },
  {
    icon: 'shield-check',
    text: 'تضمین اصالت کالا',
  },
]

export const productDescParagraphs = [
  'در طراحی این محصول، به تمامی جزئیات توجه ویژه‌ای شده است. از انتخاب مواد اولیه با کیفیت گرفته تا فرآیند تولید دقیق و کنترل کیفیت سختگیرانه، همه چیز برای ارائه بهترین تجربه به شما آماده شده است.',
  'ما در دیجی‌شاپ همیشه به دنبال ارائه بهترین محصولات با قیمت مناسب هستیم. این محصول با گارانتی اصالت کالا و پشتیبانی ۲۴ ساعته به فروش می‌رسد.',
] as const

export const productDefaultDesc =
  'این محصول یکی از بهترین گزینه‌های موجود در دسته‌بندی خود است. با کیفیت ساخت بالا و فناوری‌های روز دنیا، تجربه‌ای بی‌نظیر را برای شما رقم می‌زند.'

const defaultReviewSummary: ProductReviewSummary = {
  recommendPercent: 95,
  distribution: [
    { stars: 5, percent: 90, count: 1121 },
    { stars: 4, percent: 7, count: 87 },
    { stars: 3, percent: 2, count: 25 },
    { stars: 2, percent: 1, count: 8 },
    { stars: 1, percent: 0, count: 4 },
  ],
}

export const productMockReviews: ProductReview[] = [
  {
    id: 'r1',
    name: 'رضا محمدی',
    date: '۱۴۰۳/۰۹/۱۲',
    rating: 5,
    text: 'کیفیت ساخت فوق‌العاده‌ای داره. دوربین در نور کم هم عالی کار می‌کنه. ارسال هم خیلی سریع بود و بسته‌بندی مرتب.',
    verified: true,
    pros: ['کیفیت ساخت عالی', 'دوربین قوی', 'ارسال سریع'],
    cons: ['قیمت بالا'],
    hasImage: true,
    helpfulCount: 42,
  },
  {
    id: 'r2',
    name: 'علی رضایی',
    date: '۱۴۰۳/۰۹/۰۸',
    rating: 5,
    text: 'کیفیت فوق‌العاده‌ای داره. خیلی راضی هستم از خرید. ارسال هم سریع بود.',
    verified: true,
    pros: ['باتری خوب', 'صفحه‌نمایش عالی'],
    helpfulCount: 28,
  },
  {
    id: 'r3',
    name: 'سارا محمدی',
    date: '۱۴۰۳/۰۸/۲۵',
    rating: 4,
    text: 'محصول خوبیه ولی قیمت یکم بالاست. در کل ارزش خرید داره.',
    verified: true,
    cons: ['قیمت بالا'],
    helpfulCount: 15,
  },
  {
    id: 'r4',
    name: 'محمد کریمی',
    date: '۱۴۰۳/۰۸/۱۸',
    rating: 5,
    text: 'بهترین خریدی که تا حالا انجام دادم. حتماً پیشنهاد می‌کنم.',
    verified: true,
    pros: ['عملکرد سریع', 'طراحی زیبا'],
    helpfulCount: 36,
  },
  {
    id: 'r5',
    name: 'مریم احمدی',
    date: '۱۴۰۳/۰۸/۱۰',
    rating: 3,
    text: 'محصول خوبه ولی انتظار بیشتری از باتری داشتم. در کل قابل قبوله.',
    verified: false,
    cons: ['باتری متوسط'],
    helpfulCount: 7,
  },
  {
    id: 'r6',
    name: 'حسین نوری',
    date: '۱۴۰۳/۰۷/۲۸',
    rating: 5,
    text: 'از هر نظر عالیه. گارانتی رسمی هم داشت که خیالم راحت شد.',
    verified: true,
    hasImage: true,
    helpfulCount: 19,
  },
  {
    id: 'r7',
    name: 'فاطمه حسینی',
    date: '۱۴۰۳/۰۷/۱۵',
    rating: 4,
    text: 'صفحه‌نمایش و دوربینش واقعاً خوبه. فقط شارژر توی جعبه نیست.',
    verified: true,
    pros: ['صفحه‌نمایش عالی'],
    cons: ['بدون شارژر'],
    helpfulCount: 11,
  },
  {
    id: 'r8',
    name: 'امیر زارعی',
    date: '۱۴۰۳/۰۷/۰۲',
    rating: 2,
    text: 'انتظار بیشتری داشتم. گرم شدن در بازی‌های سنگین آزاردهنده‌ست.',
    verified: true,
    cons: ['گرم شدن در بازی'],
    helpfulCount: 4,
  },
]

export const productMockQuestions: ProductQuestion[] = [
  {
    id: 'q1',
    name: 'کاربر بازار',
    date: '۱۴۰۳/۰۹/۱۵',
    verified: true,
    question: 'آیا این محصول دارای گارانتی رسمی است؟',
    answer: {
      author: 'کارشناس بازار',
      date: '۱۴۰۳/۰۹/۱۵',
      text: 'بله، این محصول دارای ۱۸ ماه گارانتی رسمی شرکتی است و کارت گارانتی در بسته‌بندی محصول قرار دارد.',
      helpfulYes: 24,
      helpfulNo: 2,
    },
  },
  {
    id: 'q2',
    name: 'پریسا اکبری',
    date: '۱۴۰۳/۰۹/۱۰',
    verified: true,
    question: 'آیا شارژر در جعبه محصول وجود دارد؟',
    answer: {
      author: 'کارشناس بازار',
      date: '۱۴۰۳/۰۹/۱۰',
      text: 'خیر، مطابق سیاست جدید اپل، شارژر و هندزفری در جعبه قرار نمی‌گیرد. کابل USB-C به USB-C در جعبه موجود است.',
      helpfulYes: 18,
      helpfulNo: 1,
    },
  },
  {
    id: 'q3',
    name: 'مهدی رحیمی',
    date: '۱۴۰۳/۰۸/۲۸',
    verified: false,
    question: 'آیا این مدل از eSIM پشتیبانی می‌کند؟',
    answer: {
      author: 'کارشناس بازار',
      date: '۱۴۰۳/۰۸/۲۹',
      text: 'بله، این مدل از دو سیم‌کارت فیزیکی و eSIM پشتیبانی می‌کند. برای فعال‌سازی eSIM با اپراتور خود تماس بگیرید.',
      helpfulYes: 12,
      helpfulNo: 0,
    },
  },
]

const mobileSpecGroups: ProductSpecGroup[] = [
  {
    title: 'اطلاعات عمومی',
    items: [
      { key: 'برند', value: 'Apple' },
      { key: 'مدل', value: 'iPhone 16 Pro Max' },
      {
        key: 'رنگ',
        value: 'تیتانیوم طبیعی، مشکی، سفید، آبی تیتانیوم',
      },
    ],
  },
  {
    title: 'نمایشگر',
    items: [
      { key: 'نمایشگر', value: 'Super Retina XDR OLED، ۱۲۰۰ نیت' },
      { key: 'اندازه صفحه', value: '۶.۹ اینچ' },
      { key: 'رزولوشن', value: '۱۳۲۰×۲۸۶۸ پیکسل' },
    ],
  },
  {
    title: 'عملکرد',
    items: [
      { key: 'پردازنده', value: 'Apple A18 Pro' },
      { key: 'حافظه داخلی', value: '۲۵۶ گیگابایت' },
      { key: 'رم', value: '۸ گیگابایت' },
    ],
  },
  {
    title: 'دوربین و باتری',
    items: [
      { key: 'دوربین', value: '۴۸ + ۱۲ + ۱۲ مگاپیکسل (تله‌فوتو ۵×)' },
      { key: 'باتری', value: '۴۶۸۵ میلی‌آمپرساعت، شارژ ۲۷ وات' },
    ],
  },
]

const specGroupOverrides: Record<string, ProductSpecGroup[]> = {
  'iphone-16-pro': mobileSpecGroups,
}

export function getProductSpecGroups(product: Product): ProductSpecGroup[] {
  if (specGroupOverrides[product.id]) {
    return specGroupOverrides[product.id]
  }

  if (product.specs?.length) {
    const mid = Math.ceil(product.specs.length / 2)
    return [
      {
        title: 'مشخصات کلی',
        items: product.specs.slice(0, mid),
      },
      {
        title: 'سایر مشخصات',
        items: product.specs.slice(mid),
      },
    ]
  }

  return [
    {
      title: 'مشخصات کلی',
      items: [
        { key: 'برند', value: product.brand },
        {
          key: 'دسته‌بندی',
          value: categoryLabels[product.category] ?? product.categoryLabel,
        },
        {
          key: 'امتیاز کاربران',
          value: `${product.rating.toLocaleString('fa-IR')} از ۵`,
        },
        { key: 'گارانتی', value: '۱۸ ماه گارانتی رسمی' },
      ],
    },
  ]
}

/** مشخصات کلیدی برای گرید خلاصه کنار گالری (مثل ویژگی‌های دیجی‌کالا) */
export function getProductHighlightSpecs(product: Product, limit = 6): ProductSpec[] {
  if (product.specs?.length) {
    return product.specs.slice(0, limit)
  }
  return getProductSpecGroups(product)
    .flatMap(group => group.items)
    .slice(0, limit)
}

/** نکته مرجوعی کوتاه کنار مشخصات (الهام از صفحه محصول دیجی‌کالا) */
export function getProductReturnNote(product: Product): string {
  const byCategory: Record<string, string> = {
    mobile:
      'کالای دیجیتال با پلمب، در صورت باز شدن پلمب یا استفاده، فقط در صورت وجود مشکل فنی مشمول مرجوعی است.',
    laptop:
      'لپ‌تاپ تنها در صورت پلمب بودن و عدم استفاده، طبق شرایط مرجوعی فروشگاه قابل بازگشت است.',
    audio:
      'به دلایل بهداشتی، هدفون و هندزفری بازشده معمولاً قابل مرجوعی نیستند مگر نقص فنی تأییدشده.',
    watch:
      'ساعت هوشمند در صورت باز شدن بسته‌بندی یا نصب، فقط با تأیید نقص فنی قابل مرجوعی است.',
    gaming:
      'کنسول و بازی در صورت باز شدن پلمب نرم‌افزاری/بسته‌بندی، مشمول شرایط خاص مرجوعی است.',
  }
  return (
    byCategory[product.category]
    ?? 'امکان مرجوعی کالا طبق قوانین فروشگاه و تا ۷ روز پس از تحویل، در صورت سلامت کالا و بسته‌بندی، وجود دارد.'
  )
}

export function getProductReviewSummary(product: Product): ProductReviewSummary {
  const total = product.reviews || productMockReviews.length
  if (total >= 500) {
    return defaultReviewSummary
  }

  const avg = product.rating
  const fiveStar = Math.round(total * (avg / 5) * 0.85)
  const fourStar = Math.round(total * 0.1)
  const rest = Math.max(0, total - fiveStar - fourStar)

  return {
    recommendPercent: Math.round((avg / 5) * 100),
    distribution: [
      { stars: 5, percent: Math.round((fiveStar / total) * 100), count: fiveStar },
      { stars: 4, percent: Math.round((fourStar / total) * 100), count: fourStar },
      { stars: 3, percent: Math.round((rest * 0.5 / total) * 100), count: Math.round(rest * 0.5) },
      { stars: 2, percent: Math.round((rest * 0.3 / total) * 100), count: Math.round(rest * 0.3) },
      { stars: 1, percent: Math.round((rest * 0.2 / total) * 100), count: Math.round(rest * 0.2) },
    ],
  }
}

export function getProductCriteriaScores(
  product: Product,
): { label: string, score: number }[] {
  if (!product.scores) return []

  return Object.entries(product.scores).map(([label, value]) => ({
    label,
    score: Math.round((value / 20) * 10) / 10,
  }))
}

export function getProductReviews(_product: Product): ProductReview[] {
  return productMockReviews
}

export function getProductQuestions(_product: Product): ProductQuestion[] {
  return productMockQuestions
}

export const productSellerName = defaultSellerShop.name
