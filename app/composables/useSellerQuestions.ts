import {
  type SellerProductQuestion,
} from '~/data/seller-questions'

type ApiProductQuestion = {
  id: string
  productId?: string
  name: string
  date: string
  verified: boolean
  question: string
  answer?: {
    author: string
    date: string
    text: string
  } | null
}

export type SellerQuestionsQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerQuestionsPage = {
  items: ApiProductQuestion[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function toSellerQuestion(
  q: ApiProductQuestion,
  fallbackProductId = '',
): SellerProductQuestion {
  return {
    id: q.id,
    productId: q.productId?.trim() || fallbackProductId,
    name: q.name,
    date: q.date,
    verified: Boolean(q.verified),
    question: q.question,
    answer: q.answer
      ? {
          author: q.answer.author,
          date: q.answer.date,
          text: q.answer.text,
        }
      : null,
  }
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

export function useSellerQuestions() {
  const items = useState<SellerProductQuestion[]>('seller-product-questions', () => [])
  const listMeta = useState('seller-product-questions-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      unanswered: 0,
      answered: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-product-questions-seeded', () => false)
  const pending = useState('seller-product-questions-pending', () => false)
  const inFlight = useState<Promise<void> | null>('seller-product-questions-inflight', () => null)

  const { fetchProduct, getCachedProduct } = useProducts()

  const questions = computed(() => items.value)

  const unansweredCount = computed(
    () => Number(listMeta.value.statusCounts.unanswered)
      || items.value.filter(q => !q.answer).length,
  )

  function upsert(question: SellerProductQuestion) {
    const index = items.value.findIndex(q => q.id === question.id)
    if (index === -1) {
      items.value = [question, ...items.value]
      return
    }
    const copy = [...items.value]
    copy[index] = question
    items.value = copy
  }

  function mergeQuestions(productId: string, incoming: SellerProductQuestion[]) {
    const others = items.value.filter(q => q.productId !== productId)
    items.value = [...incoming, ...others]
    seeded.value = true
  }

  async function hydrateProducts(productIds: string[]) {
    const unique = [...new Set(productIds.filter(Boolean))]
    await Promise.all(
      unique
        .filter(id => !getCachedProduct(id))
        .map(id => fetchProduct(id)),
    )
  }

  function applyPageResult(result: SellerQuestionsPage | ApiProductQuestion[], replaceItems: boolean) {
    if (Array.isArray(result)) {
      if (replaceItems) {
        items.value = result.map(q => toSellerQuestion(q))
      }
      listMeta.value = {
        total: result.length,
        page: 1,
        pageSize: result.length,
        statusCounts: {
          all: result.length,
          unanswered: result.filter(q => !q.answer).length,
          answered: result.filter(q => Boolean(q.answer)).length,
        },
      }
      return
    }

    if (replaceItems) {
      items.value = Array.isArray(result.items)
        ? result.items.map(q => toSellerQuestion(q))
        : []
    }
    listMeta.value = {
      total: Number(result.total) || (replaceItems ? items.value.length : listMeta.value.total),
      page: Number(result.page) || 1,
      pageSize: Number(result.pageSize) || 10,
      statusCounts: result.statusCounts || {
        all: replaceItems ? items.value.length : listMeta.value.statusCounts.all,
        unanswered: replaceItems
          ? items.value.filter(q => !q.answer).length
          : listMeta.value.statusCounts.unanswered,
        answered: replaceItems
          ? items.value.filter(q => Boolean(q.answer)).length
          : listMeta.value.statusCounts.answered,
      },
    }
  }

  async function fetchList(query?: SellerQuestionsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerQuestionsPage | ApiProductQuestion[]>(
        '/seller/questions',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'questions-fetch-failed' } }
      }

      applyPageResult(result, true)
      seeded.value = true
      await hydrateProducts(items.value.map(q => q.productId))
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    if (inFlight.value && !options?.force) {
      await inFlight.value
      return { ok: true as const, error: null as null }
    }

    pending.value = true
    const run = (async () => {
      const { result, error } = await useGet<SellerQuestionsPage | ApiProductQuestion[]>(
        '/seller/questions',
        {
          query: { page: 1, pageSize: 1 },
          headers: { 'no-error': true },
          server: false,
        },
      )

      if (error || result == null) {
        seeded.value = true
        return
      }

      // Badge/count hydrate: keep an existing list page intact unless empty/forced
      const replaceItems = options?.force || !items.value.length
      applyPageResult(result, replaceItems)
      seeded.value = true
      if (replaceItems) {
        await hydrateProducts(items.value.map(q => q.productId))
      }
    })()

    inFlight.value = run
    try {
      await run
      return { ok: true as const, error: null as null }
    }
    finally {
      if (inFlight.value === run) inFlight.value = null
      pending.value = false
    }
  }

  async function fetchForProduct(productId: string) {
    const id = productId.trim()
    if (!id) return { ok: false as const }

    const { result, error } = await useGet<ApiProductQuestion[]>(
      `/products/${encodeURIComponent(id)}/questions`,
      { headers: { 'no-error': true } },
    )

    if (error || !Array.isArray(result)) {
      return { ok: false as const, error }
    }

    mergeQuestions(
      id,
      result.map(q => toSellerQuestion(q, id)),
    )
    return { ok: true as const, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(q => q.id === id)
  }

  async function replyToQuestion(id: string, text: string, author = 'کارشناس دیجی‌شاپ') {
    const trimmed = text.trim()
    if (!trimmed) {
      return { ok: false as const, error: 'متن پاسخ خالی است' }
    }

    const { result, error } = await usePost<ApiProductQuestion>(
      `/seller/questions/${encodeURIComponent(id)}/reply`,
      { text: trimmed, author },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'ثبت پاسخ ناموفق بود'),
      }
    }

    const mapped = toSellerQuestion(result, getById(id)?.productId ?? '')
    upsert(mapped)
    return { ok: true as const, question: mapped }
  }

  async function clearAnswer(id: string) {
    const { result, error } = await useDelete<ApiProductQuestion>(
      `/seller/questions/${encodeURIComponent(id)}/answer`,
      { headers: { 'no-error': true } },
    )

    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'حذف پاسخ ناموفق بود'),
      }
    }

    const mapped = toSellerQuestion(result, getById(id)?.productId ?? '')
    upsert(mapped)
    return { ok: true as const, question: mapped }
  }

  async function setVerified(id: string, verified: boolean) {
    const { result, error } = await usePatch<ApiProductQuestion>(
      `/seller/questions/${encodeURIComponent(id)}/verified`,
      { verified },
      { headers: { 'no-error': true } },
    )

    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'به‌روزرسانی تأیید ناموفق بود'),
      }
    }

    const mapped = toSellerQuestion(result, getById(id)?.productId ?? '')
    upsert(mapped)
    return { ok: true as const, question: mapped }
  }

  async function deleteQuestion(id: string) {
    const { error } = await useDelete<{ ok: boolean }>(
      `/seller/questions/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )

    if (error) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'حذف پرسش ناموفق بود'),
      }
    }

    items.value = items.value.filter(q => q.id !== id)
    return { ok: true as const }
  }

  return {
    questions,
    items,
    listMeta,
    unansweredCount,
    seeded,
    pending,
    fetchList,
    ensureLoaded,
    fetchForProduct,
    getById,
    replyToQuestion,
    clearAnswer,
    setVerified,
    deleteQuestion,
  }
}
