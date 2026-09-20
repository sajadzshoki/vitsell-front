import { emptySeoMeta } from '~/data/seo'
import {
  brandSlugPattern,
  emptyBrandForm,
  toBrandForm,
  toSellerBrand,
  type SellerBrand,
  type SellerBrandFormValues,
  type SellerBrandsPage,
  type SellerBrandsQuery,
} from '~/data/seller-brands'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

function emptyMeta(): Omit<SellerBrandsPage, 'items'> {
  return {
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: { all: 0, active: 0, inactive: 0 },
  }
}

function normalizePage(result: unknown): SellerBrandsPage {
  if (Array.isArray(result)) {
    const items = result.map(b => toSellerBrand(b as any))
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      statusCounts: {
        all: items.length,
        active: items.filter(b => b.status === 'active').length,
        inactive: items.filter(b => b.status === 'inactive').length,
      },
    }
  }
  const page = (result || {}) as Partial<SellerBrandsPage>
  const items = Array.isArray(page.items)
    ? page.items.map(b => toSellerBrand(b as any))
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
  }
}

function buildQuery(input?: SellerBrandsQuery) {
  const params: Record<string, string | number | boolean> = {}
  if (!input) return params
  if (input.q?.trim()) params.q = input.q.trim()
  if (input.status && input.status !== 'all') params.status = input.status
  if (input.all) {
    params.all = true
    params.pageSize = input.pageSize || 200
    return params
  }
  if (input.page != null) params.page = Number(input.page) || 1
  if (input.pageSize != null) params.pageSize = Number(input.pageSize) || 10
  return params
}

function formPayload(form: SellerBrandFormValues, options?: { includeSlug?: boolean, includeId?: boolean }) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    logo: form.logo.trim() || null,
    description: form.description.trim(),
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    seo: { ...emptySeoMeta(), ...(form.seo || {}) },
  }
  if (options?.includeSlug) {
    payload.slug = form.slug.trim().toLowerCase()
  }
  if (options?.includeId && form.id.trim()) {
    payload.id = form.id.trim()
  }
  return payload
}

export function useSellerBrands() {
  const items = useState<SellerBrand[]>('seller-brands', () => [])
  const listMeta = useState<Omit<SellerBrandsPage, 'items'>>(
    'seller-brands-list-meta',
    () => emptyMeta(),
  )
  const seeded = useState('seller-brands-seeded', () => false)
  const pending = useState('seller-brands-pending', () => false)

  const brands = computed(() => items.value)
  const activeBrands = computed(() => items.value.filter(b => b.status === 'active'))

  function upsertLocal(brand: SellerBrand) {
    items.value = [brand, ...items.value.filter(b => b.id !== brand.id)]
    seeded.value = true
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }
    pending.value = true
    try {
      const { result, error } = await useGet<SellerBrandsPage | SellerBrand[]>(
        '/seller/brands',
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
        }
      }
      seeded.value = true
      return items.value
    }
    finally {
      pending.value = false
    }
  }

  async function fetchList(options?: { force?: boolean, query?: SellerBrandsQuery }) {
    pending.value = true
    try {
      const query = buildQuery(options?.query)
      if (!query.pageSize && !query.all) query.pageSize = 10
      const { result, error } = await useGet<SellerBrandsPage | SellerBrand[]>(
        '/seller/brands',
        {
          query,
          headers: { 'no-error': true },
        },
      )
      if (error || result == null) {
        return {
          ok: false as const,
          error: error ?? { message: 'brands-fetch-failed' },
          page: { items: items.value, ...listMeta.value } as SellerBrandsPage,
        }
      }
      const page = normalizePage(result)
      items.value = page.items
      listMeta.value = {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
        statusCounts: page.statusCounts,
      }
      seeded.value = true
      return { ok: true as const, error: null as null, page }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchBrand(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) return { ok: true as const, brand: cached, error: null as null }

    const { result, error } = await useGet<SellerBrand>(
      `/seller/brands/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, brand: null as SellerBrand | null, error }
    }
    const brand = toSellerBrand(result)
    upsertLocal(brand)
    return { ok: true as const, brand, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(b => b.id === id) ?? null
  }

  async function createBrand(form: SellerBrandFormValues) {
    const slug = form.slug.trim().toLowerCase()
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    if (!brandSlugPattern.test(slug)) return { ok: false as const, error: 'اسلاگ نامعتبر است' }

    const { result, error } = await usePost<SellerBrand>(
      '/seller/brands',
      formPayload(form, { includeSlug: true, includeId: true }),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت برند ناموفق بود') }
    }
    const brand = toSellerBrand(result)
    upsertLocal(brand)
    return { ok: true as const, brand }
  }

  async function updateBrand(id: string, form: SellerBrandFormValues) {
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }

    const { result, error } = await usePut<SellerBrand>(
      `/seller/brands/${encodeURIComponent(id)}`,
      formPayload(form),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی برند ناموفق بود') }
    }
    const brand = toSellerBrand({ ...result, id })
    upsertLocal(brand)
    return { ok: true as const, brand }
  }

  async function deleteBrand(id: string) {
    const { error } = await useDelete(`/seller/brands/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف برند ناموفق بود') }
    }
    items.value = items.value.filter(b => b.id !== id)
    return { ok: true as const }
  }

  async function bulkDeleteBrands(ids: string[]) {
    const unique = [...new Set(ids.map(id => String(id || '').trim()).filter(Boolean))]
    if (!unique.length) {
      return {
        ok: false as const,
        error: 'هیچ برندی انتخاب نشده است',
        deleted: 0,
        failed: [] as Array<{ id: string; message: string }>,
      }
    }

    const { result, error } = await usePost<{
      deleted: number
      failed?: Array<{ id: string; message: string }>
      deletedIds?: string[]
    }>('/seller/brands/bulk-delete', { ids: unique }, {
      headers: { 'no-error': true },
    })

    if (error) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'حذف گروهی برندها ناموفق بود'),
        deleted: 0,
        failed: [] as Array<{ id: string; message: string }>,
      }
    }

    const deletedIds = new Set(result?.deletedIds || unique)
    items.value = items.value.filter(b => !deletedIds.has(b.id))
    return {
      ok: true as const,
      deleted: Number(result?.deleted) || deletedIds.size,
      failed: Array.isArray(result?.failed) ? result!.failed! : [],
    }
  }

  async function setStatus(id: string, status: SellerBrand['status']) {
    const { result, error } = await usePatch<SellerBrand>(
      `/seller/brands/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      // fallback to full update
      const brand = getById(id)
      if (!brand) return { ok: false as const, error: 'برند پیدا نشد' }
      return updateBrand(id, { ...toBrandForm(brand), status })
    }
    const brand = toSellerBrand(result)
    upsertLocal(brand)
    return { ok: true as const, brand }
  }

  return {
    brands,
    activeBrands,
    listMeta,
    pending: computed(() => pending.value),
    ensureLoaded,
    fetchList,
    fetchBrand,
    getById,
    createBrand,
    updateBrand,
    deleteBrand,
    bulkDeleteBrands,
    setStatus,
    emptyBrandForm,
    toBrandForm,
  }
}
