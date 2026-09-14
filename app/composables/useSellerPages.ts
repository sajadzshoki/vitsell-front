import { emptySeoMeta } from '~/data/seo'
import {
  emptyPageForm,
  formToSellerPage,
  pageIdPattern,
  toPageForm,
  type SellerManagedPage,
  type SellerPageFormValues,
  type SellerPageStatus,
} from '~/data/seller-pages'
import type { StaticSection } from '~/data/static-pages'

export type SellerPagesQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerPagesPage = {
  items: SellerManagedPage[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toPage(raw: any): SellerManagedPage {
  const status = (['draft', 'published', 'archived'].includes(raw?.status)
    ? raw.status
    : 'draft') as SellerPageStatus
  const now = new Date().toISOString()
  return {
    id: String(raw?.id || ''),
    path: String(raw?.path || '/'),
    title: String(raw?.title || ''),
    subtitle: String(raw?.subtitle || ''),
    icon: String(raw?.icon || 'i-tabler-file-text'),
    sections: (Array.isArray(raw?.sections) ? raw.sections : []) as StaticSection[],
    sourceId: raw?.sourceId ? String(raw.sourceId) : null,
    status,
    seo: { ...emptySeoMeta(), ...(raw?.seo || {}) },
    publishedAt: raw?.publishedAt ? String(raw.publishedAt) : null,
    template: String(raw?.template || 'default'),
    createdAt: raw?.createdAt ? String(raw.createdAt) : now,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : now,
  }
}

function formToPayload(form: SellerPageFormValues, previous?: SellerManagedPage | null) {
  const page = formToSellerPage(form, previous)
  return {
    ...(page.id ? { id: page.id } : {}),
    path: page.path,
    title: page.title,
    subtitle: page.subtitle,
    icon: page.icon,
    sections: page.sections,
    sourceId: page.sourceId,
    status: page.status,
    seo: page.seo,
    publishedAt: page.publishedAt,
    template: page.template,
  }
}

export function useSellerPages() {
  const items = useState<SellerManagedPage[]>('seller-managed-pages', () => [])
  const listMeta = useState('seller-managed-pages-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      draft: 0,
      published: 0,
      archived: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-managed-pages-seeded', () => false)
  const pending = useState('seller-managed-pages-pending', () => false)

  const pages = computed(() => items.value)
  const publishedPages = computed(() => items.value.filter(p => p.status === 'published'))

  function upsertLocal(page: SellerManagedPage) {
    const index = items.value.findIndex(p => p.id === page.id)
    if (index === -1) items.value = [page, ...items.value]
    else {
      const copy = [...items.value]
      copy[index] = page
      items.value = copy
    }
  }

  function getById(id: string) {
    return items.value.find(p => p.id === id) ?? null
  }

  function getByPath(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return items.value.find(p => p.path === normalized) ?? null
  }

  async function fetchList(query?: SellerPagesQuery) {
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

      const { result, error } = await useGet<SellerPagesPage | SellerManagedPage[]>(
        '/seller/pages',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'pages-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toPage)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            draft: items.value.filter(p => p.status === 'draft').length,
            published: items.value.filter(p => p.status === 'published').length,
            archived: items.value.filter(p => p.status === 'archived').length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toPage) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || listMeta.value.statusCounts,
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

  async function fetchById(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, page: cached, error: null as null }
    }
    const { result, error } = await useGet<any>(
      `/seller/pages/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, page: null as SellerManagedPage | null, error }
    }
    const page = toPage(result)
    upsertLocal(page)
    seeded.value = true
    return { ok: true as const, page, error: null as null }
  }

  async function createPage(form: SellerPageFormValues) {
    const payload = formToPayload(form)
    const { result, error } = await usePost<any>('/seller/pages', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, page: null as SellerManagedPage | null, error: apiErrorMessage(error, 'ثبت صفحه ناموفق بود') }
    }
    const page = toPage(result)
    upsertLocal(page)
    const { invalidate } = useStaticPages()
    invalidate(page.id as any)
    return { ok: true as const, page, error: null as null }
  }

  async function updatePage(id: string, form: SellerPageFormValues) {
    const previous = getById(id)
    const payload = formToPayload({ ...form, id }, previous)
    const { result, error } = await usePut<any>(
      `/seller/pages/${encodeURIComponent(id)}`,
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, page: null as SellerManagedPage | null, error: apiErrorMessage(error, 'ذخیره صفحه ناموفق بود') }
    }
    const page = toPage(result)
    upsertLocal(page)
    const { invalidate } = useStaticPages()
    invalidate(page.id as any)
    return { ok: true as const, page, error: null as null }
  }

  async function deletePage(id: string) {
    const { error } = await useDelete(`/seller/pages/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف صفحه ناموفق بود') }
    }
    items.value = items.value.filter(p => p.id !== id)
    return { ok: true as const, error: null as null }
  }

  async function setStatus(id: string, status: SellerPageStatus) {
    const { result, error } = await usePatch<any>(
      `/seller/pages/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, page: null as SellerManagedPage | null, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const page = toPage(result)
    upsertLocal(page)
    return { ok: true as const, page, error: null as null }
  }

  return {
    pages,
    publishedPages,
    listMeta,
    pending,
    seeded,
    fetchList,
    ensureLoaded,
    getById,
    getByPath,
    fetchById,
    createPage,
    updatePage,
    deletePage,
    setStatus,
    emptyPageForm,
    toPageForm,
    pageIdPattern,
  }
}
