import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import { blogPosts, type StaticBlogPost } from '~/data/static-pages'

export type SellerBlogStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type SellerBlogPost = StaticBlogPost & {
  popular: boolean
  engagement: number
  active: boolean
  createdAt: string | null
  updatedAt: string | null
  status: SellerBlogStatus
  publishedAt: string | null
  scheduledAt: string | null
  featured: boolean
  imageAlt: string
  tags: string[]
  relatedPostIds: string[]
  seo: SeoMeta
}

export type SellerBlogFormValues = {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  author: string
  image: string
  imageAlt: string
  relatedCategories: string[]
  /** HTML غنی از ادیتور (تیتر، لیست، لینک، …) */
  contentText: string
  highlights: string[]
  popular: boolean
  featured: boolean
  engagement: string
  active: boolean
  status: SellerBlogStatus
  publishedAt: string
  scheduledAt: string
  tags: string[]
  relatedPostIds: string[]
  seo: SeoMeta
}

export type BlogCategoryChip = {
  id: string
  label: string
  icon: string
  subtitle: string
}

/** دسته‌های محتوایی بلاگ (نه دسته محصول) */
export const blogCategoryChips: BlogCategoryChip[] = [
  {
    id: 'راهنمای خرید',
    label: 'راهنمای خرید',
    icon: 'i-tabler-shopping-bag',
    subtitle: 'قبل از خرید بخوانید',
  },
  {
    id: 'بررسی محصول',
    label: 'بررسی محصول',
    icon: 'i-tabler-device-desktop-analytics',
    subtitle: 'مقایسه و نقد تخصصی',
  },
  {
    id: 'آموزش',
    label: 'آموزش',
    icon: 'i-tabler-school',
    subtitle: 'نکات کاربردی گجت‌ها',
  },
  {
    id: 'اخبار',
    label: 'اخبار',
    icon: 'i-tabler-news',
    subtitle: 'ترندها و بازار',
  },
]

export const blogPostIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const blogPageSize = 8

export const sellerBlogStatusMeta: Record<
  SellerBlogStatus,
  { label: string, color: 'neutral' | 'info' | 'success' | 'warning' }
> = {
  draft: { label: 'پیش‌نویس', color: 'neutral' },
  scheduled: { label: 'زمان‌بندی‌شده', color: 'info' },
  published: { label: 'منتشر شده', color: 'success' },
  archived: { label: 'بایگانی', color: 'warning' },
}

