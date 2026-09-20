import {
  formToApiPayload,
  sellerCategoryToListItem,
  toSellerCategory,
  type SellerCategory,
  type SellerCategoryFormValues,
} from '~/data/seller-categories'

export type SellerCategoriesQuery = {
  q?: string
  status?: string
  parentId?: string
}

export type SellerCategoriesPage = {
  items: SellerCategory[]
  total: number
  statusCounts: {
    all: number
    active: number
    inactive: number
  }
  parentOptions: Array<{ id: string, name: string }>
}

type CategoryApiItem = Partial<SellerCategory> & {
  id: string
  name: string
  productCount?: number
  childCount?: number
  parentName?: string | null
}

function emptyMeta(): Omit<SellerCategoriesPage, 'items'> {
  return {
    total: 0,
    statusCounts: { all: 0, active: 0, inactive: 0 },
    parentOptions: [],
  }
}

function normalizePage(result: unknown): SellerCategoriesPage {
  if (Array.isArray(result)) {
    const items = result.map(c => toSellerCategory(c as CategoryApiItem))
    return {
      items,
      total: items.length,
      statusCounts: {
        all: items.length,
        active: items.filter(c => c.status === 'active').length,
        inactive: items.filter(c => c.status === 'inactive').length,
      },
      parentOptions: items.map(c => ({ id: c.id, name: c.name })),
    }
  }

  const page = (result || {}) as Partial<SellerCategoriesPage> & { items?: CategoryApiItem[] }
  const rawItems = Array.isArray(page.items) ? page.items : []
  const items = rawItems.map((raw) => {
    const cat = toSellerCategory(raw)
    return {
      ...cat,
      productCount: Number(raw.productCount) || 0,
      childCount: Number(raw.childCount) || 0,
      parentName: raw.parentName ?? null,
    } as SellerCategory & {
      productCount?: number
      childCount?: number
      parentName?: string | null
    }
  })

  return {
    items,
    total: Number(page.total) || items.length,
    statusCounts: {
      all: Number(page.statusCounts?.all) || items.length,
      active: Number(page.statusCounts?.active) || 0,
      inactive: Number(page.statusCounts?.inactive) || 0,
    },
    parentOptions: Array.isArray(page.parentOptions)
      ? page.parentOptions.map(p => ({ id: p.id, name: p.name }))
      : items.map(c => ({ id: c.id, name: c.name })),
  }
}

function buildQuery(input?: SellerCategoriesQuery) {
  const params: Record<string, string> = {}
  if (!input) return params
  if (input.q?.trim()) params.q = input.q.trim()
  if (input.status && input.status !== 'all') params.status = input.status
  // __root__ = only top-level; send empty parentId for backends that treat blank as roots
  if (input.parentId && input.parentId !== 'all') {
    params.parentId = input.parentId === '__root__' ? '' : input.parentId
  }
  return params
}

export function useSellerCategories() {
  const { list: storefrontList, fetchCategories, pending: fetchPending } = useCategories()

  const items = useState<SellerCategory[]>('seller-categories-items', () => [])
  const listItems = useState<Array<SellerCategory & {
    productCount?: number
    childCount?: number
    parentName?: string | null
  }>>('seller-categories-list-items', () => [])
  const listMeta = useState<Omit<SellerCategoriesPage, 'items'>>(
    'seller-categories-list-meta',
    () => emptyMeta(),
  )
  const seeded = useState('seller-categories-seeded', () => false)
  const pending = useState('seller-categories-pending', () => false)
  const listPending = useState('seller-categories-list-pending', () => false)

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

  function applyFullList(page: SellerCategoriesPage) {
    items.value = page.items.map(c => toSellerCategory(c))
    seeded.value = true
    syncStorefront()
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerCategoriesPage | SellerCategory[]>(
        '/seller/categories',
        { headers: { 'no-error': true } },
      )
      if (error || result == null) {
        const { categories: fetched } = await fetchCategories({
          withCounts: false,
          force: true,
        })
        items.value = fetched.map(c => toSellerCategory(c))
      }
      else {
        applyFullList(normalizePage(result))
      }
      seeded.value = true
      syncStorefront()
      try {
        const { addIcons } = useSellerCustomIcons()
        addIcons(items.value.map(c => c.icon).filter(Boolean))
      }
      catch {
        // picker library optional during SSR / early boot
      }
      return items.value
    }
    finally {
      pending.value = false
    }
  }

  /** Filtered admin list for /seller/categories */
  async function fetchList(options?: {
    force?: boolean
    query?: SellerCategoriesQuery
  }) {
    listPending.value = true
    try {
      const params = buildQuery(options?.query)
      const { result, error } = await useGet<SellerCategoriesPage | SellerCategory[]>(
        '/seller/categories',
        {
          query: params,
          headers: { 'no-error': true },
        },
      )
      if (error || result == null) {
        return {
          ok: false as const,
          error: error ?? { message: 'categories-fetch-failed' },
          page: {
            items: listItems.value,
            ...listMeta.value,
          } as SellerCategoriesPage,
        }
      }

      const page = normalizePage(result)
      listItems.value = page.items
      listMeta.value = {
        total: page.total,
        statusCounts: page.statusCounts,
        parentOptions: page.parentOptions,
      }

      // Keep form cache fresh when unfiltered
      const unfiltered = !params.q && !params.status && !params.parentId
      if (unfiltered || !seeded.value) {
        if (unfiltered) {
          applyFullList(page)
        }
        else if (!seeded.value) {
          await ensureLoaded({ force: true })
        }
      }

      return { ok: true as const, error: null as null, page }
    }
    finally {
      listPending.value = false
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
      ?? listItems.value.find(c => c.id === id)
      ?? null
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
      ...payload,
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
      ...payload,
      ...result,
      id,
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
    listItems.value = listItems.value.filter(c => c.id !== id)
    syncStorefront()
    await fetchCategories({ force: true })
    return { ok: true as const }
  }

  async function bulkDeleteCategories(ids: string[]) {
    const unique = [...new Set(ids.map(id => String(id || '').trim()).filter(Boolean))]
    if (!unique.length) {
      return { ok: false as const, error: 'هیچ دسته‌ای انتخاب نشده است', deleted: 0, failed: [] as Array<{ id: string; message: string }> }
    }

    const { result, error } = await usePost<{
      deleted: number
      failed?: Array<{ id: string; message: string }>
      deletedIds?: string[]
    }>('/seller/categories/bulk-delete', { ids: unique }, {
      headers: { 'no-error': true },
    })

    if (error) {
      const message
        = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || 'حذف گروهی دسته‌بندی‌ها ناموفق بود'
      return { ok: false as const, error: message, deleted: 0, failed: [] as Array<{ id: string; message: string }> }
    }

    const deletedIds = new Set(result?.deletedIds || unique)
    items.value = items.value.filter(c => !deletedIds.has(c.id))
    listItems.value = listItems.value.filter(c => !deletedIds.has(c.id))
    syncStorefront()
    await fetchCategories({ force: true })
    return {
      ok: true as const,
      deleted: Number(result?.deleted) || deletedIds.size,
      failed: Array.isArray(result?.failed) ? result!.failed! : [],
    }
  }

  return {
    categories,
    items,
    listItems,
    listMeta,
    pending: computed(() => pending.value || fetchPending.value || listPending.value),
    listPending: computed(() => listPending.value),
    seeded,
    ensureLoaded,
    fetchList,
    fetchCategory,
    getById,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
  }
}
