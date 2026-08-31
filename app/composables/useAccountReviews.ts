import {
  defaultMyQuestions,
  defaultMyReviews,
  type AccountMyQuestion,
  type AccountMyReview,
} from '~/data/account-reviews'

export function useAccountReviews() {
  const reviews = useState<AccountMyReview[]>(
    'account-my-reviews',
    () => [...defaultMyReviews],
  )
  const questions = useState<AccountMyQuestion[]>(
    'account-my-questions',
    () => [...defaultMyQuestions],
  )
  const loaded = useState('account-my-reviews-loaded', () => false)

  /** تا آماده‌شدن بک‌اند از mock استفاده می‌شود. */
  async function fetchMyReviews() {
    await new Promise(resolve => setTimeout(resolve, 280))
    reviews.value = [...defaultMyReviews]
    questions.value = [...defaultMyQuestions]
    loaded.value = true
    return { reviews: reviews.value, questions: questions.value }
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
