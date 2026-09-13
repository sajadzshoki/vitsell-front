import { getProductById } from '~/data/products'

export type AccountReviewReply = {
  id: string
  author: string
  date: string
  text: string
  role: 'seller' | 'support'
}

export type AccountMyReview = {
  id: string
  productId: string
  productTitle: string
  productImage: string
  date: string
  rating: number
  text: string
  verified: boolean
  pros?: string[]
  cons?: string[]
  helpfulCount: number
  replies: AccountReviewReply[]
}

export type AccountMyQuestionAnswer = {
  author: string
  date: string
  text: string
  role: 'seller' | 'support'
}

export type AccountMyQuestion = {
  id: string
  productId: string
  productTitle: string
  productImage: string
  date: string
  question: string
  verified: boolean
  answer?: AccountMyQuestionAnswer
}

function productSnap(id: string) {
  const product = getProductById(id)
  return {
    productId: product.id,
    productTitle: product.title,
    productImage: product.image,
  }
}

export const defaultMyReviews: AccountMyReview[] = [
  {
    id: 'ar-1',
    ...productSnap('iphone-16-pro'),
    date: '۱۴۰۳/۰۹/۱۲',
    rating: 5,
    text: 'کیفیت ساخت فوق‌العاده‌ای داره. دوربین در نور کم هم عالی کار می‌کنه. ارسال هم خیلی سریع بود و بسته‌بندی مرتب.',
    verified: true,
    pros: ['کیفیت ساخت عالی', 'دوربین قوی', 'ارسال سریع'],
    cons: ['قیمت بالا'],
    helpfulCount: 42,
    replies: [
      {
        id: 'arr-1',
        author: 'فروشگاه اپل‌سنتر',
        date: '۱۴۰۳/۰۹/۱۳',
        text: 'از خرید و نظر ارزشمندتون سپاسگزاریم. خوشحالیم که از دوربین و ارسال راضی بودید.',
        role: 'seller',
      },
      {
        id: 'arr-2',
        author: 'پشتیبانی ویتسل',
        date: '۱۴۰۳/۰۹/۱۴',
        text: 'اگر سوالی درباره گارانتی داشتید، از طریق تیکت با ما در ارتباط باشید.',
        role: 'support',
      },
    ],
  },
  {
    id: 'ar-2',
    ...productSnap('sony-xm5'),
    date: '۱۴۰۳/۰۸/۲۸',
    rating: 4,
    text: 'نویزکنسلینگ خیلی خوبه و باتری تا چند روز دوام میاره. فقط روی گوش کمی سنگینه.',
    verified: true,
    pros: ['نویزکنسلینگ عالی', 'باتری قوی'],
    cons: ['وزن نسبتاً زیاد'],
    helpfulCount: 18,
    replies: [
      {
        id: 'arr-3',
        author: 'فروشگاه سونی‌شاپ',
        date: '۱۴۰۳/۰۸/۲۹',
        text: 'ممنون از بازخوردتون. برای راحتی بیشتر، پیشنهاد می‌کنیم از پدهای جایگزین نرم‌تر استفاده کنید.',
        role: 'seller',
      },
    ],
  },
  {
    id: 'ar-3',
    ...productSnap('apple-watch-ultra'),
    date: '۱۴۰۳/۰۷/۱۵',
    rating: 5,
    text: 'برای کوهنوردی و دویدن عالیه. صفحه‌نمایش در نور آفتاب کاملاً خواناست.',
    verified: true,
    pros: ['مقاومت بالا', 'GPS دقیق'],
    helpfulCount: 27,
    replies: [],
  },
  {
    id: 'ar-4',
    ...productSnap('ps5-pro'),
    date: '۱۴۰۳/۰۶/۲۰',
    rating: 3,
    text: 'کنسول خوبیه ولی انتظار داشتم بازی‌های بیشتری همراهش باشه. عملکرد گرافیکی قابل قبوله.',
    verified: true,
    cons: ['بدون بازی همراه'],
    helpfulCount: 9,
    replies: [
      {
        id: 'arr-4',
        author: 'فروشگاه گیم‌زون',
        date: '۱۴۰۳/۰۶/۲۱',
        text: 'نسخه‌های همراه بازی به‌صورت جداگانه عرضه می‌شوند؛ در صورت تمایل پک‌های پیشنهادی را در فروشگاه ببینید.',
        role: 'seller',
      },
    ],
  },
]

export const defaultMyQuestions: AccountMyQuestion[] = [
  {
    id: 'aq-1',
    ...productSnap('iphone-16-pro'),
    date: '۱۴۰۳/۰۹/۱۵',
    question: 'آیا این محصول دارای گارانتی رسمی است؟',
    verified: true,
    answer: {
      author: 'کارشناس ویتسل',
      date: '۱۴۰۳/۰۹/۱۵',
      text: 'بله، این محصول دارای ۱۸ ماه گارانتی رسمی شرکتی است و کارت گارانتی در بسته‌بندی قرار دارد.',
      role: 'support',
    },
  },
  {
    id: 'aq-2',
    ...productSnap('sony-xm5'),
    date: '۱۴۰۳/۰۸/۱۰',
    question: 'آیا با آیفون سازگار است و اپلیکیشن اختصاصی دارد؟',
    verified: true,
    answer: {
      author: 'فروشگاه سونی‌شاپ',
      date: '۱۴۰۳/۰۸/۱۱',
      text: 'بله، کاملاً با iOS سازگار است و اپلیکیشن Sony Headphones Connect روی App Store در دسترس است.',
      role: 'seller',
    },
  },
  {
    id: 'aq-3',
    ...productSnap('apple-watch-ultra'),
    date: '۱۴۰۳/۰۷/۰۵',
    question: 'باتری در حالت GPS فعال چند ساعت دوام می‌آورد؟',
    verified: true,
    answer: {
      author: 'کارشناس ویتسل',
      date: '۱۴۰۳/۰۷/۰۶',
      text: 'در حالت تمرین با GPS حدود ۳۶ ساعت و در حالت کم‌مصرف تا ۷۲ ساعت دوام دارد.',
      role: 'support',
    },
  },
  {
    id: 'aq-4',
    ...productSnap('ps5-pro'),
    date: '۱۴۰۳/۰۹/۲۰',
    question: 'آیا پایه عمودی داخل جعبه هست؟',
    verified: false,
  },
]
