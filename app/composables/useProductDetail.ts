import type { Product } from '~/data/products'
import {
  buildReviewSummary,
  getProductCriteriaScores,
  getProductSpecGroups,
  reviewHasImages,
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
  images?: string[]
}

export type NewProductQuestionInput = {
  question: string
}

type ReviewCreateResult = ProductReview & {
  productStats?: { rating: number, reviews: number }
}

export function useProductDetail(product: MaybeRefOrGetter<Product | null | undefined>) {
  const p = computed(() => toValue(product))
  const productId = computed(() => p.value?.id ?? '')
  const { isLoggedIn } = useShop()
  const { remember } = useProducts()
  const { fetchRelatedForProduct } = useRelatedProducts()

  const apiReviewsByProduct = useState<Record<string, ProductReview[]>>(
    'product-api-reviews',
    () => ({}),
  )
  const apiQuestionsByProduct = useState<Record<string, ProductQuestion[]>>(
    'product-api-questions',
    () => ({}),
  )
  const relatedByProduct = useState<Record<string, Product[]>>(
    'product-related',
    () => ({}),
  )
  const detailPending = useState('product-detail-pending', () => false)
  const detailLoadedIds = useState<Record<string, boolean>>(
    'product-detail-loaded',
    () => ({}),
  )

  const specGroups = computed(() =>
    p.value ? getProductSpecGroups(p.value) : [],
  )
  const allReviews = computed(() => apiReviewsByProduct.value[productId.value] ?? [])
  const reviewSummary = computed(() => buildReviewSummary(allReviews.value))
  const criteriaScores = computed(() =>
    p.value ? getProductCriteriaScores(p.value) : [],
  )

  const displayRating = computed(() => {
    if (allReviews.value.length) {
      const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0)
      return Math.round((sum / allReviews.value.length) * 10) / 10
    }
    return p.value?.rating ?? 0
  })

  const displayReviewCount = computed(() =>
    allReviews.value.length || p.value?.reviews || 0,
  )

  const related = computed(() => relatedByProduct.value[productId.value] ?? [])
  const questions = computed(() => apiQuestionsByProduct.value[productId.value] ?? [])

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
      list = list.filter(r => reviewHasImages(r))
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

  function applyProductStats(stats?: { rating: number, reviews: number }) {
    const current = p.value
    if (!current || !stats) return
    const next = { ...current, rating: stats.rating, reviews: stats.reviews }
    remember([next])
    if (isRef(product)) {
      ;(product as Ref<Product | null | undefined>).value = next
    }
  }

  async function fetchDetail(options?: { force?: boolean }) {
    const id = productId.value
    if (!id) return
    if (detailLoadedIds.value[id] && !options?.force) return

    detailPending.value = true
    try {
      const [reviewsRes, questionsRes, relatedItems] = await Promise.all([
        useGet<ProductReview[]>(
          `/products/${encodeURIComponent(id)}/reviews`,
          { headers: { 'no-error': true } },
        ),
        useGet<ProductQuestion[]>(
          `/products/${encodeURIComponent(id)}/questions`,
          { headers: { 'no-error': true } },
        ),
        fetchRelatedForProduct(p.value),
      ])

      apiReviewsByProduct.value = {
        ...apiReviewsByProduct.value,
        [id]: Array.isArray(reviewsRes.result) ? reviewsRes.result : [],
      }
      apiQuestionsByProduct.value = {
        ...apiQuestionsByProduct.value,
        [id]: Array.isArray(questionsRes.result) ? questionsRes.result : [],
      }
      relatedByProduct.value = {
        ...relatedByProduct.value,
        [id]: relatedItems,
      }
      detailLoadedIds.value = { ...detailLoadedIds.value, [id]: true }
    }
    finally {
      detailPending.value = false
    }
  }

  async function addReview(input: NewProductReviewInput) {
    if (!requireAuth()) return false
    const pid = productId.value
    if (!pid) return false

    const { result, error } = await usePost<ReviewCreateResult>(
      `/products/${encodeURIComponent(pid)}/reviews`,
      {
        rating: input.rating,
        text: input.text.trim(),
        recommend: input.recommend ?? true,
        ...(input.pros?.length ? { pros: input.pros } : {}),
        ...(input.cons?.length ? { cons: input.cons } : {}),
        ...(input.images?.length ? { images: input.images } : {}),
      },
      { headers: { 'no-error': true } },
    )

    if (error || !result) return false

    const { productStats, ...review } = result
    apiReviewsByProduct.value = {
      ...apiReviewsByProduct.value,
      [pid]: [review, ...(apiReviewsByProduct.value[pid] ?? [])],
    }
    applyProductStats(productStats)
    return true
  }

  async function addQuestion(input: NewProductQuestionInput) {
    if (!requireAuth()) return false
    const pid = productId.value
    if (!pid) return false

    const { result, error } = await usePost<ProductQuestion>(
      `/products/${encodeURIComponent(pid)}/questions`,
      { question: input.question.trim() },
      { headers: { 'no-error': true } },
    )

    if (error || !result) return false

    apiQuestionsByProduct.value = {
      ...apiQuestionsByProduct.value,
      [pid]: [result, ...(apiQuestionsByProduct.value[pid] ?? [])],
    }
    return true
  }

  return {
    specGroups,
    reviewSummary,
    criteriaScores,
    displayRating,
    displayReviewCount,
    related,
    allReviews,
    questions,
    reviewSort,
    filterVerified,
    filterWithImage,
    filterStars,
    filteredReviews,
    detailPending,
    toggleStarFilter,
    fetchDetail,
    addReview,
    addQuestion,
    requireAuth,
  }
}

export type { ProductReview, ProductReviewSort, ProductQuestion }
