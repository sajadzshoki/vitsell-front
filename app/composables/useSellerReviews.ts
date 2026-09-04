import type { SellerReview, SellerReviewModeration } from '~/data/seller'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

export type SellerReviewsQuery = {
  q?: string
  status?: string
  rating?: number | string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerReviewsPage = {
  items: SellerReview[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function toReview(raw: any): SellerReview {
  const moderation = ['pending', 'approved', 'rejected', 'hidden'].includes(raw?.moderation)
    ? (raw.moderation as SellerReviewModeration)
    : 'approved'
  return {
    id: String(raw.id),
    productId: String(raw.productId || ''),
    name: String(raw.name || ''),
    rating: Math.min(5, Math.max(1, Math.round(Number(raw.rating) || 1))),
    text: String(raw.text || ''),
    date: String(raw.date || ''),
    ...(raw.reply ? { reply: String(raw.reply) } : {}),
    moderation,
  }
}

export function useSellerReviews() {
  const items = useState<SellerReview[]>('seller-reviews-list', () => [])
  const listMeta = useState('seller-reviews-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      unanswered: 0,
      answered: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      hidden: 0,
    } as Record<string, number>,
  }))
  const pending = useState('seller-reviews-pending', () => false)

  const reviews = computed(() => items.value)
  const unansweredCount = computed(
    () => Number(listMeta.value.statusCounts.unanswered) || items.value.filter(r => !r.reply).length,
  )

  async function fetchList(query?: SellerReviewsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.rating != null && query.rating !== '' && query.rating !== 'all') {
        params.rating = Number(query.rating)
      }
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerReviewsPage | SellerReview[]>(
        '/seller/reviews',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'reviews-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toReview)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            unanswered: items.value.filter(r => !r.reply).length,
            answered: items.value.filter(r => Boolean(r.reply)).length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toReview) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || { all: items.value.length },
        }
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function reply(id: string, replyText: string) {
    const { result, error } = await usePost<SellerReview>(
      `/seller/reviews/${encodeURIComponent(id)}/reply`,
      { reply: replyText },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت پاسخ ناموفق بود') }
    }
    const next = toReview(result)
    items.value = items.value.map(r => (r.id === id ? next : r))
    return { ok: true as const, review: next }
  }

  async function setModeration(id: string, moderation: SellerReviewModeration) {
    const { result, error } = await usePatch<SellerReview>(
      `/seller/reviews/${encodeURIComponent(id)}/moderation`,
      { moderation },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی وضعیت ناموفق بود') }
    }
    const next = toReview(result)
    items.value = items.value.map(r => (r.id === id ? next : r))
    return { ok: true as const, review: next }
  }

  async function bulkSetModeration(ids: string[], moderation: SellerReviewModeration) {
    const { result, error } = await usePost<{ updated: number }>(
      '/seller/reviews/bulk-moderation',
      { ids, moderation },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'اقدام گروهی ناموفق بود') }
    }
    items.value = items.value.map(r =>
      ids.includes(r.id) ? { ...r, moderation } : r,
    )
    return { ok: true as const, updated: Number(result?.updated) || ids.length }
  }

  return {
    reviews,
    listMeta,
    pending: computed(() => pending.value),
    unansweredCount,
    fetchList,
    reply,
    setModeration,
    bulkSetModeration,
  }
}
