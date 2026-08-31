import type { AccountMyQuestion, AccountMyReview } from '~/data/account-reviews'

export function useAccountReviews() {
  const reviews = useState<AccountMyReview[]>('account-my-reviews', () => [])
  const questions = useState<AccountMyQuestion[]>('account-my-questions', () => [])
  const loaded = useState('account-my-reviews-loaded', () => false)

  async function fetchMyReviews(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { reviews: reviews.value, questions: questions.value, error: null as null }
    }

    const { result, error } = await useGet<{
      reviews: AccountMyReview[]
      questions: AccountMyQuestion[]
    }>('/account/reviews', { headers: { 'no-error': true } })

    if (error || !result) {
      reviews.value = []
      questions.value = []
      return { reviews: reviews.value, questions: questions.value, error }
    }

    reviews.value = Array.isArray(result.reviews) ? result.reviews : []
    questions.value = Array.isArray(result.questions) ? result.questions : []
    loaded.value = true
    return { reviews: reviews.value, questions: questions.value, error: null as null }
  }

  const reviewsWithReply = computed(
    () => reviews.value.filter(r => r.replies.length > 0).length,
  )

  const unansweredQuestions = computed(
    () => questions.value.filter(q => !q.answer).length,
  )

  return {
    reviews,
    questions,
    loaded,
    reviewsWithReply,
    unansweredQuestions,
    fetchMyReviews,
  }
}
