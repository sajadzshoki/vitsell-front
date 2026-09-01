import {
  buildDefaultBlogCategories,
  buildDefaultBlogTags,
  emptyBlogCategoryForm,
  emptyBlogTagForm,
  formToBlogCategory,
  formToBlogTag,
  isValidLatinSlug,
  toBlogCategoryForm,
  toBlogTagForm,
  type SellerBlogCategory,
  type SellerBlogCategoryForm,
  type SellerBlogTag,
  type SellerBlogTagForm,
} from '~/data/seller-blog-taxonomy'

export function useSellerBlogCategories() {
  const items = useState<SellerBlogCategory[]>('seller-blog-categories', () => [])
  const seeded = useState('seller-blog-categories-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultBlogCategories()
      seeded.value = true
    }
    return items.value
  }

  const categories = computed(() => items.value)
  const activeCategories = computed(() => items.value.filter(c => c.status === 'active'))

  function getById(id: string) {
    return items.value.find(c => c.id === id) ?? null
  }

  function createCategory(form: SellerBlogCategoryForm) {
    ensureLoaded()
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    const slug = form.slug.trim().toLowerCase()
    if (slug && !isValidLatinSlug(slug)) return { ok: false as const, error: 'اسلاگ نامعتبر است' }
    if (items.value.some(c => c.slug === slug || c.id === form.id.trim())) {
      return { ok: false as const, error: 'شناسه یا اسلاگ تکراری است' }
    }
    const category = formToBlogCategory(form)
    items.value = [category, ...items.value]
    return { ok: true as const, category }
  }

  function updateCategory(id: string, form: SellerBlogCategoryForm) {
    ensureLoaded()
    const index = items.value.findIndex(c => c.id === id)
    if (index === -1) return { ok: false as const, error: 'دسته پیدا نشد' }
    const next = formToBlogCategory({ ...form, id }, items.value[index])
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, category: next }
  }

  function deleteCategory(id: string) {
    ensureLoaded()
    if (!items.value.some(c => c.id === id)) return { ok: false as const, error: 'دسته پیدا نشد' }
    items.value = items.value.filter(c => c.id !== id)
    return { ok: true as const }
  }

  return {
    categories,
    activeCategories,
    ensureLoaded,
    getById,
    createCategory,
    updateCategory,
    deleteCategory,
    emptyBlogCategoryForm,
    toBlogCategoryForm,
  }
}

export function useSellerBlogTags() {
  const items = useState<SellerBlogTag[]>('seller-blog-tags', () => [])
  const seeded = useState('seller-blog-tags-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultBlogTags()
      seeded.value = true
    }
    return items.value
  }

  const tags = computed(() => items.value)

  function getById(id: string) {
    return items.value.find(t => t.id === id) ?? null
  }

  function getBySlug(slug: string) {
    return items.value.find(t => t.slug === slug.toLowerCase()) ?? null
  }

  function createTag(form: SellerBlogTagForm) {
    ensureLoaded()
    if (!form.name.trim()) return { ok: false as const, error: 'نام الزامی است' }
    const slug = (form.slug.trim() || form.name).toLowerCase()
    if (items.value.some(t => t.slug === slug || t.name === form.name.trim())) {
      return { ok: false as const, error: 'برچسب تکراری است' }
    }
    const tag = formToBlogTag({ ...form, slug })
    items.value = [tag, ...items.value]
    return { ok: true as const, tag }
  }

  function updateTag(id: string, form: SellerBlogTagForm) {
    ensureLoaded()
    const index = items.value.findIndex(t => t.id === id)
    if (index === -1) return { ok: false as const, error: 'برچسب پیدا نشد' }
    const next = formToBlogTag({ ...form, id }, items.value[index])
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

  function bumpUsage(slugs: string[], delta: number) {
    ensureLoaded()
    const set = new Set(slugs.map(s => s.toLowerCase()))
    items.value = items.value.map((t) => {
      if (!set.has(t.slug)) return t
      return { ...t, usageCount: Math.max(0, t.usageCount + delta), updatedAt: new Date().toISOString() }
    })
  }

  function ensureTagByName(name: string) {
    ensureLoaded()
    const trimmed = name.trim()
    if (!trimmed) return null
    const existing = items.value.find(t => t.name === trimmed || t.slug === trimmed.toLowerCase())
    if (existing) return existing
    const result = createTag({ id: '', name: trimmed, slug: '' })
    return result.ok ? result.tag : null
  }

  return {
    tags,
    ensureLoaded,
    getById,
    getBySlug,
    createTag,
    updateTag,
    deleteTag,
    bumpUsage,
    ensureTagByName,
    emptyBlogTagForm,
    toBlogTagForm,
  }
}
