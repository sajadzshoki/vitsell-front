import {
  buildDefaultSellerPages,
  emptyPageForm,
  formToSellerPage,
  pageIdPattern,
  toPageForm,
  type SellerManagedPage,
  type SellerPageFormValues,
  type SellerPageStatus,
} from '~/data/seller-pages'

export function useSellerPages() {
  const items = useState<SellerManagedPage[]>('seller-managed-pages', () => [])
  const seeded = useState('seller-managed-pages-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerPages()
      seeded.value = true
    }
    return items.value
  }

  const pages = computed(() => items.value)
  const publishedPages = computed(() => items.value.filter(p => p.status === 'published'))

  function getById(id: string) {
    return items.value.find(p => p.id === id) ?? null
  }

  function getByPath(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return items.value.find(p => p.path === normalized) ?? null
  }

  function createPage(form: SellerPageFormValues) {
    ensureLoaded()
    const id = form.id.trim()
    if (!id) return { ok: false as const, error: 'شناسه الزامی است' }
    if (!pageIdPattern().test(id)) return { ok: false as const, error: 'شناسه نامعتبر است' }
    if (getById(id)) return { ok: false as const, error: 'شناسه صفحه تکراری است' }
    if (!form.title.trim()) return { ok: false as const, error: 'عنوان الزامی است' }
    if (!form.path.trim()) return { ok: false as const, error: 'مسیر الزامی است' }
    if (items.value.some(p => p.path === (form.path.startsWith('/') ? form.path : `/${form.path}`))) {
      return { ok: false as const, error: 'مسیر تکراری است' }
    }
    const page = formToSellerPage(form)
    items.value = [page, ...items.value]
    return { ok: true as const, page }
  }

  function updatePage(id: string, form: SellerPageFormValues) {
    ensureLoaded()
    const index = items.value.findIndex(p => p.id === id)
    if (index === -1) return { ok: false as const, error: 'صفحه پیدا نشد' }
    if (!form.title.trim()) return { ok: false as const, error: 'عنوان الزامی است' }
    const path = form.path.trim().startsWith('/') ? form.path.trim() : `/${form.path.trim()}`
    if (items.value.some(p => p.id !== id && p.path === path)) {
      return { ok: false as const, error: 'مسیر تکراری است' }
    }
    const next = formToSellerPage({ ...form, id }, items.value[index])
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, page: next }
  }

  function deletePage(id: string) {
    ensureLoaded()
    if (!items.value.some(p => p.id === id)) return { ok: false as const, error: 'صفحه پیدا نشد' }
    items.value = items.value.filter(p => p.id !== id)
    return { ok: true as const }
  }

  function setStatus(id: string, status: SellerPageStatus) {
    ensureLoaded()
    const index = items.value.findIndex(p => p.id === id)
    if (index === -1) return { ok: false as const, error: 'صفحه پیدا نشد' }
    const previous = items.value[index]!
    const now = new Date().toISOString()
    const copy = [...items.value]
    copy[index] = {
      ...previous,
      status,
      publishedAt: status === 'published' ? (previous.publishedAt || now) : previous.publishedAt,
      updatedAt: now,
    }
    items.value = copy
    return { ok: true as const, page: copy[index]! }
  }

  return {
    pages,
    publishedPages,
    ensureLoaded,
    getById,
    getByPath,
    createPage,
    updatePage,
    deletePage,
    setStatus,
    emptyPageForm,
    toPageForm,
  }
}
