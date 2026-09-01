import { emptySeoMeta, isValidLatinSlug, slugifyLatin, type SeoMeta } from '~/data/seo'
import { blogCategoryChips } from '~/data/seller-blog'

export type SellerBlogTaxonomyStatus = 'active' | 'inactive'

export type SellerBlogCategory = {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  status: SellerBlogTaxonomyStatus
  sortOrder: number
  seo: SeoMeta
  createdAt: string
  updatedAt: string
}

export type SellerBlogTag = {
  id: string
  name: string
  slug: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type SellerBlogCategoryForm = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  status: SellerBlogTaxonomyStatus
  sortOrder: number
  seo: SeoMeta
}

export type SellerBlogTagForm = {
  id: string
  name: string
  slug: string
}

export function emptyBlogCategoryForm(): SellerBlogCategoryForm {
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'active',
    sortOrder: 100,
    seo: emptySeoMeta(),
  }
}

export function emptyBlogTagForm(): SellerBlogTagForm {
  return { id: '', name: '', slug: '' }
}

export function toBlogCategoryForm(c: SellerBlogCategory): SellerBlogCategoryForm {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image || '',
    status: c.status,
    sortOrder: c.sortOrder,
    seo: { ...emptySeoMeta(), ...c.seo },
  }
}

export function toBlogTagForm(t: SellerBlogTag): SellerBlogTagForm {
  return { id: t.id, name: t.name, slug: t.slug }
}

export function formToBlogCategory(form: SellerBlogCategoryForm, previous?: SellerBlogCategory): SellerBlogCategory {
  const now = new Date().toISOString()
  const slug = form.slug.trim().toLowerCase() || slugifyLatin(form.name) || form.id
  return {
    id: form.id.trim() || previous?.id || `bcat-${slug}`,
    name: form.name.trim(),
    slug,
    description: form.description.trim(),
    image: form.image.trim() || null,
    status: form.status,
    sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
    seo: { ...emptySeoMeta(), ...form.seo },
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function formToBlogTag(form: SellerBlogTagForm, previous?: SellerBlogTag): SellerBlogTag {
  const now = new Date().toISOString()
  const slug = form.slug.trim().toLowerCase() || slugifyLatin(form.name) || form.id
  return {
    id: form.id.trim() || previous?.id || `btag-${slug}`,
    name: form.name.trim(),
    slug,
    usageCount: previous?.usageCount ?? 0,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function buildDefaultBlogCategories(): SellerBlogCategory[] {
  const now = new Date().toISOString()
  return blogCategoryChips.map((chip, index) => ({
    id: `bcat-${index + 1}`,
    name: chip.label,
    slug: slugifyLatin(chip.id) || `cat-${index + 1}`,
    description: chip.subtitle,
    image: null,
    status: 'active' as const,
    sortOrder: (index + 1) * 10,
    seo: emptySeoMeta(),
    createdAt: now,
    updatedAt: now,
  }))
}

export function buildDefaultBlogTags(): SellerBlogTag[] {
  const now = new Date().toISOString()
  const seeds = ['موبایل', 'لپ‌تاپ', 'راهنما', 'نقد و بررسی', 'تخفیف']
  return seeds.map((name, index) => ({
    id: `btag-${index + 1}`,
    name,
    slug: slugifyLatin(name) || `tag-${index + 1}`,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }))
}

export { isValidLatinSlug, slugifyLatin }
