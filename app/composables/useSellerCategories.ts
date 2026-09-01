import {
  formToApiPayload,
  sellerCategoryToListItem,
  toSellerCategory,
  type SellerCategory,
  type SellerCategoryFormValues,
} from '~/data/seller-categories'

export function useSellerCategories() {
  const { list: storefrontList, fetchCategories, pending: fetchPending } = useCategories()

  const items = useState<SellerCategory[]>('seller-categories-items', () => [])
  const seeded = useState('seller-categories-seeded', () => false)
  const pending = useState('seller-categories-pending', () => false)

  const categories = computed(() => items.value)

  function syncStorefront() {
    storefrontList.value = items.value.map(sellerCategoryToListItem)
  }

  function upsertLocal(category: SellerCategory) {
    const index = items.value.findIndex(c => c.id === category.id)
    if (index === -1) {
      items.value = [...items.value, category]
    }
    else {
      const copy = [...items.value]
      copy[index] = category
      items.value = copy
    }
    syncStorefront()
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerCategory[]>('/seller/categories', {
        headers: { 'no-error': true },
      })
      if (error || !Array.isArray(result)) {
        // Fallback to public list (no pageMeta) if admin endpoint unavailable
        const { categories: fetched } = await fetchCategories({
          withCounts: false,
          force: true,
        })
        items.value = fetched.map(c => toSellerCategory(c))
      }
      else {
        items.value = result.map(c => toSellerCategory(c))
      }
      seeded.value = true
      syncStorefront()
      return items.value
    }
    finally {
      pending.value = false
    }
  }

  async function fetchCategory(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) return { ok: true as const, category: cached, error: null as null }

    const { result, error } = await useGet<SellerCategory>(
      `/seller/categories/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, category: null as SellerCategory | null, error }
    }
    const category = toSellerCategory(result)
    upsertLocal(category)
    seeded.value = true
    return { ok: true as const, category, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(c => c.id === id)
  }

  async function createCategory(form: SellerCategoryFormValues) {
    const payload = formToApiPayload(form)
    const { result, error } = await usePost<SellerCategory>('/seller/categories', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'ثبت دسته‌بندی ناموفق بود'
      return { ok: false as const, error: message }
    }
    const category = toSellerCategory({
      ...result,
      parentId: result.parentId ?? payload.parentId ?? null,
      status: result.status ?? payload.status ?? 'active',
      sortOrder: result.sortOrder ?? payload.sortOrder ?? 0,
      seo: result.seo ?? payload.seo ?? null,
    })
    upsertLocal(category)
    seeded.value = true
    await fetchCategories({ force: true })
    return { ok: true as const, category }
  }

  async function updateCategory(id: string, form: SellerCategoryFormValues) {
    const payload = formToApiPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerCategory>(
      `/seller/categories/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'به‌روزرسانی دسته‌بندی ناموفق بود'
      return { ok: false as const, error: message }
    }
    const category = toSellerCategory({
      ...result,
      parentId: result.parentId ?? payload.parentId ?? null,
      status: result.status ?? payload.status ?? 'active',
      sortOrder: result.sortOrder ?? payload.sortOrder ?? 0,
      seo: result.seo ?? payload.seo ?? null,
    })
    upsertLocal(category)
    await fetchCategories({ force: true })
    return { ok: true as const, category }
  }

  async function deleteCategory(id: string) {
    const { error } = await useDelete(`/seller/categories/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'حذف دسته‌بندی ناموفق بود'
      return { ok: false as const, error: message }
    }
    items.value = items.value.filter(c => c.id !== id)
    syncStorefront()
    await fetchCategories({ force: true })
    return { ok: true as const }
  }

  return {
    categories,
    items,
    pending: computed(() => pending.value || fetchPending.value),
    seeded,
    ensureLoaded,
    fetchCategory,
    getById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
