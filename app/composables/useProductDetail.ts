import type { Product } from '~/data/products'
import {
  getProductCriteriaScores,
  getProductReviewSummary,
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

export function useProductDetail(product: MaybeRefOrGetter<Product | null | undefined>) {
  const p = computed(() => toValue(product))
  const productId = computed(() => p.value?.id ?? '')
  const { isLoggedIn } = useShop()
  const { fetchProducts } = useProducts()

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
  const reviewSummary = computed(() =>
    p.value
      ? getProductReviewSummary(p.value)
      : { recommendPercent: 0, distribution: [] },
  )
  const criteriaScores = computed(() =>
    p.value ? getProductCriteriaScores(p.value) : [],
  )

  const related = computed(() => relatedByProduct.value[productId.value] ?? [])
  const allReviews = computed(() => apiReviewsByProduct.value[productId.value] ?? [])
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

  async function fetchDetail(options?: { force?: boolean }) {
    const id = productId.value
    if (!id) return
    if (detailLoadedIds.value[id] && !options?.force) return

    detailPending.value = true
    try {
      const [reviewsRes, questionsRes, relatedRes] = await Promise.all([
        useGet<ProductReview[]>(
          `/products/${encodeURIComponent(id)}/reviews`,
          { headers: { 'no-error': true } },
        ),
        useGet<ProductQuestion[]>(
          `/products/${encodeURIComponent(id)}/questions`,
          { headers: { 'no-error': true } },
        ),
        fetchProducts({
          category: p.value?.category,
          pageSize: 8,
          page: 1,
        }),
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
        [id]: (relatedRes.result?.items ?? [])
          .filter(item => item.id !== id)
          .slice(0, 4),
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

    const { result, error } = await usePost<ProductReview>(
      `/products/${encodeURIComponent(pid)}/reviews`,
      {
        rating: input.rating,
        text: input.text.trim(),
        ...(input.pros?.length ? { pros: input.pros } : {}),
        ...(input.cons?.length ? { cons: input.cons } : {}),
      },
      { headers: { 'no-error': true } },
    )

    if (error || !result) return false

    apiReviewsByProduct.value = {
      ...apiReviewsByProduct.value,
      [pid]: [result, ...(apiReviewsByProduct.value[pid] ?? [])],
    }
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
