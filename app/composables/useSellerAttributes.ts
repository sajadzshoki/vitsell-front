import {
  attributeSlugPattern,
  buildDefaultSellerAttributes,
  emptyAttributeForm,
  toAttributeForm,
  type SellerAttribute,
  type SellerAttributeFormValues,
} from '~/data/seller-attributes'

export function useSellerAttributes() {
  const items = useState<SellerAttribute[]>('seller-attributes', () => [])
  const seeded = useState('seller-attributes-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerAttributes()
      seeded.value = true
    }
    return items.value
  }

  const attributes = computed(() => items.value)
  const activeAttributes = computed(() => items.value.filter(a => a.status === 'active'))

  function getById(id: string) {
    return items.value.find(a => a.id === id) ?? null
  }

  function attributesForCategory(categoryId: string) {
    ensureLoaded()
    if (!categoryId) return activeAttributes.value
    return activeAttributes.value.filter(a =>
      !a.categoryIds.length || a.categoryIds.includes(categoryId),
    )
  }

  function createAttribute(form: SellerAttributeFormValues) {
    ensureLoaded()
    const slug = form.slug.trim().toLowerCase()
    const id = form.id.trim() || `attr-${slug}`
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    if (!attributeSlugPattern.test(slug)) return { ok: false as const, error: 'اسلاگ نامعتبر است' }
    if (items.value.some(a => a.slug === slug || a.id === id)) {
      return { ok: false as const, error: 'شناسه یا اسلاگ تکراری است' }
    }
    const now = new Date().toISOString()
    const attr: SellerAttribute = {
      id,
      name: form.name.trim(),
      slug,
      type: form.type,
      values: form.values
        .filter(v => v.label.trim())
        .map((v, i) => ({
          ...v,
          id: v.id || `val-${slug}-${i}`,
          label: v.label.trim(),
          value: (v.value || v.label).trim().toLowerCase().replace(/\s+/g, '-'),
          sortOrder: i,
          status: v.status || 'active',
        })),
      status: form.status,
      sortOrder: form.sortOrder,
      filterable: form.filterable,
      searchable: form.searchable,
      variantDefining: form.variantDefining,
      categoryIds: [...form.categoryIds],
      createdAt: now,
      updatedAt: now,
    }
    items.value = [attr, ...items.value]
    return { ok: true as const, attribute: attr }
  }

  function updateAttribute(id: string, form: SellerAttributeFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(a => a.id === id)
    if (index === -1) return { ok: false as const, error: 'ویژگی پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerAttribute = {
      ...previous,
      name: form.name.trim() || previous.name,
      type: form.type,
      values: form.values
        .filter(v => v.label.trim())
        .map((v, i) => ({
          ...v,
          label: v.label.trim(),
          value: (v.value || v.label).trim().toLowerCase().replace(/\s+/g, '-'),
          sortOrder: i,
          status: v.status || 'active',
        })),
      status: form.status,
      sortOrder: form.sortOrder,
      filterable: form.filterable,
      searchable: form.searchable,
      variantDefining: form.variantDefining,
      categoryIds: [...form.categoryIds],
      updatedAt: new Date().toISOString(),
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, attribute: next }
  }

  function deleteAttribute(id: string) {
    ensureLoaded()
    if (!items.value.some(a => a.id === id)) return { ok: false as const, error: 'ویژگی پیدا نشد' }
    items.value = items.value.filter(a => a.id !== id)
    return { ok: true as const }
  }

  function setStatus(id: string, status: SellerAttribute['status']) {
    const attr = getById(id)
    if (!attr) return { ok: false as const, error: 'ویژگی پیدا نشد' }
    return updateAttribute(id, { ...toAttributeForm(attr), status })
  }

  return {
    attributes,
    activeAttributes,
    ensureLoaded,
    getById,
    attributesForCategory,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    setStatus,
    emptyAttributeForm,
    toAttributeForm,
  }
}
