import { productMockQuestions } from '~/data/product-detail'
import { products } from '~/data/products'

export type SellerQuestionAnswer = {
  author: string
  date: string
  text: string
}

export type SellerProductQuestion = {
  id: string
  productId: string
  name: string
  date: string
  verified: boolean
  question: string
  answer: SellerQuestionAnswer | null
}

function todayFa() {
  return new Date().toLocaleDateString('fa-IR')
}

/** Seed: سوالات mock روی چند محصول واقعی */
export function buildDefaultSellerQuestions(): SellerProductQuestion[] {
  const productIds = products.slice(0, 8).map(p => p.id)
  const extras: SellerProductQuestion[] = [
    {
      id: 'sq-pending-1',
      productId: productIds[0] ?? 'iphone-16-pro',
      name: 'حسین نادری',
      date: '۱۴۰۳/۰۹/۲۲',
      verified: true,
      question: 'آیا امکان خرید اقساطی برای این کالا وجود دارد؟',
      answer: null,
    },
    {
      id: 'sq-pending-2',
      productId: productIds[1] ?? 'galaxy-s25-ultra',
      name: 'مینا رضایی',
      date: '۱۴۰۳/۰۹/۲۱',
      verified: false,
      question: 'رنگ مشکی موجود است؟ زمان ارسال به شهرستان چقدر است؟',
      answer: null,
    },
    {
      id: 'sq-pending-3',
      productId: productIds[3] ?? 'sony-xm5',
      name: 'کیانوش مرادی',
      date: '۱۴۰۳/۰۹/۲۰',
      verified: true,
      question: 'آیا نویزکنسلینگ در محیط مترو خوب عمل می‌کند؟',
      answer: null,
    },
  ]

  const seeded = productMockQuestions.map((q, index) => ({
    id: `sq-${q.id}`,
    productId: productIds[index % productIds.length] ?? 'iphone-16-pro',
    name: q.name,
    date: q.date,
    verified: q.verified,
    question: q.question,
    answer: q.answer
      ? {
          author: q.answer.author,
          date: q.answer.date,
          text: q.answer.text,
        }
      : null,
  }))

  return [...extras, ...seeded]
}

export function formatSellerAnswerDate() {
  return todayFa()
}
