import {
  buildDefaultSellerBlogPosts,
  formToSellerBlogPost,
  normalizeBlogPost,
  toStaticBlogPost,
  type SellerBlogFormValues,
  type SellerBlogPost,
} from '~/data/seller-blog'
import {
  getMoreBlogPosts as getMoreFromStatic,
  getRelatedBlogPosts as getRelatedFromStatic,
  type StaticBlogPost,
} from '~/data/static-pages'

function clonePosts(list: SellerBlogPost[]): SellerBlogPost[] {
  return JSON.parse(JSON.stringify(list)) as SellerBlogPost[]
}

function fromApiPost(post: StaticBlogPost, base?: SellerBlogPost): SellerBlogPost {
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

  return {
    ...normalized,
    popular: post.popular ?? base?.popular ?? normalized.popular,
    engagement: post.engagement ?? base?.engagement ?? normalized.engagement,
    active: post.active !== false,
    createdAt: base?.createdAt ?? normalized.createdAt,
    updatedAt: base?.updatedAt ?? normalized.updatedAt,
  }
}

export function useBlog() {
  const items = useState<SellerBlogPost[]>('site-blog-posts', () => [])
  const loaded = useState('site-blog-loaded', () => false)
  const pending = useState('site-blog-pending', () => false)

  const posts = computed(() => items.value)

  const publishedPosts = computed(() =>
    items.value.filter(p => p.active !== false),
  )

  async function ensureLoaded(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) return items.value
    if (pending.value && !options?.force) return items.value

    pending.value = true
    try {
      const { result } = await useGet<StaticBlogPost[]>('/blog', {
        headers: { 'no-error': true },
      })
      if (Array.isArray(result) && result.length) {
        const defaults = buildDefaultSellerBlogPosts()
        const byId = new Map(defaults.map(p => [p.id, p]))
        items.value = result.map(post => fromApiPost(post, byId.get(post.id)))
      }
      else {
        items.value = buildDefaultSellerBlogPosts()
      }
      loaded.value = true
    }
    catch {
      items.value = buildDefaultSellerBlogPosts()
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
    if (!post || post.active === false) return undefined
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
    const index = items.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'مطلب پیدا نشد' }
    }
    const copy = [...items.value]
    copy[index] = {
      ...copy[index]!,
      active,
      updatedAt: new Date().toISOString(),
    }
    items.value = copy
    return { ok: true as const, post: copy[index]! }
  }

  function asStaticList(list?: SellerBlogPost[]): StaticBlogPost[] {
    return (list ?? publishedPosts.value).map(toStaticBlogPost)
  }

  function relatedForCategory(categoryId: string, limit = 4): StaticBlogPost[] {
    const list = asStaticList()
    if (!list.length) return getRelatedFromStatic(categoryId, limit)
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
    if (!list.length) return getMoreFromStatic(currentId, limit)
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
    createPost,
    updatePost,
    deletePost,
    setActive,
    asStaticList,
    relatedForCategory,
    morePosts,
    resetToDefaults,
  }
}
