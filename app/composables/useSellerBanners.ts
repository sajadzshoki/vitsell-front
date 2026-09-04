import {
  formToSellerBanner,
  type SellerBanner,
  type SellerBannerFormValues,
} from '~/data/seller-banners'
import { deriveScheduleStatus } from '~/data/seller-marketing-shared'

export type SellerBannersQuery = {
  q?: string
  status?: string
  placement?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerBannersPage = {
  items: SellerBanner[]
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

function toBanner(raw: any): SellerBanner {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    internalName: String(raw.internalName || raw.id || ''),
    alt: String(raw.alt || ''),
    image: String(raw.image || ''),
    imageMobile: raw.imageMobile ? String(raw.imageMobile) : null,
    link: String(raw.link || ''),
    linkType: (['url', 'product', 'category', 'brand', 'campaign'].includes(raw.linkType)
      ? raw.linkType
      : 'url') as SellerBanner['linkType'],
    productId: raw.productId ? String(raw.productId) : null,
    brandId: raw.brandId ? String(raw.brandId) : null,
    campaignId: raw.campaignId ? String(raw.campaignId) : null,
    type: raw.type === 'secondary' ? 'secondary' : 'main',
    placement: (raw.placement || 'homepage_hero') as SellerBanner['placement'],
    categoryId: raw.categoryId ? String(raw.categoryId) : null,
    active: Boolean(raw.active),
    startsAt: raw.startsAt ? String(raw.startsAt) : null,
    endsAt: raw.endsAt ? String(raw.endsAt) : null,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    priority: Math.max(0, Math.round(Number(raw.priority) || 0)),
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
  }
}

function formToBannerPayload(form: SellerBannerFormValues) {
  const banner = formToSellerBanner(form)
  return {
    id: banner.id || undefined,
    title: banner.title,
    internalName: banner.internalName,
    alt: banner.alt,
    image: banner.image,
    imageMobile: banner.imageMobile,
    link: banner.link,
    linkType: banner.linkType,
    productId: banner.productId,
    brandId: banner.brandId,
    campaignId: banner.campaignId,
    type: banner.type,
    placement: banner.placement,
    categoryId: banner.categoryId,
    active: banner.active,
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    sortOrder: banner.sortOrder,
    priority: banner.priority,
  }
}

function scheduleOf(banner: SellerBanner) {
  return deriveScheduleStatus({
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    active: banner.active,
  })
}

function computeStatusCounts(list: SellerBanner[]): Record<string, number> {
  const counts = {
    all: list.length,
    active: 0,
    scheduled: 0,
    paused: 0,
    expired: 0,
  }
  for (const banner of list) {
    const status = scheduleOf(banner)
    if (status === 'active') counts.active += 1
    else if (status === 'scheduled') counts.scheduled += 1
    else if (status === 'paused') counts.paused += 1
    else if (status === 'expired' || status === 'ended') counts.expired += 1
  }
  return counts
}

export function useSellerBanners() {
  const items = useState<SellerBanner[]>('seller-banners-items', () => [])
  const listMeta = useState('seller-banners-meta', () => ({
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
  const seeded = useState('seller-banners-seeded', () => false)
  const pending = useState('seller-banners-pending', () => false)

  const banners = computed(() => items.value)

  function upsertLocal(banner: SellerBanner) {
    const index = items.value.findIndex(b => b.id === banner.id)
    if (index === -1) {
      items.value = [banner, ...items.value]
    }
    else {
      const copy = [...items.value]
      copy[index] = banner
      items.value = copy
    }
  }

  async function fetchList(query?: SellerBannersQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.placement && query.placement !== 'all') params.placement = query.placement
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerBannersPage | SellerBanner[]>(
        '/seller/banners',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'banners-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toBanner)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: computeStatusCounts(items.value),
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toBanner) : []
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

  async function fetchBanner(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, banner: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerBanner>(
      `/seller/banners/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, banner: null as SellerBanner | null, error }
    }
    const banner = toBanner(result)
    upsertLocal(banner)
    seeded.value = true
    return { ok: true as const, banner, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(b => b.id === id)
  }

  async function createBanner(form: SellerBannerFormValues) {
    const payload = formToBannerPayload(form)
    const { result, error } = await usePost<SellerBanner>('/seller/banners', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت بنر ناموفق بود') }
    }
    const banner = toBanner(result)
    upsertLocal(banner)
    seeded.value = true
    return { ok: true as const, banner }
  }

  async function updateBanner(id: string, form: SellerBannerFormValues) {
    const payload = formToBannerPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerBanner>(
      `/seller/banners/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی بنر ناموفق بود') }
    }
    const banner = toBanner(result)
    upsertLocal(banner)
    return { ok: true as const, banner }
  }

  async function deleteBanner(id: string) {
    const { error } = await useDelete(`/seller/banners/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف بنر ناموفق بود') }
    }
    items.value = items.value.filter(b => b.id !== id)
    return { ok: true as const }
  }

  async function setActive(id: string, active: boolean) {
    const { result, error } = await usePatch<SellerBanner>(
      `/seller/banners/${encodeURIComponent(id)}/active`,
      { active },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const banner = toBanner(result)
    upsertLocal(banner)
    return { ok: true as const, banner }
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
    banners,
    items,
    listMeta,
    pending: computed(() => pending.value),
    seeded,
    fetchList,
    ensureLoaded,
    fetchBanner,
    getById,
    createBanner,
    updateBanner,
    deleteBanner,
    setActive,
    setActiveMany,
  }
}
