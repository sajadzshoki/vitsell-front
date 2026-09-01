import {
  applyDealOverlay,
  formToAmazingDealPayload,
  toAmazingDeal,
  type SellerAmazingDeal,
  type SellerAmazingDealFormValues,
} from '~/data/seller-deals'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

export function useSellerDeals() {
  const items = useState<SellerAmazingDeal[]>('seller-amazing-deals', () => [])
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

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerAmazingDeal[]>('/seller/deals', {
        headers: { 'no-error': true },
      })
      if (error || !Array.isArray(result)) {
        items.value = []
        seeded.value = true
        return items.value
      }
      items.value = result.map(d => toAmazingDeal(d))
      seeded.value = true
      return items.value
    }
    finally {
      pending.value = false
    }
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

  return {
    deals,
    items,
    pending: computed(() => pending.value),
    seeded,
    ensureLoaded,
    fetchDeal,
    getById,
    createDeal,
    updateDeal,
    deleteDeal,
    setActive,
    setActiveMany,
  }
}
