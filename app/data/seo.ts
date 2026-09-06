/**
 * Reusable SEO metadata for admin entities (products, categories, blog, pages, …).
 * Category pageMeta.seo (heading/paragraphs) remains for page body content;
 * SeoMeta is the indexable / Open Graph contract for future API fields.
 */

export type SeoRobots =
  | 'index,follow'
  | 'noindex,follow'
  | 'index,nofollow'
  | 'noindex,nofollow'

export type SeoMeta = {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  canonicalUrl: string
  robots: SeoRobots
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
}

export type SeoWarning = {
  key: string
  message: string
  severity: 'info' | 'warning'
}

export const seoRobotsOptions: { value: SeoRobots, label: string }[] = [
  { value: 'index,follow', label: 'index, follow' },
  { value: 'noindex,follow', label: 'noindex, follow' },
  { value: 'index,nofollow', label: 'index, nofollow' },
  { value: 'noindex,nofollow', label: 'noindex, nofollow' },
]

export const SEO_TITLE_SOFT_MAX = 60
export const SEO_DESC_SOFT_MAX = 160

/** Strip HTML tags for SERP / meta character counts. */
export function htmlToPlainText(value: string | null | undefined): string {
  const raw = String(value || '')
  if (!raw.trim()) return ''
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function emptySeoMeta(): SeoMeta {
  return {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    robots: 'index,follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
  }
}

export function sanitizeSeoMeta(meta: SeoMeta | null | undefined): SeoMeta | null {
  if (!meta) return null
  const next: SeoMeta = {
    metaTitle: meta.metaTitle.trim(),
    metaDescription: meta.metaDescription.trim(),
    metaKeywords: meta.metaKeywords.trim(),
    canonicalUrl: meta.canonicalUrl.trim(),
    robots: meta.robots || 'index,follow',
    ogTitle: meta.ogTitle.trim(),
    ogDescription: meta.ogDescription.trim(),
    ogImage: meta.ogImage.trim(),
    twitterTitle: meta.twitterTitle.trim(),
    twitterDescription: meta.twitterDescription.trim(),
    twitterImage: meta.twitterImage.trim(),
  }
  const hasAny = Object.entries(next).some(([key, value]) => {
    if (key === 'robots') return value !== 'index,follow'
    return Boolean(value)
  })
  return hasAny ? next : null
}

/** Seed SeoMeta from legacy category pageMeta.seo heading when migrating UI */
export function seoMetaFromCategoryHeading(heading: string, paragraphs: string[] = []): SeoMeta {
  const base = emptySeoMeta()
  base.metaTitle = heading.trim()
  base.metaDescription = paragraphs.map(p => p.trim()).filter(Boolean).join(' ').slice(0, 320)
  base.ogTitle = base.metaTitle
  base.ogDescription = base.metaDescription
  return base
}

export function joinSiteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function applyTitlePattern(pattern: string, title: string, siteName: string): string {
  const t = title.trim()
  const name = siteName.trim() || 'Digishop'
  if (!pattern.trim()) return t || name
  return pattern
    .replaceAll('{title}', t || name)
    .replaceAll('{site}', name)
    .trim()
}

export type ResolveSeoInput = {
  entity?: Partial<SeoMeta> | null
  defaults?: {
    titlePattern?: string
    siteName?: string
    siteUrl?: string
    defaultRobots?: SeoRobots
    defaultOgImage?: string
    twitterCard?: string
  }
  fallbackTitle?: string
  fallbackDescription?: string
  fallbackImage?: string
  path?: string
}

export type ResolvedSeo = {
  title: string
  description: string
  canonical: string
  robots: SeoRobots
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  keywords: string
  twitterCard: string
  noindex: boolean
}

export function resolveSeoMeta(input: ResolveSeoInput): ResolvedSeo {
  const entity = input.entity || {}
  const defaults = input.defaults || {}
  const siteName = defaults.siteName || 'Digishop'
  const siteUrl = defaults.siteUrl || ''
  const fallbackTitle = (input.fallbackTitle || '').trim()
  const fallbackDescription = (input.fallbackDescription || '').trim()
  const fallbackImage = (input.fallbackImage || defaults.defaultOgImage || '').trim()

  const title = htmlToPlainText(entity.metaTitle || '')
    || applyTitlePattern(defaults.titlePattern || '{title} | {site}', fallbackTitle, siteName)
  const description = htmlToPlainText(entity.metaDescription || '') || htmlToPlainText(fallbackDescription)
  const canonical = (entity.canonicalUrl || '').trim()
    || (siteUrl && input.path ? joinSiteUrl(siteUrl, input.path) : '')
  const robots = entity.robots || defaults.defaultRobots || 'index,follow'
  const ogTitle = htmlToPlainText(entity.ogTitle || '') || title
  const ogDescription = htmlToPlainText(entity.ogDescription || '') || description
  const ogImage = (entity.ogImage || '').trim() || fallbackImage
  const twitterTitle = htmlToPlainText(entity.twitterTitle || '') || ogTitle
  const twitterDescription = htmlToPlainText(entity.twitterDescription || '') || ogDescription
  const twitterImage = (entity.twitterImage || '').trim() || ogImage

  return {
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    keywords: (entity.metaKeywords || '').trim(),
    twitterCard: defaults.twitterCard || 'summary_large_image',
    noindex: robots.startsWith('noindex'),
  }
}

export function collectSeoWarnings(meta: SeoMeta, opts?: {
  previewTitle?: string
  previewDescription?: string
}): SeoWarning[] {
  const warnings: SeoWarning[] = []
  const title = htmlToPlainText(meta.metaTitle || opts?.previewTitle || '')
  const desc = htmlToPlainText(meta.metaDescription || opts?.previewDescription || '')
  if (!title) {
    warnings.push({ key: 'title', message: 'عنوان سئو خالی است — از عنوان پیش‌فرض استفاده می‌شود', severity: 'info' })
  }
  else if (title.length > SEO_TITLE_SOFT_MAX) {
    warnings.push({ key: 'title-long', message: `عنوان طولانی‌تر از ${SEO_TITLE_SOFT_MAX} کاراکتر است`, severity: 'warning' })
  }
  if (!desc) {
    warnings.push({ key: 'desc', message: 'توضیح متا خالی است', severity: 'info' })
  }
  else if (desc.length > SEO_DESC_SOFT_MAX) {
    warnings.push({ key: 'desc-long', message: `توضیح متا طولانی‌تر از ${SEO_DESC_SOFT_MAX} کاراکتر است`, severity: 'warning' })
  }
  if (!meta.ogImage.trim()) {
    warnings.push({ key: 'og-image', message: 'تصویر Open Graph تنظیم نشده', severity: 'info' })
  }
  if (!meta.canonicalUrl.trim()) {
    warnings.push({ key: 'canonical', message: 'کنونیکال خالی است — در صورت وجود آدرس سایت، خودکار ساخته می‌شود', severity: 'info' })
  }
  return warnings
}

export function slugifyLatin(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isValidLatinSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
