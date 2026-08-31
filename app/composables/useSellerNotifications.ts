import {
  buildDefaultNotificationCampaigns,
  createCampaignId,
  emptyNotificationForm,
  resolveAudienceUsers,
  type SellerNotificationCampaign,
  type SellerNotificationFormValues,
} from '~/data/seller-notifications'

export function useSellerNotifications() {
  const items = useState<SellerNotificationCampaign[]>(
    'seller-notification-campaigns',
    () => [],
  )
  const seeded = useState('seller-notification-campaigns-seeded', () => false)

  const campaigns = computed(() => items.value)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultNotificationCampaigns()
      seeded.value = true
    }
    return items.value
  }

  function getById(id: string) {
    return items.value.find(c => c.id === id)
  }

  function sendNotification(form: SellerNotificationFormValues) {
    const title = form.title.trim()
    const description = form.description.trim()
    if (!title || !description) {
      return { ok: false as const, error: 'عنوان و توضیحات الزامی است' }
    }
    if (form.audienceType === 'users' && !form.userIds.length) {
      return { ok: false as const, error: 'حداقل یک کاربر انتخاب کنید' }
    }

    const recipients = resolveAudienceUsers(
      form.audienceType,
      form.audienceType === 'group' ? form.audienceGroup : null,
      form.userIds,
    )
    if (!recipients.length) {
      return { ok: false as const, error: 'مخاطبی برای ارسال پیدا نشد' }
    }

    const now = new Date().toISOString()
    const campaign: SellerNotificationCampaign = {
      id: createCampaignId(),
      title,
      description,
      link: form.link.trim() || null,
      icon: form.icon.trim() || 'i-tabler-bell',
      audienceType: form.audienceType,
      audienceGroup: form.audienceType === 'group' ? form.audienceGroup : null,
      userIds: form.audienceType === 'users' ? [...form.userIds] : [],
      recipientCount: recipients.length,
      status: 'sent',
      createdAt: now,
      sentAt: now,
    }

    items.value = [campaign, ...items.value]
    return { ok: true as const, campaign, recipients }
  }

  function deleteCampaign(id: string) {
    if (!items.value.some(c => c.id === id)) {
      return { ok: false as const, error: 'اعلان پیدا نشد' }
    }
    items.value = items.value.filter(c => c.id !== id)
    return { ok: true as const }
  }

  return {
    campaigns,
    items,
    seeded,
    ensureLoaded,
    getById,
    sendNotification,
    deleteCampaign,
    emptyForm: emptyNotificationForm,
  }
}