const seedEngagement: Record<string, { popular?: boolean, engagement: number }> = {
  '1': { popular: true, engagement: 128 },
  '2': { engagement: 64 },
  '3': { popular: true, engagement: 95 },
  '4': { engagement: 42 },
  '5': { popular: true, engagement: 110 },
  '6': { engagement: 38 },
  '7': { engagement: 76 },
  '8': { engagement: 54 },
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

export function isEmptyHtml(html: string): boolean {
  return !html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** محتوای ذخیره‌شده (آرایه پاراگراف یا یک سند HTML) → HTML ادیتور/نمایش */
export function contentToHtml(content: string[]): string {
  if (!content.length) return ''
  if (content.length === 1 && looksLikeHtml(content[0]!)) return content[0]!
  if (content.some(looksLikeHtml)) return content.join('')
  return content.map(p => `<p>${escapeHtml(p)}</p>`).join('')
}

export function contentToText(content: string[]): string {
  if (!content.length) return ''
  if (content.some(looksLikeHtml)) {
    return contentToHtml(content)
      .replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
  return content.join('\n\n')
}

export function textToContent(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (looksLikeHtml(trimmed)) {
    if (isEmptyHtml(trimmed)) return []
    return [trimmed]
  }
  return trimmed
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
}

/** حذف تگ‌های خطرناک قبل از v-html در استورفرانت */
export function sanitizeBlogHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export function isRichBlogContent(content: string[]): boolean {
  return content.some(looksLikeHtml)
}

export function deriveBlogActive(status: SellerBlogStatus, scheduledAt?: string | null, now = Date.now()): boolean {
  if (status === 'published') return true
  if (status === 'scheduled' && scheduledAt) {
    const t = Date.parse(scheduledAt)
    return !Number.isNaN(t) && t <= now
  }
  return false
}

export function normalizeBlogStatus(post: Partial<SellerBlogPost> & { active?: boolean }): SellerBlogStatus {
  if (post.status) return post.status
  if (post.active === false) return 'draft'
  return 'published'
}

export function normalizeBlogPost(post: StaticBlogPost): SellerBlogPost {
  const extras = seedEngagement[post.id]
  const now = new Date().toISOString()
  const status = normalizeBlogStatus(post as SellerBlogPost)
  const featured = post.popular ?? extras?.popular ?? false
  return {
    ...post,
    relatedCategories: [...(post.relatedCategories ?? [])],
    content: [...(post.content ?? [])],
    highlights: post.highlights ? [...post.highlights] : undefined,
    popular: featured,
    engagement: post.engagement ?? extras?.engagement ?? 0,
    active: deriveBlogActive(status, (post as SellerBlogPost).scheduledAt),
    createdAt: now,
    updatedAt: now,
    status,
    publishedAt: status === 'published' ? (post.date || now) : null,
    scheduledAt: (post as SellerBlogPost).scheduledAt ?? null,
    featured,
    imageAlt: (post as SellerBlogPost).imageAlt || post.title || '',
    tags: [...((post as SellerBlogPost).tags ?? [])],
    relatedPostIds: [...((post as SellerBlogPost).relatedPostIds ?? [])],
    seo: { ...emptySeoMeta(), ...((post as SellerBlogPost).seo || {}) },
  }
}

export function toStaticBlogPost(post: SellerBlogPost): StaticBlogPost {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    image: post.image,
    relatedCategories: [...post.relatedCategories],
    content: [...post.content],
    highlights: post.highlights?.length ? [...post.highlights] : undefined,
    popular: post.featured || post.popular,
    engagement: post.engagement,
    active: deriveBlogActive(post.status, post.scheduledAt),
  }
}

export function buildDefaultSellerBlogPosts(): SellerBlogPost[] {
  return blogPosts.map(normalizeBlogPost)
}

export function emptyBlogForm(): SellerBlogFormValues {
  return {
    id: '',
    title: '',
    excerpt: '',
    date: '',
    category: blogCategoryChips[0]?.id ?? '',
    readTime: '',
    author: 'تیم دیجی‌شاپ',
    image: '',
    imageAlt: '',
    relatedCategories: [],
    contentText: '',
    highlights: [''],
    popular: false,
    featured: false,
    engagement: '0',
    active: false,
    status: 'draft',
    publishedAt: '',
    scheduledAt: '',
    tags: [],
    relatedPostIds: [],
    seo: emptySeoMeta(),
  }
}

export function toBlogForm(post: SellerBlogPost): SellerBlogFormValues {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    image: post.image,
    imageAlt: post.imageAlt || '',
    relatedCategories: [...post.relatedCategories],
    contentText: contentToHtml(post.content),
    highlights: post.highlights?.length ? [...post.highlights] : [''],
    popular: post.popular,
    featured: post.featured,
    engagement: String(post.engagement ?? 0),
    active: post.active,
    status: post.status,
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
    scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '',
    tags: [...post.tags],
    relatedPostIds: [...post.relatedPostIds],
    seo: { ...emptySeoMeta(), ...post.seo },
  }
}

export function formToSellerBlogPost(
  form: SellerBlogFormValues,
  previous?: SellerBlogPost | null,
): SellerBlogPost {
  const now = new Date().toISOString()
  const engagement = Number.parseInt(form.engagement.replace(/\D/g, ''), 10)
  const highlights = form.highlights.map(h => h.trim()).filter(Boolean)
  let status = form.status
  if (status === 'scheduled' && form.scheduledAt) {
    const t = Date.parse(form.scheduledAt)
    if (!Number.isNaN(t) && t <= Date.now()) status = 'published'
  }
  const publishedAt = status === 'published'
    ? (form.publishedAt.trim() ? new Date(form.publishedAt).toISOString() : (previous?.publishedAt || now))
    : null
  const scheduledAt = status === 'scheduled' && form.scheduledAt.trim()
    ? new Date(form.scheduledAt).toISOString()
    : null

  const seo = { ...emptySeoMeta(), ...form.seo }
  if (!seo.metaTitle.trim()) seo.metaTitle = form.title.trim().slice(0, 60)
  if (!seo.metaDescription.trim()) seo.metaDescription = form.excerpt.trim().slice(0, 160)
  if (!seo.ogImage.trim() && form.image.trim()) seo.ogImage = form.image.trim()
  if (!seo.twitterImage.trim()) seo.twitterImage = seo.ogImage
  if (!seo.ogTitle.trim()) seo.ogTitle = seo.metaTitle
  if (!seo.ogDescription.trim()) seo.ogDescription = seo.metaDescription
  // canonical خالی می‌ماند تا در صفحه عمومی از siteUrl + /blog/:id ساخته شود

  return {
    id: form.id.trim(),
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    date: form.date.trim() || (publishedAt ? publishedAt.slice(0, 10) : ''),
    category: form.category.trim(),
    readTime: form.readTime.trim(),
    author: form.author.trim(),
    image: form.image.trim(),
    relatedCategories: [...form.relatedCategories],
    content: textToContent(form.contentText),
    highlights: highlights.length ? highlights : undefined,
    popular: form.featured || form.popular,
    engagement: Number.isFinite(engagement) ? engagement : 0,
    active: deriveBlogActive(status, scheduledAt),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    status,
    publishedAt,
    scheduledAt,
    featured: form.featured,
    imageAlt: form.imageAlt.trim() || form.title.trim(),
    tags: [...form.tags],
    relatedPostIds: [...form.relatedPostIds],
    seo,
  }
}

export function collectBlogCategories(posts: Pick<StaticBlogPost, 'category'>[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const chip of blogCategoryChips) {
    seen.add(chip.id)
    result.push(chip.id)
  }
  for (const post of posts) {
    const cat = post.category?.trim()
    if (!cat || seen.has(cat)) continue
    seen.add(cat)
    result.push(cat)
  }
  return result
}

export function isBlogPostPubliclyVisible(post: SellerBlogPost, now = Date.now()): boolean {
  if (post.status === 'archived' || post.status === 'draft') return false
  if (post.status === 'scheduled') {
    if (!post.scheduledAt) return false
    const t = Date.parse(post.scheduledAt)
    return !Number.isNaN(t) && t <= now
  }
  return post.status === 'published' || post.active !== false
}
