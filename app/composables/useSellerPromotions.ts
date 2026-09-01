import {
  formToContentPromoPayload,
  formToDiscountCodePayload,
  toContentPromo,
  toDiscountCode,
  type SellerContentPromo,
  type SellerContentPromoForm,
  type SellerDiscountCode,
  type SellerDiscountCodeForm,
} from '~/data/seller-promotions'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

export function useSellerPromotions() {
  const codes = useState<SellerDiscountCode[]>('seller-discount-codes', () => [])
  const promos = useState<SellerContentPromo[]>('seller-content-promos', () => [])
  const seeded = useState('seller-promotions-seeded', () => false)
  const pending = useState('seller-promotions-pending', () => false)

  function upsertCode(item: SellerDiscountCode) {
    const index = codes.value.findIndex(c => c.code === item.code)
    if (index === -1) {
      codes.value = [item, ...codes.value]
    }
    else {
      const copy = [...codes.value]
      copy[index] = item
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

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) {
      return { codes: codes.value, promos: promos.value }
    }

    pending.value = true
    try {
      const [codesRes, promosRes] = await Promise.all([
        useGet<SellerDiscountCode[]>('/seller/discount-codes', {
          headers: { 'no-error': true },
        }),
        useGet<SellerContentPromo[]>('/seller/content-promos', {
          headers: { 'no-error': true },
        }),
      ])

      codes.value = Array.isArray(codesRes.result)
        ? codesRes.result.map(c => toDiscountCode(c))
        : []
      promos.value = Array.isArray(promosRes.result)
        ? promosRes.result.map(p => toContentPromo(p))
        : []
      seeded.value = true
      return { codes: codes.value, promos: promos.value }
    }
    finally {
      pending.value = false
    }
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
    const item = toDiscountCode(result)
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
    const item = toDiscountCode(result)
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
    pending: computed(() => pending.value),
    seeded,
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
