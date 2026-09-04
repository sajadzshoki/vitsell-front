import {
  attributeSlugPattern,
  emptyAttributeForm,
  toAttributeForm,
  toSellerAttribute,
  type SellerAttribute,
  type SellerAttributeFormValues,
  type SellerAttributesPage,
  type SellerAttributesQuery,
} from '~/data/seller-attributes'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

function emptyMeta(): Omit<SellerAttributesPage, 'items'> {
  return {
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: { all: 0, active: 0, inactive: 0 },
    traitCounts: { all: 0, filterable: 0, variant: 0 },
  }
}

function normalizePage(result: unknown): SellerAttributesPage {
  if (Array.isArray(result)) {
    const items = result.map(a => toSellerAttribute(a as any))
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      statusCounts: {
        all: items.length,
        active: items.filter(a => a.status === 'active').length,
        inactive: items.filter(a => a.status === 'inactive').length,
      },
      traitCounts: {
        all: items.length,
        filterable: items.filter(a => a.filterable).length,
        variant: items.filter(a => a.variantDefining).length,
      },
    }
  }
  const page = (result || {}) as Partial<SellerAttributesPage>
  const items = Array.isArray(page.items)
    ? page.items.map(a => toSellerAttribute(a as any))
    : []
  return {
    items,
    total: Number(page.total) || items.length,
    page: Number(page.page) || 1,
    pageSize: Number(page.pageSize) || 10,
    statusCounts: {
      all: Number(page.statusCounts?.all) || items.length,
      active: Number(page.statusCounts?.active) || 0,
      inactive: Number(page.statusCounts?.inactive) || 0,
    },
    traitCounts: {
      all: Number(page.traitCounts?.all) || items.length,
      filterable: Number(page.traitCounts?.filterable) || 0,
      variant: Number(page.traitCounts?.variant) || 0,
    },
  }
}

function buildQuery(input?: SellerAttributesQuery) {
  const params: Record<string, string | number | boolean> = {}
  if (!input) return params
  if (input.q?.trim()) params.q = input.q.trim()
  if (input.status && input.status !== 'all') params.status = input.status
  if (input.type && input.type !== 'all') params.type = input.type
  if (input.trait && input.trait !== 'all') params.trait = input.trait
  if (input.all) {
    params.all = true
    params.pageSize = input.pageSize || 200
    return params
  }
  if (input.page != null) params.page = Number(input.page) || 1
  if (input.pageSize != null) params.pageSize = Number(input.pageSize) || 10
  return params
}

function formPayload(form: SellerAttributeFormValues, options?: { includeSlug?: boolean, includeId?: boolean }) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    type: form.type,
    values: form.values
      .filter(v => v.label.trim())
      .map((v, i) => ({
        id: v.id || undefined,
        label: v.label.trim(),
        value: (v.value || v.label).trim(),
        meta: v.meta ?? null,
        sortOrder: i,
        status: v.status || 'active',
      })),
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    filterable: form.filterable,
    searchable: form.searchable,
    variantDefining: form.variantDefining,
    categoryIds: [...form.categoryIds],
  }
  if (options?.includeSlug) payload.slug = form.slug.trim().toLowerCase()
  if (options?.includeId && form.id.trim()) payload.id = form.id.trim()
  return payload
}

