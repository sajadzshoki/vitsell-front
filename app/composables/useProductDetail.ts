import moment from 'jalali-moment'
import type { Product } from '~/data/products'
import {
  getProductCriteriaScores,
  getProductQuestions,
  getProductReviewSummary,
  getProductReviews,
  getProductSpecGroups,
  type ProductQuestion,
  type ProductReview,
  type ProductReviewSort,
} from '~/data/product-detail'

export type NewProductReviewInput = {
  rating: number
  text: string
  pros?: string[]
  cons?: string[]
  recommend?: boolean
}

export type NewProductQuestionInput = {
  question: string
}

function todayJalali() {
  return moment().locale('fa').format('jYYYY/jMM/jDD')
}

export function useProductDetail(product: MaybeRefOrGetter<Product>) {
  const p = computed(() => toValue(product))
  const { fullName } = useAccount()
  const { isLoggedIn } = useShop()

  const userReviewsByProduct = useState<Record<string, ProductReview[]>>(
    'product-user-reviews',
    () => ({}),
  )
  const userQuestionsByProduct = useState<Record<string, ProductQuestion[]>>(
    'product-user-questions',
    () => ({}),
  )

  const specGroups = computed(() => getProductSpecGroups(p.value))
  const reviewSummary = computed(() => getProductReviewSummary(p.value))
  const criteriaScores = computed(() => getProductCriteriaScores(p.value))

  const allReviews = computed(() => [
    ...(userReviewsByProduct.value[p.value.id] ?? []),
    ...getProductReviews(p.value),
  ])

  const questions = computed(() => [
    ...(userQuestionsByProduct.value[p.value.id] ?? []),
    ...getProductQuestions(p.value),
  ])

  const reviewSort = ref<ProductReviewSort>('newest')
  const filterVerified = ref(false)
  const filterWithImage = ref(false)
  const filterStars = ref<number | null>(null)

  const filteredReviews = computed(() => {
    let list = [...allReviews.value]

    if (filterVerified.value) {
      list = list.filter(r => r.verified)
    }
    if (filterWithImage.value) {
      list = list.filter(r => r.hasImage)
    }
    if (filterStars.value !== null) {
      list = list.filter(r => r.rating === filterStars.value)
    }

    switch (reviewSort.value) {
      case 'helpful':
        list.sort((a, b) => b.helpfulCount - a.helpfulCount)
        break
      case 'high':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'low':
        list.sort((a, b) => a.rating - b.rating)
        break
      default:
        break
    }

    return list
  })

  function toggleStarFilter(stars: number) {
    filterStars.value = filterStars.value === stars ? null : stars
  }

  function requireAuth() {
    if (isLoggedIn.value) return true
    const route = useRoute()
    navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return false
  }

  function addReview(input: NewProductReviewInput) {
    if (!requireAuth()) return false

    const review: ProductReview = {
      id: `ur-${Date.now()}`,
      name: fullName.value || 'کاربر دیجی‌شاپ',
      date: todayJalali(),
      rating: input.rating,
      text: input.text.trim(),
      verified: true,
      pros: input.pros?.length ? [...input.pros] : undefined,
      cons: input.cons?.length ? [...input.cons] : undefined,
      helpfulCount: 0,
    }

    const pid = p.value.id
    userReviewsByProduct.value = {
      ...userReviewsByProduct.value,
      [pid]: [review, ...(userReviewsByProduct.value[pid] ?? [])],
    }
    return true
  }

  function addQuestion(input: NewProductQuestionInput) {
    if (!requireAuth()) return false

    const item: ProductQuestion = {
      id: `uq-${Date.now()}`,
      name: fullName.value || 'کاربر دیجی‌شاپ',
      date: todayJalali(),
      verified: true,
      question: input.question.trim(),
    }

    const pid = p.value.id
    userQuestionsByProduct.value = {
      ...userQuestionsByProduct.value,
      [pid]: [item, ...(userQuestionsByProduct.value[pid] ?? [])],
    }
    return true
  }

  return {
    specGroups,
    reviewSummary,
    criteriaScores,
    allReviews,
    questions,
    reviewSort,
    filterVerified,
    filterWithImage,
    filterStars,
    filteredReviews,
    toggleStarFilter,
    addReview,
    addQuestion,
    requireAuth,
  }
}

export type { ProductReview, ProductReviewSort, ProductQuestion }
