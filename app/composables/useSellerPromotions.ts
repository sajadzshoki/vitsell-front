import {
  applyCouponOverlay,
  formToContentPromoPayload,
  formToDiscountCodePayload,
  toContentPromo,
  toDiscountCode,
  type SellerContentPromo,
  type SellerContentPromoForm,
  type SellerDiscountCode,
  type SellerDiscountCodeForm,
} from '~/data/seller-promotions'

export type SellerPromotionsListQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerCodesPage = {
  items: SellerDiscountCode[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

export type SellerPromosPage = {
  items: SellerContentPromo[]
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

const emptyCodeCounts = () => ({
  all: 0,
  active: 0,
  scheduled: 0,
  paused: 0,
  expired: 0,
})

const emptyPromoCounts = () => ({
  all: 0,
  active: 0,
  inactive: 0,
})

export function useSellerPromotions() {
  const codes = useState<SellerDiscountCode[]>('seller-discount-codes', () => [])
  const overlays = useState<Record<string, Partial<SellerDiscountCode>>>('seller-coupon-overlays', () => ({}))
  const promos = useState<SellerContentPromo[]>('seller-content-promos', () => [])
  const codesListMeta = useState('seller-discount-codes-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: emptyCodeCounts() as Record<string, number>,
  }))
  const promosListMeta = useState('seller-content-promos-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: emptyPromoCounts() as Record<string, number>,
  }))
  const seeded = useState('seller-promotions-seeded', () => false)
  const pending = useState('seller-promotions-pending', () => false)

  function mergeOverlay(item: SellerDiscountCode): SellerDiscountCode {
    const extra = overlays.value[item.code]
    return extra ? { ...item, ...extra, code: item.code } : item
  }

  function upsertCode(item: SellerDiscountCode) {
    const merged = mergeOverlay(item)
    const index = codes.value.findIndex(c => c.code === merged.code)
    if (index === -1) {
      codes.value = [merged, ...codes.value]
    }
    else {
      const copy = [...codes.value]
      copy[index] = { ...copy[index], ...merged }
      codes.value = copy
    }
  }

  function upsertPromo(item: SellerContentPromo) {
    const index = promos.value.findIndex(p => p.id === item.id)
    if (index === -1) {
      promos.value = [item, ...promos.value]
    }
    else {
      const copy = [...promos.value]
      copy[index] = item
      promos.value = copy
    }
  }

  function buildParams(query?: SellerPromotionsListQuery) {
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
    return params
  }

  async function fetchCodesList(
    query?: SellerPromotionsListQuery,
    options?: { trackPending?: boolean },
  ) {
    const trackPending = options?.trackPending !== false
    if (trackPending) pending.value = true
    try {
      const { result, error } = await useGet<SellerCodesPage | SellerDiscountCode[]>(
        '/seller/discount-codes',
        { query: buildParams(query), headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'codes-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        codes.value = result.map(c => mergeOverlay(toDiscountCode(c)))
        codesListMeta.value = {
          total: codes.value.length,
          page: 1,
          pageSize: codes.value.length,
          statusCounts: {
            ...emptyCodeCounts(),
            all: codes.value.length,
          },
        }
      }
      else {
        codes.value = Array.isArray(result.items)
          ? result.items.map(c => mergeOverlay(toDiscountCode(c)))
          : []
        codesListMeta.value = {
          total: Number(result.total) || codes.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || {
            ...emptyCodeCounts(),
            all: codes.value.length,
          },
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      if (trackPending) pending.value = false
    }
  }

  async function fetchPromosList(
    query?: SellerPromotionsListQuery,
    options?: { trackPending?: boolean },
  ) {
    const trackPending = options?.trackPending !== false
    if (trackPending) pending.value = true
    try {
      const { result, error } = await useGet<SellerPromosPage | SellerContentPromo[]>(
        '/seller/content-promos',
        { query: buildParams(query), headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'promos-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        promos.value = result.map(p => toContentPromo(p))
        promosListMeta.value = {
          total: promos.value.length,
          page: 1,
          pageSize: promos.value.length,
          statusCounts: {
            all: promos.value.length,
            active: promos.value.filter(p => p.active).length,
            inactive: promos.value.filter(p => !p.active).length,
          },
        }
      }
      else {
        promos.value = Array.isArray(result.items)
          ? result.items.map(p => toContentPromo(p))
          : []
        promosListMeta.value = {
          total: Number(result.total) || promos.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || {
            all: promos.value.length,
            active: promos.value.filter(p => p.active).length,
            inactive: promos.value.filter(p => !p.active).length,
          },
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      if (trackPending) pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) {
      return { codes: codes.value, promos: promos.value }
    }
    pending.value = true
    try {
      await Promise.all([
        fetchCodesList({ page: 1, pageSize: 100 }, { trackPending: false }),
        fetchPromosList({ page: 1, pageSize: 100 }, { trackPending: false }),
      ])
    }
    finally {
      pending.value = false
    }
    return { codes: codes.value, promos: promos.value }
  }

  async function fetchCode(code: string, options?: { force?: boolean }) {
    const key = code.toUpperCase()
    const cached = getCode(key)
    if (cached && !options?.force) {
      return { ok: true as const, item: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerDiscountCode>(
      `/seller/discount-codes/${encodeURIComponent(key)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.code) {
      return { ok: false as const, item: null as SellerDiscountCode | null, error }
    }
    const item = toDiscountCode(result)
    upsertCode(item)
    seeded.value = true
    return { ok: true as const, item, error: null as null }
  }

  async function fetchPromo(id: string, options?: { force?: boolean }) {
    const cached = getPromo(id)
    if (cached && !options?.force) {
      return { ok: true as const, item: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerContentPromo>(
      `/seller/content-promos/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, item: null as SellerContentPromo | null, error }
    }
    const item = toContentPromo(result)
    upsertPromo(item)
    seeded.value = true
    return { ok: true as const, item, error: null as null }
  }

  function getCode(code: string) {
    return codes.value.find(c => c.code === code.toUpperCase())
  }

  function getPromo(id: string) {
    return promos.value.find(p => p.id === id)
  }

  async function createCode(form: SellerDiscountCodeForm) {
    const payload = formToDiscountCodePayload(form)
    const { result, error } = await usePost<SellerDiscountCode>(
      '/seller/discount-codes',
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.code) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت کد تخفیف ناموفق بود') }
    }
    const item = applyCouponOverlay(toDiscountCode(result), form)
    overlays.value = { ...overlays.value, [item.code]: item }
    upsertCode(item)
    seeded.value = true
    return { ok: true as const, item }
  }

  async function updateCode(code: string, form: SellerDiscountCodeForm) {
    const payload = formToDiscountCodePayload({ ...form, code })
    const { code: _omit, ...body } = payload
    const { result, error } = await usePut<SellerDiscountCode>(
      `/seller/discount-codes/${encodeURIComponent(code.toUpperCase())}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.code) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی کد ناموفق بود') }
    }
    const item = applyCouponOverlay(toDiscountCode(result), form)
    overlays.value = { ...overlays.value, [item.code]: item }
    upsertCode(item)
    return { ok: true as const, item }
  }

  async function deleteCode(code: string) {
    const { error } = await useDelete(
      `/seller/discount-codes/${encodeURIComponent(code.toUpperCase())}`,
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف کد ناموفق بود') }
    }
    codes.value = codes.value.filter(c => c.code !== code.toUpperCase())
    return { ok: true as const }
  }

  async function setCodeActive(code: string, active: boolean) {
    const { result, error } = await usePatch<SellerDiscountCode>(
      `/seller/discount-codes/${encodeURIComponent(code.toUpperCase())}/active`,
      { active },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.code) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const item = toDiscountCode(result)
    upsertCode(item)
    return { ok: true as const, item }
  }

  async function createPromo(form: SellerContentPromoForm) {
    const payload = formToContentPromoPayload(form)
    const { result, error } = await usePost<SellerContentPromo>(
      '/seller/content-promos',
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت پرومو ناموفق بود') }
    }
    const item = toContentPromo(result)
    upsertPromo(item)
    seeded.value = true
    return { ok: true as const, item }
  }

  async function updatePromo(id: string, form: SellerContentPromoForm) {
    const payload = formToContentPromoPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerContentPromo>(
      `/seller/content-promos/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی پرومو ناموفق بود') }
    }
    const item = toContentPromo(result)
    upsertPromo(item)
    return { ok: true as const, item }
  }

  async function deletePromo(id: string) {
    const { error } = await useDelete(
      `/seller/content-promos/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف پرومو ناموفق بود') }
    }
    promos.value = promos.value.filter(p => p.id !== id)
    return { ok: true as const }
  }

  async function setPromoActive(id: string, active: boolean) {
    const { result, error } = await usePatch<SellerContentPromo>(
      `/seller/content-promos/${encodeURIComponent(id)}/active`,
      { active },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const item = toContentPromo(result)
    upsertPromo(item)
    return { ok: true as const, item }
  }

  return {
    codes: computed(() => codes.value),
    promos: computed(() => promos.value),
    codesListMeta,
    promosListMeta,
    pending: computed(() => pending.value),
    seeded,
    fetchCodesList,
    fetchPromosList,
    ensureLoaded,
    fetchCode,
    fetchPromo,
    getCode,
    getPromo,
    createCode,
    updateCode,
    deleteCode,
    setCodeActive,
    createPromo,
    updatePromo,
    deletePromo,
    setPromoActive,
  }
}
