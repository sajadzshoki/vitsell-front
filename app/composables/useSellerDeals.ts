import {
  buildDefaultAmazingDeals,
  formToAmazingDeal,
  type SellerAmazingDeal,
  type SellerAmazingDealFormValues,
} from '~/data/seller-deals'

export function useSellerDeals() {
  const items = useState<SellerAmazingDeal[]>('seller-amazing-deals', () => [])
  const seeded = useState('seller-amazing-deals-seeded', () => false)

  const deals = computed(() => items.value)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultAmazingDeals()
      seeded.value = true
    }
    return items.value
  }

  function getById(id: string) {
    return items.value.find(d => d.id === id)
  }

  function createDeal(form: SellerAmazingDealFormValues) {
    const id = form.id.trim()
    if (getById(id)) {
      return { ok: false as const, error: 'شناسه شگفت‌انگیز تکراری است' }
    }
    if (items.value.some(d => d.productId === form.productId.trim() && d.active)) {
      return { ok: false as const, error: 'برای این محصول قبلاً شگفت‌انگیز فعال ثبت شده است' }
    }
    const next = formToAmazingDeal(form)
    items.value = [next, ...items.value]
    return { ok: true as const, deal: next }
  }

  function updateDeal(id: string, form: SellerAmazingDealFormValues) {
    const index = items.value.findIndex(d => d.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'شگفت‌انگیز پیدا نشد' }
    }
    const productId = form.productId.trim()
    if (
      items.value.some(
        (d, i) => i !== index && d.productId === productId && d.active && form.active,
      )
    ) {
      return { ok: false as const, error: 'برای این محصول قبلاً شگفت‌انگیز فعال ثبت شده است' }
    }
    const previous = items.value[index]!
    const next = formToAmazingDeal({ ...form, id: previous.id }, previous)
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, deal: next }
  }

  function deleteDeal(id: string) {
    if (!items.value.some(d => d.id === id)) {
      return { ok: false as const, error: 'شگفت‌انگیز پیدا نشد' }
    }
    items.value = items.value.filter(d => d.id !== id)
    return { ok: true as const }
  }

  function setActive(id: string, active: boolean) {
    const index = items.value.findIndex(d => d.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'شگفت‌انگیز پیدا نشد' }
    }
    const current = items.value[index]!
    if (active && items.value.some((d, i) => i !== index && d.productId === current.productId && d.active)) {
      return { ok: false as const, error: 'برای این محصول قبلاً شگفت‌انگیز فعال ثبت شده است' }
    }
    const copy = [...items.value]
    copy[index] = {
      ...current,
      active,
      updatedAt: new Date().toISOString(),
    }
    items.value = copy
    return { ok: true as const, deal: copy[index]! }
  }

  return {
    deals,
    items,
    seeded,
    ensureLoaded,
    getById,
    createDeal,
    updateDeal,
    deleteDeal,
    setActive,
  }
}