export function useSellerAttributes() {
  const items = useState<SellerAttribute[]>('seller-attributes', () => [])
  const listMeta = useState<Omit<SellerAttributesPage, 'items'>>(
    'seller-attributes-list-meta',
    () => emptyMeta(),
  )
  const seeded = useState('seller-attributes-seeded', () => false)
  const pending = useState('seller-attributes-pending', () => false)

  const attributes = computed(() => items.value)
  const activeAttributes = computed(() => items.value.filter(a => a.status === 'active'))

  function upsertLocal(attr: SellerAttribute) {
    items.value = [attr, ...items.value.filter(a => a.id !== attr.id)]
    seeded.value = true
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }
    pending.value = true
    try {
      const { result, error } = await useGet<SellerAttributesPage | SellerAttribute[]>(
        '/seller/attributes',
        {
          query: { all: true, pageSize: 200 },
          headers: { 'no-error': true },
        },
      )
      if (error || result == null) {
        items.value = []
      }
      else {
        const page = normalizePage(result)
        items.value = page.items
        listMeta.value = {
          total: page.total,
          page: page.page,
          pageSize: page.pageSize,
          statusCounts: page.statusCounts,
          traitCounts: page.traitCounts,
        }
      }
      seeded.value = true
      return items.value
    }
    finally {
      pending.value = false
    }
  }

  async function fetchList(options?: { force?: boolean, query?: SellerAttributesQuery }) {
    pending.value = true
    try {
      const query = buildQuery(options?.query)
      if (!query.pageSize && !query.all) query.pageSize = 10
      const { result, error } = await useGet<SellerAttributesPage | SellerAttribute[]>(
        '/seller/attributes',
        {
          query,
          headers: { 'no-error': true },
        },
      )
      if (error || result == null) {
        return {
          ok: false as const,
          error: error ?? { message: 'attributes-fetch-failed' },
          page: { items: items.value, ...listMeta.value } as SellerAttributesPage,
        }
      }
      const page = normalizePage(result)
      items.value = page.items
      listMeta.value = {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
        statusCounts: page.statusCounts,
        traitCounts: page.traitCounts,
      }
      seeded.value = true
      return { ok: true as const, error: null as null, page }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchAttribute(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) return { ok: true as const, attribute: cached, error: null as null }

    const { result, error } = await useGet<SellerAttribute>(
      `/seller/attributes/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, attribute: null as SellerAttribute | null, error }
    }
    const attribute = toSellerAttribute(result)
    upsertLocal(attribute)
    return { ok: true as const, attribute, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(a => a.id === id) ?? null
  }

  function attributesForCategory(categoryId: string) {
    const list = activeAttributes.value
    if (!categoryId) return list
    return list.filter(a => !a.categoryIds.length || a.categoryIds.includes(categoryId))
  }

  async function createAttribute(form: SellerAttributeFormValues) {
    const slug = form.slug.trim().toLowerCase()
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    if (!attributeSlugPattern.test(slug)) return { ok: false as const, error: 'اسلاگ نامعتبر است' }

    const { result, error } = await usePost<SellerAttribute>(
      '/seller/attributes',
      formPayload(form, { includeSlug: true, includeId: true }),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت ویژگی ناموفق بود') }
    }
    const attribute = toSellerAttribute(result)
    upsertLocal(attribute)
    return { ok: true as const, attribute }
  }

  async function updateAttribute(id: string, form: SellerAttributeFormValues) {
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }

    const { result, error } = await usePut<SellerAttribute>(
      `/seller/attributes/${encodeURIComponent(id)}`,
      formPayload(form),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی ویژگی ناموفق بود') }
    }
    const attribute = toSellerAttribute({ ...result, id })
    upsertLocal(attribute)
    return { ok: true as const, attribute }
  }

  async function deleteAttribute(id: string) {
    const { error } = await useDelete(`/seller/attributes/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف ویژگی ناموفق بود') }
    }
    items.value = items.value.filter(a => a.id !== id)
    return { ok: true as const }
  }

  async function setStatus(id: string, status: SellerAttribute['status']) {
    const { result, error } = await usePatch<SellerAttribute>(
      `/seller/attributes/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      const attr = getById(id)
      if (!attr) return { ok: false as const, error: 'ویژگی پیدا نشد' }
      return updateAttribute(id, { ...toAttributeForm(attr), status })
    }
    const attribute = toSellerAttribute(result)
    upsertLocal(attribute)
    return { ok: true as const, attribute }
  }

  return {
    attributes,
    activeAttributes,
    listMeta,
    pending: computed(() => pending.value),
    ensureLoaded,
    fetchList,
    fetchAttribute,
    getById,
    attributesForCategory,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    setStatus,
    emptyAttributeForm,
    toAttributeForm,
  }
}
