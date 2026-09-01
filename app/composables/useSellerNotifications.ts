import {
  toNotificationCampaign,
  type SellerMockUser,
  type SellerNotificationCampaign,
  type SellerNotificationFormValues,
} from '~/data/seller-notifications'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

export function useSellerNotifications() {
  const items = useState<SellerNotificationCampaign[]>(
    'seller-notification-campaigns',
    () => [],
  )
  const users = useState<SellerMockUser[]>('seller-notification-users', () => [])
  const seeded = useState('seller-notification-campaigns-seeded', () => false)
  const usersLoaded = useState('seller-notification-users-loaded', () => false)
  const pending = useState('seller-notification-campaigns-pending', () => false)

  const campaigns = computed(() => items.value)

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }

    pending.value = true
    try {
      const { result, error } = await useGet<SellerNotificationCampaign[]>(
        '/seller/notifications',
        { headers: { 'no-error': true } },
      )
      if (error || !Array.isArray(result)) {
        items.value = []
      }
      else {
        items.value = result.map(c => toNotificationCampaign(c))
      }
      seeded.value = true
      return items.value
    }
    finally {
      pending.value = false
    }
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
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      link: form.link.trim() || null,
      icon: form.icon.trim() || 'i-tabler-bell',
      audienceType: form.audienceType,
      audienceGroup: form.audienceType === 'group' ? form.audienceGroup : null,
      userIds: form.audienceType === 'users' ? form.userIds : [],
    }

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
    items.value = [campaign, ...items.value.filter(c => c.id !== campaign.id)]
    seeded.value = true
    return {
      ok: true as const,
      campaign,
      recipients: { length: campaign.recipientCount },
    }
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
    users,
    pending: computed(() => pending.value),
    seeded,
    ensureLoaded,
    ensureUsersLoaded,
    previewAudienceCount,
    getById,
    sendNotification,
    deleteCampaign,
  }
}
