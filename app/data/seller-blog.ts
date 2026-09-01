import { blogPosts, type StaticBlogPost } from '~/data/static-pages'

export type SellerBlogPost = StaticBlogPost & {
  popular: boolean
  engagement: number
  active: boolean
  createdAt: string | null
  updatedAt: string | null
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
  relatedCategories: string[]
  /** پاراگراف‌ها با خط خالی جدا می‌شوند */
  contentText: string
  highlights: string[]
  popular: boolean
  engagement: string
  active: boolean
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

export const blogPageSize = 9

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

export function contentToText(content: string[]): string {
  return content.join('\n\n')
}

export function textToContent(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
}

export function normalizeBlogPost(post: StaticBlogPost): SellerBlogPost {
  const extras = seedEngagement[post.id]
  const now = new Date().toISOString()
  return {
    ...post,
    relatedCategories: [...(post.relatedCategories ?? [])],
    content: [...(post.content ?? [])],
    highlights: post.highlights ? [...post.highlights] : undefined,
    popular: post.popular ?? extras?.popular ?? false,
    engagement: post.engagement ?? extras?.engagement ?? 0,
    active: post.active !== false,
    createdAt: now,
    updatedAt: now,
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
    popular: post.popular,
    engagement: post.engagement,
    active: post.active,
  }
}

/** Seed اولیه پنل / استورفرانت (فرانت‌only) */
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
    relatedCategories: [],
    contentText: '',
    highlights: [''],
    popular: false,
    engagement: '0',
    active: true,
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
    relatedCategories: [...post.relatedCategories],
    contentText: contentToText(post.content),
    highlights: post.highlights?.length ? [...post.highlights] : [''],
    popular: post.popular,
    engagement: String(post.engagement ?? 0),
    active: post.active,
  }
}

export function formToSellerBlogPost(
  form: SellerBlogFormValues,
  previous?: SellerBlogPost | null,
): SellerBlogPost {
  const now = new Date().toISOString()
  const engagement = Number.parseInt(form.engagement.replace(/\D/g, ''), 10)
  const highlights = form.highlights.map(h => h.trim()).filter(Boolean)

  return {
    id: form.id.trim(),
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    date: form.date.trim(),
    category: form.category.trim(),
    readTime: form.readTime.trim(),
    author: form.author.trim(),
    image: form.image.trim(),
    relatedCategories: [...form.relatedCategories],
    content: textToContent(form.contentText),
    highlights: highlights.length ? highlights : undefined,
    popular: form.popular,
    engagement: Number.isFinite(engagement) ? engagement : 0,
    active: form.active,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
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
