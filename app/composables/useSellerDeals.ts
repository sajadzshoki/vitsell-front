import {
  applyDealOverlay,
  formToAmazingDealPayload,
  toAmazingDeal,
  type SellerAmazingDeal,
  type SellerAmazingDealApiPayload,
  type SellerAmazingDealFormValues,
} from '~/data/seller-deals'
import { deriveScheduleStatus } from '~/data/seller-marketing-shared'

export type SellerDealsQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerDealsPage = {
  items: SellerAmazingDeal[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

function scheduleOf(deal: SellerAmazingDeal) {
  return deriveScheduleStatus({
    startsAt: deal.startsAt,
    endsAt: deal.endsAt,
    active: deal.active,
  })
}

function computeStatusCounts(list: SellerAmazingDeal[]): Record<string, number> {
  const counts = {
    all: list.length,
    active: 0,
    scheduled: 0,
    paused: 0,
    expired: 0,
  }
  for (const deal of list) {
    const status = scheduleOf(deal)
    if (status === 'active') counts.active += 1
    else if (status === 'scheduled') counts.scheduled += 1
    else if (status === 'paused') counts.paused += 1
    else if (status === 'expired' || status === 'ended') counts.expired += 1
  }
  return counts
}

export function useSellerDeals() {
  const items = useState<SellerAmazingDeal[]>('seller-amazing-deals', () => [])
  const listMeta = useState('seller-amazing-deals-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      active: 0,
      scheduled: 0,
      paused: 0,
      expired: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-amazing-deals-seeded', () => false)
  const pending = useState('seller-amazing-deals-pending', () => false)

  const deals = computed(() => items.value)

  function upsertLocal(deal: SellerAmazingDeal) {
    const index = items.value.findIndex(d => d.id === deal.id)
    if (index === -1) {
      items.value = [deal, ...items.value]
    }
    else {
      const copy = [...items.value]
      copy[index] = deal
      items.value = copy
    }
  }

  async function fetchList(query?: SellerDealsQuery) {
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

      const { result, error } = await useGet<SellerDealsPage | SellerAmazingDeal[]>(
        '/seller/deals',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'deals-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(d => toAmazingDeal(d))
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: computeStatusCounts(items.value),
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(d => toAmazingDeal(d)) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || computeStatusCounts(items.value),
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return items.value
    await fetchList({ page: 1, pageSize: 100 })
    return items.value
  }

  async function fetchDeal(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, deal: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerAmazingDeal>(
      `/seller/deals/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, deal: null as SellerAmazingDeal | null, error }
    }
    const deal = toAmazingDeal(result)
    upsertLocal(deal)
    seeded.value = true
    return { ok: true as const, deal, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(d => d.id === id)
  }

  async function createDeal(form: SellerAmazingDealFormValues) {
    const payload = formToAmazingDealPayload(form)
    const { result, error } = await usePost<SellerAmazingDeal>('/seller/deals', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت شگفت‌انگیز ناموفق بود') }
    }
    const deal = applyDealOverlay(toAmazingDeal(result), form)
    upsertLocal(deal)
    seeded.value = true
    return { ok: true as const, deal }
  }

  async function updateDeal(id: string, form: SellerAmazingDealFormValues) {
    const payload = formToAmazingDealPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerAmazingDeal>(
      `/seller/deals/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی شگفت‌انگیز ناموفق بود') }
    }
    const deal = applyDealOverlay(toAmazingDeal(result), form)
    upsertLocal(deal)
    return { ok: true as const, deal }
  }

  async function deleteDeal(id: string) {
    const { error } = await useDelete(`/seller/deals/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف شگفت‌انگیز ناموفق بود') }
    }
    items.value = items.value.filter(d => d.id !== id)
    return { ok: true as const }
  }

  async function setActive(id: string, active: boolean) {
    const { result, error } = await usePatch<SellerAmazingDeal>(
      `/seller/deals/${encodeURIComponent(id)}/active`,
      { active },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const deal = toAmazingDeal(result)
    upsertLocal(deal)
    return { ok: true as const, deal }
  }

  async function setActiveMany(ids: string[], active: boolean) {
    let okCount = 0
    for (const id of ids) {
      const result = await setActive(id, active)
      if (result.ok) okCount += 1
    }
    return { ok: true as const, count: okCount }
  }

  async function createBulk(payloadItems: SellerAmazingDealApiPayload[]) {
    const { result, error } = await usePost<{
      created: SellerAmazingDeal[]
      errors: { index: number, productId: string, message: string }[]
      createdCount: number
      errorCount: number
    }>('/seller/deals/bulk', { items: payloadItems }, {
      headers: { 'no-error': true },
    })
    if (error || !result) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'ثبت گروهی ناموفق بود'),
        createdCount: 0,
        errors: [] as { index: number, productId: string, message: string }[],
      }
    }
    for (const raw of result.created || []) {
      upsertLocal(toAmazingDeal(raw))
    }
    if (result.created?.length) seeded.value = true
    return {
      ok: true as const,
      createdCount: Number(result.createdCount) || (result.created?.length ?? 0),
      errors: Array.isArray(result.errors) ? result.errors : [],
    }
  }

  return {
    deals,
    items,
    listMeta,
    pending: computed(() => pending.value),
    seeded,
    fetchList,
    ensureLoaded,
    fetchDeal,
    getById,
    createDeal,
    createBulk,
    updateDeal,
    deleteDeal,
    setActive,
    setActiveMany,
  }
}
