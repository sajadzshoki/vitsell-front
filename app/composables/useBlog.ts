import {
  buildDefaultSellerBlogPosts,
  formToSellerBlogPost,
  isBlogPostPubliclyVisible,
  normalizeBlogPost,
  toStaticBlogPost,
  type SellerBlogFormValues,
  type SellerBlogPost,
  type SellerBlogStatus,
} from '~/data/seller-blog'
import { type StaticBlogPost } from '~/data/static-pages'

function clonePosts(list: SellerBlogPost[]): SellerBlogPost[] {
  return JSON.parse(JSON.stringify(list)) as SellerBlogPost[]
}

function fromApiPost(post: StaticBlogPost & Record<string, any>, base?: SellerBlogPost): SellerBlogPost {
  const content = Array.isArray(post.content)
    ? post.content
    : typeof post.content === 'string'
      ? [post.content]
      : []

  const normalized = normalizeBlogPost({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    image: post.image,
    relatedCategories: post.relatedCategories ?? base?.relatedCategories ?? [],
    content: content.length ? content : (base?.content ?? []),
    highlights: post.highlights ?? base?.highlights,
    popular: post.popular ?? base?.popular,
    engagement: post.engagement ?? base?.engagement,
    active: post.active !== false,
  })

  const status = (['draft', 'scheduled', 'published', 'archived'].includes(post.status)
    ? post.status
    : (base?.status ?? normalized.status)) as SellerBlogStatus

  return {
    ...normalized,
    popular: post.popular ?? base?.popular ?? normalized.popular,
    engagement: post.engagement ?? base?.engagement ?? normalized.engagement,
    active: post.active !== false,
    createdAt: post.createdAt ? String(post.createdAt) : (base?.createdAt ?? normalized.createdAt),
    updatedAt: post.updatedAt ? String(post.updatedAt) : (base?.updatedAt ?? normalized.updatedAt),
    status,
    publishedAt: post.publishedAt != null
      ? String(post.publishedAt)
      : (base?.publishedAt ?? normalized.publishedAt),
    scheduledAt: post.scheduledAt != null
      ? String(post.scheduledAt)
      : (base?.scheduledAt ?? normalized.scheduledAt),
    featured: Boolean(post.featured ?? post.popular ?? base?.featured ?? normalized.featured),
    imageAlt: String(post.imageAlt || base?.imageAlt || normalized.imageAlt || post.title || ''),
    tags: Array.isArray(post.tags) ? post.tags.map(String) : (base?.tags ?? normalized.tags),
    relatedPostIds: Array.isArray(post.relatedPostIds)
      ? post.relatedPostIds.map(String)
      : (base?.relatedPostIds ?? normalized.relatedPostIds),
    seo: post.seo ? { ...normalized.seo, ...post.seo } : (base?.seo ?? normalized.seo),
  }
}

