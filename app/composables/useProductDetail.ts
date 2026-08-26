import type { Product } from '~/data/products'
import {
  getProductCriteriaScores,
  getProductQuestions,
  getProductReviewSummary,
  getProductReviews,
  getProductSpecGroups,
  type ProductReview,
  type ProductReviewSort,
} from '~/data/product-detail'

export function useProductDetail(product: MaybeRefOrGetter<Product>) {
  const p = computed(() => toValue(product))

  const specGroups = computed(() => getProductSpecGroups(p.value))
  const reviewSummary = computed(() => getProductReviewSummary(p.value))
  const criteriaScores = computed(() => getProductCriteriaScores(p.value))
  const allReviews = computed(() => getProductReviews(p.value))
  const questions = computed(() => getProductQuestions(p.value))

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
  }
}

export type { ProductReview, ProductReviewSort }
