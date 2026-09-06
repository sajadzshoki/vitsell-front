import {
  buildDefaultProductTags,
  emptyProductTagForm,
  formToProductTag,
  toProductTagForm,
  type SellerProductTag,
  type SellerProductTagForm,
} from '~/data/seller-product-tags'

export function useSellerProductTags() {
  const items = useState<SellerProductTag[]>('seller-product-tags', () => [])
  const seeded = useState('seller-product-tags-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultProductTags()
      seeded.value = true
    }
    return items.value
  }

  const tags = computed(() => items.value)

  function getById(id: string) {
    return items.value.find(t => t.id === id) ?? null
  }

  function createTag(form: SellerProductTagForm) {
    ensureLoaded()
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    const slug = (form.slug.trim() || form.name).toLowerCase()
    if (items.value.some(t => t.slug === slug || t.name === form.name.trim())) {
      return { ok: false as const, error: 'برچسب تکراری است' }
    }
    const tag = formToProductTag({ ...form, slug })
    items.value = [tag, ...items.value]
    return { ok: true as const, tag }
  }

  function updateTag(id: string, form: SellerProductTagForm) {
    ensureLoaded()
    const index = items.value.findIndex(t => t.id === id)
    if (index === -1) return { ok: false as const, error: 'برچسب پیدا نشد' }
    const next = formToProductTag({ ...form, id }, items.value[index])
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, tag: next }
  }

  function deleteTag(id: string) {
    ensureLoaded()
    const tag = getById(id)
    if (!tag) return { ok: false as const, error: 'برچسب پیدا نشد' }
    if (tag.usageCount > 0) return { ok: false as const, error: 'برچسب در حال استفاده است' }
    items.value = items.value.filter(t => t.id !== id)
    return { ok: true as const }
  }

  function bumpUsage(names: string[], delta: number) {
    ensureLoaded()
    const set = new Set(names.map(s => s.trim()).filter(Boolean))
    items.value = items.value.map((t) => {
      if (!set.has(t.name)) return t
      return {
        ...t,
        usageCount: Math.max(0, t.usageCount + delta),
        updatedAt: new Date().toISOString(),
      }
    })
  }

  function ensureTagByName(name: string) {
    ensureLoaded()
    const trimmed = name.trim()
    if (!trimmed) return null
    const existing = items.value.find(
      t => t.name === trimmed || t.slug === trimmed.toLowerCase(),
    )
    if (existing) return existing
    const result = createTag({ id: '', name: trimmed, slug: '' })
    return result.ok ? result.tag : null
  }

  return {
    tags,
    ensureLoaded,
    getById,
    createTag,
    updateTag,
    deleteTag,
    bumpUsage,
    ensureTagByName,
    emptyProductTagForm,
    toProductTagForm,
  }
}
