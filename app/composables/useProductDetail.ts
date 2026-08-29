import type { Product } from '~/data/products'
import type {
  ProductQuestion,
  ProductReview,
  ProductReviewSort,
  ProductReviewSummary,
  ProductSpecGroup,
} from '~/data/product-detail'

function buildSpecGroups(product: Product): ProductSpecGroup[] {
  if (!product.specs?.length) return []
  return [{ title: 'مشخصات فنی', items: product.specs }]
}

function buildCriteriaScores(product: Product) {
  if (!product.scores) return []
  return Object.entries(product.scores).map(([label, score]) => ({ label, score }))
}

function buildReviewSummary(reviews: ProductReview[]): ProductReviewSummary {
  const distribution = ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = reviews.filter(r => r.rating === stars).length
    const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0
    return { stars, percent, count }
  })
  const recommendCount = reviews.filter(r => r.rating >= 4).length
  const recommendPercent = reviews.length
    ? Math.round((recommendCount / reviews.length) * 100)
    : 0
  return { recommendPercent, distribution }
}

export function useProductDetail(product: MaybeRefOrGetter<Product | null | undefined>) {
  const p = computed(() => toValue(product))
  const allReviews = ref<ProductReview[]>([])
  const questions = ref<ProductQuestion[]>([])
  const related = ref<Product[]>([])
  const pending = ref(false)

  const specGroups = computed(() => (p.value ? buildSpecGroups(p.value) : []))
  const criteriaScores = computed(() => (p.value ? buildCriteriaScores(p.value) : []))
  const reviewSummary = computed(() => buildReviewSummary(allReviews.value))

  const reviewSort = ref<ProductReviewSort>('newest')
  const filterVerified = ref(false)
  const filterWithImage = ref(false)
  const filterStars = ref<number | null>(null)

  const filteredReviews = computed(() => {
    let list = [...allReviews.value]

    if (filterVerified.value) list = list.filter(r => r.verified)
    if (filterWithImage.value) list = list.filter(r => r.hasImage)
    if (filterStars.value !== null) list = list.filter(r => r.rating === filterStars.value)

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

  async function loadExtras(productId: string, category?: string) {
    pending.value = true
    const { fetchProducts } = useProducts()
    try {
      const [reviewsRes, questionsRes, relatedRes] = await Promise.all([
        useGet<ProductReview[]>(`/products/${encodeURIComponent(productId)}/reviews`, {
          headers: { 'no-error': true },
        }),
        useGet<ProductQuestion[]>(`/products/${encodeURIComponent(productId)}/questions`, {
          headers: { 'no-error': true },
        }),
        category
          ? fetchProducts({ category, pageSize: 8, sort: 'bestselling' })
          : Promise.resolve({ result: { items: [] as Product[] } }),
      ])
      allReviews.value = Array.isArray(reviewsRes.result) ? reviewsRes.result : []
      questions.value = Array.isArray(questionsRes.result) ? questionsRes.result : []
      related.value = (relatedRes.result?.items ?? []).filter(item => item.id !== productId).slice(0, 4)
    }
    finally {
      pending.value = false
    }
  }

  watch(
    () => p.value?.id,
    (id) => {
      if (!id) {
        allReviews.value = []
        questions.value = []
        related.value = []
        return
      }
      loadExtras(id, p.value?.category)
    },
    { immediate: true },
  )

  return {
    specGroups,
    reviewSummary,
    criteriaScores,
    allReviews,
    questions,
    related,
    pending,
    reviewSort,
    filterVerified,
    filterWithImage,
    filterStars,
    filteredReviews,
    toggleStarFilter,
    loadExtras,
  }
}

export type { ProductReview, ProductReviewSort }
