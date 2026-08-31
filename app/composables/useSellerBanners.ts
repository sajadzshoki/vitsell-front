import {
  buildDefaultSellerBanners,
  formToSellerBanner,
  type SellerBanner,
  type SellerBannerFormValues,
} from '~/data/seller-banners'

export function useSellerBanners() {
  const items = useState<SellerBanner[]>('seller-banners-items', () => [])
  const seeded = useState('seller-banners-seeded', () => false)

  const banners = computed(() => items.value)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerBanners()
      seeded.value = true
    }
    return items.value
  }

  function getById(id: string) {
    return items.value.find(b => b.id === id)
  }

  function createBanner(form: SellerBannerFormValues) {
    const id = form.id.trim()
    if (getById(id)) {
      return { ok: false as const, error: 'شناسه بنر تکراری است' }
    }
    const next = formToSellerBanner(form)
    items.value = [next, ...items.value]
    return { ok: true as const, banner: next }
  }

  function updateBanner(id: string, form: SellerBannerFormValues) {
    const index = items.value.findIndex(b => b.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'بنر پیدا نشد' }
    }
    const previous = items.value[index]!
    const next = formToSellerBanner({ ...form, id: previous.id }, previous)
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, banner: next }
  }

  function deleteBanner(id: string) {
    if (!items.value.some(b => b.id === id)) {
      return { ok: false as const, error: 'بنر پیدا نشد' }
    }
    items.value = items.value.filter(b => b.id !== id)
    return { ok: true as const }
  }

  function setActive(id: string, active: boolean) {
    const index = items.value.findIndex(b => b.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'بنر پیدا نشد' }
    }
    const copy = [...items.value]
    copy[index] = {
      ...copy[index]!,
      active,
      updatedAt: new Date().toISOString(),
    }
    items.value = copy
    return { ok: true as const, banner: copy[index]! }
  }

  return {
    banners,
    items,
    seeded,
    ensureLoaded,
    getById,
    createBanner,
    updateBanner,
    deleteBanner,
    setActive,
  }
}