export function useBlog() {
  const items = useState<SellerBlogPost[]>('site-blog-posts', () => [])
  const loaded = useState('site-blog-loaded', () => false)
  const pending = useState('site-blog-pending', () => false)

  const posts = computed(() => items.value)

  const publishedPosts = computed(() =>
    items.value.filter(p => isBlogPostPubliclyVisible(p)),
  )

  async function ensureLoaded(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) return items.value
    if (pending.value && !options?.force) return items.value

    pending.value = true
    try {
      const { result, error } = await useGet<StaticBlogPost[]>('/blog', {
        headers: { 'no-error': true },
      })
      items.value = !error && Array.isArray(result)
        ? result.map(post => fromApiPost(post))
        : []
      loaded.value = true
    }
    catch {
      items.value = []
      loaded.value = true
    }
    finally {
      pending.value = false
    }

    return items.value
  }

  /** Seed فوری بدون انتظار API — برای پنل ادمین */
  function ensureSeeded() {
    if (!loaded.value || !items.value.length) {
      items.value = buildDefaultSellerBlogPosts()
      loaded.value = true
    }
    return items.value
  }

  function getById(id: string) {
    return items.value.find(p => p.id === id)
  }

  function getPublishedById(id: string) {
    const post = getById(id)
    if (!post || !isBlogPostPubliclyVisible(post)) return undefined
    return post
  }

  function getByIdForPreview(id: string, allowPreview = false) {
    const post = getById(id)
    if (!post) return undefined
    if (allowPreview || isBlogPostPubliclyVisible(post)) return post
    return undefined
  }

  /** پیش‌نمایش ادمین: از /seller/blog/:id (پیش‌نویس‌ها هم برمی‌گردند) */
  async function fetchPreviewById(id: string) {
    const key = id.trim()
    if (!key) return null

    const { result, error } = await useGet<any>(
      `/seller/blog/${encodeURIComponent(key)}`,
      { headers: { 'no-error': true }, server: false },
    )
    if (error || !result?.id) return null

    const post = fromApiPost(result)
    const index = items.value.findIndex(p => p.id === post.id)
    if (index === -1) items.value = [post, ...items.value]
    else {
      const copy = [...items.value]
      copy[index] = post
      items.value = copy
    }
    return post
  }

  function createPost(form: SellerBlogFormValues) {
    const id = form.id.trim()
    if (getById(id)) {
      return { ok: false as const, error: 'شناسه مطلب تکراری است' }
    }
    const next = formToSellerBlogPost(form)
    if (!next.content.length) {
      return { ok: false as const, error: 'متن مطلب الزامی است' }
    }
    items.value = [next, ...items.value]
    return { ok: true as const, post: next }
  }

  function updatePost(id: string, form: SellerBlogFormValues) {
    const index = items.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'مطلب پیدا نشد' }
    }
    const previous = items.value[index]!
    const next = formToSellerBlogPost({ ...form, id: previous.id }, previous)
    if (!next.content.length) {
      return { ok: false as const, error: 'متن مطلب الزامی است' }
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, post: next }
  }

  function deletePost(id: string) {
    if (!items.value.some(p => p.id === id)) {
      return { ok: false as const, error: 'مطلب پیدا نشد' }
    }
    items.value = items.value.filter(p => p.id !== id)
    return { ok: true as const }
  }

  function setActive(id: string, active: boolean) {
    return setStatus(id, active ? 'published' : 'draft')
  }

  function setStatus(id: string, status: SellerBlogStatus) {
    const index = items.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'مطلب پیدا نشد' }
    }
    const previous = items.value[index]!
    const now = new Date().toISOString()
    const copy = [...items.value]
    copy[index] = {
      ...previous,
      status,
      active: status === 'published',
      publishedAt: status === 'published' ? (previous.publishedAt || now) : previous.publishedAt,
      updatedAt: now,
    }
    items.value = copy
    return { ok: true as const, post: copy[index]! }
  }

  function asStaticList(list?: SellerBlogPost[]): StaticBlogPost[] {
    return (list ?? publishedPosts.value).map(toStaticBlogPost)
  }

  function relatedForCategory(categoryId: string, limit = 4): StaticBlogPost[] {
    const list = asStaticList()
    if (!list.length) return []
    const specific = list.filter(p => p.relatedCategories.includes(categoryId))
    const general = list.filter(p => !p.relatedCategories.length)
    const rest = list.filter(
      p => !p.relatedCategories.includes(categoryId) && p.relatedCategories.length > 0,
    )
    const seen = new Set<string>()
    const result: StaticBlogPost[] = []
    for (const post of [...specific, ...general, ...rest]) {
      if (seen.has(post.id)) continue
      seen.add(post.id)
      result.push(post)
      if (result.length >= limit) break
    }
    return result
  }

  function morePosts(currentId: string, limit = 3): StaticBlogPost[] {
    const list = asStaticList()
    if (!list.length) return []
    const current = list.find(p => p.id === currentId)
    if (!current) return list.filter(p => p.id !== currentId).slice(0, limit)

    const fromRelated = current.relatedCategories.flatMap(catId =>
      relatedForCategory(catId, limit + 1),
    )
    const seen = new Set<string>([currentId])
    const result: StaticBlogPost[] = []
    for (const post of [...fromRelated, ...list]) {
      if (seen.has(post.id)) continue
      seen.add(post.id)
      result.push(post)
      if (result.length >= limit) break
    }
    return result
  }

  function resetToDefaults() {
    items.value = clonePosts(buildDefaultSellerBlogPosts())
    loaded.value = true
  }

  return {
    posts,
    items,
    publishedPosts,
    loaded,
    pending,
    ensureLoaded,
    ensureSeeded,
    getById,
    getPublishedById,
    getByIdForPreview,
    fetchPreviewById,
    createPost,
    updatePost,
    deletePost,
    setActive,
    setStatus,
    asStaticList,
    relatedForCategory,
    morePosts,
    resetToDefaults,
  }
}
