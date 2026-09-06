import { slugifyLatin } from '~/data/seo'

export type SellerProductTag = {
  id: string
  name: string
  slug: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type SellerProductTagForm = {
  id: string
  name: string
  slug: string
}

export function emptyProductTagForm(): SellerProductTagForm {
  return { id: '', name: '', slug: '' }
}

export function toProductTagForm(tag: SellerProductTag): SellerProductTagForm {
  return { id: tag.id, name: tag.name, slug: tag.slug }
}

export function formToProductTag(
  form: SellerProductTagForm,
  previous?: SellerProductTag,
): SellerProductTag {
  const now = new Date().toISOString()
  const slug = form.slug.trim().toLowerCase() || slugifyLatin(form.name) || form.id || 'tag'
  return {
    id: form.id.trim() || previous?.id || `ptag-${slug}`,
    name: form.name.trim(),
    slug,
    usageCount: previous?.usageCount ?? 0,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function buildDefaultProductTags(): SellerProductTag[] {
  const now = new Date().toISOString()
  const seeds = ['پرفروش', 'جدید', 'تخفیف‌دار', 'پیشنهادی', 'اصیل']
  return seeds.map((name, index) => ({
    id: `ptag-${index + 1}`,
    name,
    slug: slugifyLatin(name) || `tag-${index + 1}`,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }))
}
