import {
  buildDefaultSellerCampaigns,
  emptyCampaignForm,
  formToCampaign,
  toCampaignForm,
  campaignIdPattern,
  campaignLifecycle,
  type SellerCampaign,
  type SellerCampaignFormValues,
  type SellerCampaignManualStatus,
} from '~/data/seller-campaigns'

export function useSellerCampaigns() {
  const items = useState<SellerCampaign[]>('seller-campaigns', () => [])
  const seeded = useState('seller-campaigns-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerCampaigns()
      seeded.value = true
    }
    return items.value
  }

  const campaigns = computed(() => items.value)

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

  function createCampaign(form: SellerCampaignFormValues) {
    ensureLoaded()
    const err = validate(form)
    if (err) return { ok: false as const, error: err }
    if (items.value.some(c => c.id === form.id.trim())) {
      return { ok: false as const, error: 'شناسه تکراری است' }
    }
    const campaign = formToCampaign(form)
    items.value = [campaign, ...items.value]
    return { ok: true as const, campaign }
  }

  function updateCampaign(id: string, form: SellerCampaignFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(c => c.id === id)
    if (index === -1) return { ok: false as const, error: 'کمپین پیدا نشد' }
    const err = validate({ ...form, id })
    if (err) return { ok: false as const, error: err }
    const next = formToCampaign({ ...form, id }, items.value[index])
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, campaign: next }
  }

  function deleteCampaign(id: string) {
    ensureLoaded()
    if (!items.value.some(c => c.id === id)) return { ok: false as const, error: 'کمپین پیدا نشد' }
    items.value = items.value.filter(c => c.id !== id)
    return { ok: true as const }
  }

  function setManualStatus(id: string, manualStatus: SellerCampaignManualStatus) {
    const c = getById(id)
    if (!c) return { ok: false as const, error: 'کمپین پیدا نشد' }
    return updateCampaign(id, { ...toCampaignForm(c), manualStatus })
  }

  return {
    campaigns,
    ensureLoaded,
    getById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setManualStatus,
    campaignLifecycle,
    emptyCampaignForm,
    toCampaignForm,
  }
}
