import { emptySeoMeta } from '~/data/seo'
import {
  brandSlugPattern,
  buildDefaultSellerBrands,
  emptyBrandForm,
  toBrandForm,
  type SellerBrand,
  type SellerBrandFormValues,
} from '~/data/seller-brands'

export function useSellerBrands() {
  const items = useState<SellerBrand[]>('seller-brands', () => [])
  const seeded = useState('seller-brands-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerBrands()
      seeded.value = true
    }
    return items.value
  }

  const brands = computed(() => items.value)
  const activeBrands = computed(() => items.value.filter(b => b.status === 'active'))

  function getById(id: string) {
    return items.value.find(b => b.id === id) ?? null
  }

  function createBrand(form: SellerBrandFormValues) {
    ensureLoaded()
    const slug = form.slug.trim().toLowerCase()
    const id = form.id.trim() || `brand-${slug}`
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    if (!brandSlugPattern.test(slug)) return { ok: false as const, error: 'اسلاگ نامعتبر است' }
    if (items.value.some(b => b.slug === slug || b.id === id)) {
      return { ok: false as const, error: 'شناسه یا اسلاگ تکراری است' }
    }
    const now = new Date().toISOString()
    const brand: SellerBrand = {
      id,
      name: form.name.trim(),
      slug,
      logo: form.logo.trim() || null,
      description: form.description.trim(),
      status: form.status,
      sortOrder: form.sortOrder,
      seo: { ...emptySeoMeta(), ...(form.seo || {}) },
      createdAt: now,
      updatedAt: now,
    }
    items.value = [brand, ...items.value]
    return { ok: true as const, brand }
  }

  function updateBrand(id: string, form: SellerBrandFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(b => b.id === id)
    if (index === -1) return { ok: false as const, error: 'برند پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerBrand = {
      ...previous,
      name: form.name.trim() || previous.name,
      logo: form.logo.trim() || null,
      description: form.description.trim(),
      status: form.status,
      sortOrder: form.sortOrder,
      seo: { ...emptySeoMeta(), ...(form.seo || previous.seo || {}) },
      updatedAt: new Date().toISOString(),
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, brand: next }
  }

  function deleteBrand(id: string) {
    ensureLoaded()
    if (!items.value.some(b => b.id === id)) return { ok: false as const, error: 'برند پیدا نشد' }
    items.value = items.value.filter(b => b.id !== id)
    return { ok: true as const }
  }

  function setStatus(id: string, status: SellerBrand['status']) {
    const brand = getById(id)
    if (!brand) return { ok: false as const, error: 'برند پیدا نشد' }
    return updateBrand(id, { ...toBrandForm(brand), status })
  }

  return {
    brands,
    activeBrands,
    ensureLoaded,
    getById,
    createBrand,
    updateBrand,
    deleteBrand,
    setStatus,
    emptyBrandForm,
    toBrandForm,
  }
}
