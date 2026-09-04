import {
  emptyCampaignForm,
  formToCampaign,
  toCampaignForm,
  campaignIdPattern,
  campaignLifecycle,
  type SellerCampaign,
  type SellerCampaignFormValues,
  type SellerCampaignManualStatus,
} from '~/data/seller-campaigns'
import { emptyMarketingTargeting } from '~/data/seller-marketing-shared'
import { emptySeoMeta } from '~/data/seo'

export type SellerCampaignsQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerCampaignsPage = {
  items: SellerCampaign[]
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

function toCampaign(raw: any): SellerCampaign {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    manualStatus: (['draft', 'paused', 'archived', 'active'].includes(raw.manualStatus)
      ? raw.manualStatus
      : 'draft') as SellerCampaignManualStatus,
    startsAt: String(raw.startsAt || new Date().toISOString()),
    endsAt: String(raw.endsAt || new Date().toISOString()),
    priority: Math.max(0, Math.round(Number(raw.priority) || 0)),
    image: raw.image ? String(raw.image) : null,
    landingUrl: String(raw.landingUrl || ''),
    slug: String(raw.slug || raw.id || ''),
    seo: { ...emptySeoMeta(), ...(raw.seo && typeof raw.seo === 'object' ? raw.seo : {}) },
    targeting: {
      ...emptyMarketingTargeting(),
      ...(raw.targeting && typeof raw.targeting === 'object' ? raw.targeting : {}),
    },
    discountIds: Array.isArray(raw.discountIds) ? raw.discountIds.map(String) : [],
    couponCodes: Array.isArray(raw.couponCodes) ? raw.couponCodes.map(String) : [],
    dealIds: Array.isArray(raw.dealIds) ? raw.dealIds.map(String) : [],
    bannerIds: Array.isArray(raw.bannerIds) ? raw.bannerIds.map(String) : [],
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
  }
}

function formToPayload(form: SellerCampaignFormValues) {
  const draft = formToCampaign(form)
  return {
    id: draft.id || undefined,
    name: draft.name,
    description: draft.description,
    manualStatus: draft.manualStatus,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    priority: draft.priority,
    image: draft.image,
    landingUrl: draft.landingUrl,
    slug: draft.slug,
    seo: draft.seo,
    targeting: draft.targeting,
    discountIds: draft.discountIds,
    couponCodes: draft.couponCodes,
    dealIds: draft.dealIds,
    bannerIds: draft.bannerIds,
  }
}

export function useSellerCampaigns() {
  const items = useState<SellerCampaign[]>('seller-campaigns', () => [])
  const listMeta = useState('seller-campaigns-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      active: 0,
      draft: 0,
      paused: 0,
      archived: 0,
      scheduled: 0,
      expired: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-campaigns-seeded', () => false)
  const pending = useState('seller-campaigns-pending', () => false)

  const campaigns = computed(() => items.value)

  function upsertLocal(campaign: SellerCampaign) {
    const index = items.value.findIndex(c => c.id === campaign.id)
    if (index === -1) {
      items.value = [campaign, ...items.value]
      return
    }
    const copy = [...items.value]
    copy[index] = campaign
    items.value = copy
  }

  async function fetchList(query?: SellerCampaignsQuery) {
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

      const { result, error } = await useGet<SellerCampaignsPage | SellerCampaign[]>(
        '/seller/campaigns',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'campaigns-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toCampaign)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            active: items.value.filter(c => campaignLifecycle(c) === 'active').length,
            draft: items.value.filter(c => c.manualStatus === 'draft').length,
            paused: items.value.filter(c => c.manualStatus === 'paused').length,
            archived: items.value.filter(c => c.manualStatus === 'archived').length,
            scheduled: items.value.filter(c => campaignLifecycle(c) === 'scheduled').length,
            expired: items.value.filter(c => campaignLifecycle(c) === 'expired').length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toCampaign) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || { all: items.value.length },
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

  async function fetchCampaign(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, campaign: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerCampaign>(
      `/seller/campaigns/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, campaign: null as SellerCampaign | null, error }
    }
    const campaign = toCampaign(result)
    upsertLocal(campaign)
    seeded.value = true
    return { ok: true as const, campaign, error: null as null }
  }

  function getById(id: string) {
    return items.value.find(c => c.id === id) ?? null
  }

  function validate(form: SellerCampaignFormValues) {
    if (!form.name.trim()) return 'نام الزامی است'
    if (!form.id.trim() || !campaignIdPattern.test(form.id.trim())) return 'شناسه نامعتبر است'
    if (form.endsAt && form.startsAt && form.endsAt <= form.startsAt) {
      return 'پایان باید بعد از شروع باشد'
    }
    return null
  }

  async function createCampaign(form: SellerCampaignFormValues) {
    const err = validate(form)
    if (err) return { ok: false as const, error: err }

    const payload = formToPayload(form)
    const { result, error } = await usePost<SellerCampaign>('/seller/campaigns', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت کمپین ناموفق بود') }
    }
    const campaign = toCampaign(result)
    upsertLocal(campaign)
    seeded.value = true
    return { ok: true as const, campaign }
  }

  async function updateCampaign(id: string, form: SellerCampaignFormValues) {
    const err = validate({ ...form, id })
    if (err) return { ok: false as const, error: err }

    const payload = formToPayload({ ...form, id })
    const { id: _omit, ...body } = payload
    const { result, error } = await usePut<SellerCampaign>(
      `/seller/campaigns/${encodeURIComponent(id)}`,
      body,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی کمپین ناموفق بود') }
    }
    const campaign = toCampaign(result)
    upsertLocal(campaign)
    return { ok: true as const, campaign }
  }

  async function deleteCampaign(id: string) {
    const { error } = await useDelete(`/seller/campaigns/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف کمپین ناموفق بود') }
    }
    items.value = items.value.filter(c => c.id !== id)
    return { ok: true as const }
  }

  async function setManualStatus(id: string, manualStatus: SellerCampaignManualStatus) {
    const { result, error } = await usePatch<SellerCampaign>(
      `/seller/campaigns/${encodeURIComponent(id)}/status`,
      { manualStatus },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const campaign = toCampaign(result)
    upsertLocal(campaign)
    return { ok: true as const, campaign }
  }

  async function bulkSetStatus(ids: string[], manualStatus: SellerCampaignManualStatus) {
    const { result, error } = await usePost<{ updated: number }>(
      '/seller/campaigns/bulk-status',
      { ids, manualStatus },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'اقدام گروهی ناموفق بود') }
    }
    items.value = items.value.map(c => (ids.includes(c.id) ? { ...c, manualStatus } : c))
    return { ok: true as const, updated: Number(result?.updated) || ids.length }
  }

  async function bulkDelete(ids: string[]) {
    const { result, error } = await usePost<{ deleted: number }>(
      '/seller/campaigns/bulk-delete',
      { ids },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف گروهی ناموفق بود') }
    }
    const set = new Set(ids)
    items.value = items.value.filter(c => !set.has(c.id))
    return { ok: true as const, deleted: Number(result?.deleted) || ids.length }
  }

  return {
    campaigns,
    items,
    listMeta,
    pending: computed(() => pending.value),
    seeded,
    fetchList,
    ensureLoaded,
    fetchCampaign,
    getById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setManualStatus,
    bulkSetStatus,
    bulkDelete,
    campaignLifecycle,
    emptyCampaignForm,
    toCampaignForm,
  }
}
