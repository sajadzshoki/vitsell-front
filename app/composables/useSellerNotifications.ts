import {
  toNotificationCampaign,
  type SellerMockUser,
  type SellerNotificationCampaign,
  type SellerNotificationFormValues,
} from '~/data/seller-notifications'

export type SellerNotificationsQuery = {
  q?: string
  status?: string
  type?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerNotificationsPage = {
  items: SellerNotificationCampaign[]
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

function formPayload(form: SellerNotificationFormValues) {
  const relatedType = form.relatedEntityType.trim()
  const relatedId = form.relatedEntityId.trim()
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    link: form.link.trim() || null,
    icon: form.icon.trim() || 'i-tabler-bell',
    type: form.type,
    audienceType: form.audienceType,
    audienceGroup: form.audienceType === 'group' ? form.audienceGroup : null,
    userIds: form.audienceType === 'users' ? form.userIds : [],
    scheduledAt: form.scheduledAt.trim()
      ? new Date(form.scheduledAt).toISOString()
      : null,
    image: form.image.trim() || null,
    relatedEntity: relatedType && relatedId
      ? { type: relatedType, id: relatedId }
      : null,
  }
}

const emptyStatusCounts = () => ({
  all: 0,
  draft: 0,
  scheduled: 0,
  sent: 0,
  failed: 0,
  cancelled: 0,
})

export function useSellerNotifications() {
  const items = useState<SellerNotificationCampaign[]>(
    'seller-notification-campaigns',
    () => [],
  )
  const listMeta = useState('seller-notification-campaigns-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: emptyStatusCounts() as Record<string, number>,
  }))
  const users = useState<SellerMockUser[]>('seller-notification-users', () => [])
  const seeded = useState('seller-notification-campaigns-seeded', () => false)
  const usersLoaded = useState('seller-notification-users-loaded', () => false)
  const pending = useState('seller-notification-campaigns-pending', () => false)

  const campaigns = computed(() => items.value)

  function upsertLocal(campaign: SellerNotificationCampaign) {
    items.value = [campaign, ...items.value.filter(c => c.id !== campaign.id)]
    seeded.value = true
  }

  async function fetchList(query?: SellerNotificationsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.type && query.type !== 'all') params.type = query.type
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerNotificationsPage | SellerNotificationCampaign[]>(
        '/seller/notifications',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'notifications-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(c => toNotificationCampaign(c))
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            ...emptyStatusCounts(),
            all: items.value.length,
            draft: items.value.filter(c => c.status === 'draft').length,
            scheduled: items.value.filter(c => c.status === 'scheduled').length,
            sent: items.value.filter(c => c.status === 'sent').length,
            failed: items.value.filter(c => c.status === 'failed').length,
            cancelled: items.value.filter(c => c.status === 'cancelled').length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items)
          ? result.items.map(c => toNotificationCampaign(c))
          : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || {
            ...emptyStatusCounts(),
            all: items.value.length,
          },
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
    if (seeded.value && !options?.force) {
      return items.value
    }
    await fetchList({ page: 1, pageSize: 100 })
    return items.value
  }

  async function fetchById(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, campaign: cached, error: null as null }
    }

    const { result, error } = await useGet<SellerNotificationCampaign>(
      `/seller/notifications/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        campaign: null as SellerNotificationCampaign | null,
        error,
      }
    }
    const campaign = toNotificationCampaign(result)
    upsertLocal(campaign)
    return { ok: true as const, campaign, error: null as null }
  }

  async function ensureUsersLoaded(options?: { force?: boolean }) {
    if (usersLoaded.value && users.value.length && !options?.force) {
      return users.value
    }
    const { result, error } = await useGet<SellerMockUser[]>(
      '/seller/notification-users',
      { headers: { 'no-error': true } },
    )
    users.value = (!error && Array.isArray(result)) ? result : []
    usersLoaded.value = true
    return users.value
  }

  async function previewAudienceCount(form: SellerNotificationFormValues) {
    const { result, error } = await usePost<{ count: number }>(
      '/seller/notifications/preview',
      {
        audienceType: form.audienceType,
        audienceGroup: form.audienceType === 'group' ? form.audienceGroup : null,
        userIds: form.audienceType === 'users' ? form.userIds : [],
      },
      { headers: { 'no-error': true } },
    )
    if (error || typeof result?.count !== 'number') return 0
    return result.count
  }

  function getById(id: string) {
    return items.value.find(c => c.id === id)
  }

  async function sendNotification(form: SellerNotificationFormValues) {
    const payload = formPayload(form)

    const { result, error } = await usePost<SellerNotificationCampaign>(
      '/seller/notifications',
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'ارسال اعلان ناموفق بود'),
      }
    }
    const campaign = toNotificationCampaign(result)
    upsertLocal(campaign)
    return {
      ok: true as const,
      campaign,
      recipients: { length: campaign.recipientCount },
    }
  }

  async function cancelScheduled(id: string) {
    const existing = getById(id)
    if (existing && existing.status !== 'scheduled') {
      return { ok: false as const, error: 'فقط اعلان‌های زمان‌بندی‌شده قابل لغو هستند' }
    }

    const { result, error } = await usePatch<SellerNotificationCampaign>(
      `/seller/notifications/${encodeURIComponent(id)}/cancel`,
      {},
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'لغو زمان‌بندی ناموفق بود') }
    }
    const campaign = toNotificationCampaign(result)
    upsertLocal(campaign)
    return { ok: true as const, campaign }
  }

  async function deleteCampaign(id: string) {
    const { error } = await useDelete(`/seller/notifications/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف اعلان ناموفق بود') }
    }
    items.value = items.value.filter(c => c.id !== id)
    return { ok: true as const }
  }

  return {
    campaigns,
    items,
    listMeta,
    users,
    pending: computed(() => pending.value),
    seeded,
    fetchList,
    ensureLoaded,
    fetchById,
    ensureUsersLoaded,
    previewAudienceCount,
    getById,
    sendNotification,
    cancelScheduled,
    deleteCampaign,
  }
}
