import { emptySeoMeta } from '~/data/seo'
import {
  formToSellerBlogPost,
  normalizeBlogPost,
  type SellerBlogFormValues,
  type SellerBlogPost,
  type SellerBlogStatus,
} from '~/data/seller-blog'
import type { StaticBlogPost } from '~/data/static-pages'

export type SellerBlogQuery = {
  q?: string
  status?: string
  category?: string
  author?: string
  featured?: boolean
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerBlogPage = {
  items: SellerBlogPost[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
  authors?: string[]
  categories?: string[]
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toPost(raw: any): SellerBlogPost {
  const content = Array.isArray(raw?.content)
    ? raw.content.map(String)
    : typeof raw?.content === 'string'
      ? [raw.content]
      : []

  const base = normalizeBlogPost({
    id: String(raw?.id || ''),
    title: String(raw?.title || ''),
    excerpt: String(raw?.excerpt || ''),
    date: String(raw?.date || ''),
    category: String(raw?.category || ''),
    readTime: String(raw?.readTime || ''),
    author: String(raw?.author || ''),
    image: String(raw?.image || ''),
    relatedCategories: Array.isArray(raw?.relatedCategories) ? raw.relatedCategories.map(String) : [],
    content,
    highlights: Array.isArray(raw?.highlights) ? raw.highlights.map(String) : undefined,
    popular: Boolean(raw?.popular ?? raw?.featured),
    engagement: Math.max(0, Math.round(Number(raw?.engagement) || 0)),
    active: Boolean(raw?.active),
  } as StaticBlogPost)

  const status = (['draft', 'scheduled', 'published', 'archived'].includes(raw?.status)
    ? raw.status
    : base.status) as SellerBlogStatus

  return {
    ...base,
    popular: Boolean(raw?.popular ?? raw?.featured ?? base.popular),
    featured: Boolean(raw?.featured ?? raw?.popular ?? base.featured),
    engagement: Math.max(0, Math.round(Number(raw?.engagement) || 0)),
    active: Boolean(raw?.active),
    status,
    publishedAt: raw?.publishedAt ? String(raw.publishedAt) : null,
    scheduledAt: raw?.scheduledAt ? String(raw.scheduledAt) : null,
    imageAlt: String(raw?.imageAlt || raw?.title || ''),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    relatedPostIds: Array.isArray(raw?.relatedPostIds) ? raw.relatedPostIds.map(String) : [],
    seo: { ...emptySeoMeta(), ...(raw?.seo || {}) },
    createdAt: raw?.createdAt ? String(raw.createdAt) : base.createdAt,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : base.updatedAt,
  }
}

function formToPayload(form: SellerBlogFormValues) {
  const post = formToSellerBlogPost(form)
  return {
    id: post.id || undefined,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date || undefined,
    category: post.category,
    readTime: post.readTime || undefined,
    author: post.author,
    image: post.image,
    imageAlt: post.imageAlt || undefined,
    relatedCategories: post.relatedCategories,
    content: post.content,
    highlights: post.highlights,
    popular: post.popular,
    featured: post.featured,
    engagement: post.engagement,
    active: post.active,
    status: post.status,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    tags: post.tags,
    relatedPostIds: post.relatedPostIds,
    seo: post.seo,
  }
}

export function useSellerBlog() {
  const items = useState<SellerBlogPost[]>('seller-blog-items', () => [])
  const listMeta = useState('seller-blog-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 10,
    statusCounts: {
      all: 0,
      draft: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
    } as Record<string, number>,
    authors: [] as string[],
    categories: [] as string[],
  }))
  const seeded = useState('seller-blog-seeded', () => false)
  const pending = useState('seller-blog-pending', () => false)

  const posts = computed(() => items.value)

  function upsertLocal(post: SellerBlogPost) {
    const index = items.value.findIndex(p => p.id === post.id)
    if (index === -1) items.value = [post, ...items.value]
    else {
      const copy = [...items.value]
      copy[index] = post
      items.value = copy
    }
  }

  function getById(id: string) {
    return items.value.find(p => p.id === id)
  }

  async function fetchList(query?: SellerBlogQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.category && query.category !== 'all') params.category = query.category
      if (query?.author && query.author !== 'all') params.author = query.author
      if (query?.featured) params.featured = true
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 10
      }

      const { result, error } = await useGet<SellerBlogPage | SellerBlogPost[]>(
        '/seller/blog',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'blog-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toPost)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            draft: items.value.filter(p => p.status === 'draft').length,
            scheduled: items.value.filter(p => p.status === 'scheduled').length,
            published: items.value.filter(p => p.status === 'published').length,
            archived: items.value.filter(p => p.status === 'archived').length,
          },
          authors: [...new Set(items.value.map(p => p.author).filter(Boolean))],
          categories: [...new Set(items.value.map(p => p.category).filter(Boolean))],
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toPost) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 10,
          statusCounts: result.statusCounts || listMeta.value.statusCounts,
          authors: Array.isArray(result.authors) ? result.authors : [],
          categories: Array.isArray(result.categories) ? result.categories : [],
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return items.value
    await fetchList({ page: 1, pageSize: 100 })
    return items.value
  }

  async function fetchById(id: string, options?: { force?: boolean }) {
    const cached = getById(id)
    if (cached && !options?.force) {
      return { ok: true as const, post: cached, error: null as null }
    }
    const { result, error } = await useGet<any>(
      `/seller/blog/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, post: null as SellerBlogPost | null, error }
    }
    const post = toPost(result)
    upsertLocal(post)
    seeded.value = true
    return { ok: true as const, post, error: null as null }
  }

  async function createPost(form: SellerBlogFormValues) {
    const { result, error } = await usePost<any>('/seller/blog', formToPayload(form), {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, post: null as SellerBlogPost | null, error: apiErrorMessage(error, 'ثبت مطلب ناموفق بود') }
    }
    const post = toPost(result)
    upsertLocal(post)
    return { ok: true as const, post, error: null as null }
  }

  async function updatePost(id: string, form: SellerBlogFormValues) {
    const { result, error } = await usePut<any>(
      `/seller/blog/${encodeURIComponent(id)}`,
      formToPayload({ ...form, id }),
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, post: null as SellerBlogPost | null, error: apiErrorMessage(error, 'ذخیره مطلب ناموفق بود') }
    }
    const post = toPost(result)
    upsertLocal(post)
    return { ok: true as const, post, error: null as null }
  }

  async function deletePost(id: string) {
    const { error } = await useDelete(`/seller/blog/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف مطلب ناموفق بود') }
    }
    items.value = items.value.filter(p => p.id !== id)
    return { ok: true as const, error: null as null }
  }

  async function setStatus(id: string, status: SellerBlogStatus) {
    const { result, error } = await usePatch<any>(
      `/seller/blog/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, post: null as SellerBlogPost | null, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const post = toPost(result)
    upsertLocal(post)
    return { ok: true as const, post, error: null as null }
  }

  return {
    posts,
    items,
    listMeta,
    pending,
    seeded,
    fetchList,
    ensureLoaded,
    getById,
    fetchById,
    createPost,
    updatePost,
    deletePost,
    setStatus,
  }
}
