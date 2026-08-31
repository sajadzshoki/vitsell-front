import type { Category, CategorySub } from '~/data/categories'
import type {
  CategoryPageMeta,
  CategorySuggestedItem,
} from '~/data/category-pages'
import {
  buildSuggestedItems,
  getCategoryImage,
  getCategoryPageMeta,
} from '~/data/category-pages'

export type SellerCategory = {
  id: string
  name: string
  icon: string
  image: string | null
  subs: CategorySub[]
  pageMeta: CategoryPageMeta | null
  suggested: CategorySuggestedItem[] | null
  createdAt: string | null
  updatedAt: string | null
}

export type SellerCategoryFormValues = {
  id: string
  name: string
  icon: string
  image: string
  subs: CategorySub[]
  pageMeta: CategoryPageMeta
  suggested: CategorySuggestedItem[]
}

export const categoryIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyPageMeta(): CategoryPageMeta {
  return {
    hero: {
      image: '',
      eyebrow: '',
      title: '',
      subtitle: '',
    },
    seo: {
      heading: '',
      paragraphs: [''],
    },
  }
}

export function emptySuggestedItem(): CategorySuggestedItem {
  return {
    id: '',
    title: '',
    image: '',
    query: '',
  }
}

export function emptySubGroup(): CategorySub {
  return {
    name: '',
    items: [],
    image: null,
  }
}

export function emptyCategoryForm(): SellerCategoryFormValues {
  return {
    id: '',
    name: '',
    icon: 'category',
    image: '',
    subs: [],
    pageMeta: emptyPageMeta(),
    suggested: [],
  }
}

export function toSellerCategory(category: Category): SellerCategory {
  const image = category.image ?? null
  const fallbackImage = getCategoryImage(category.id, image)
  const pageMeta = getCategoryPageMeta(category.id)
  const suggested = buildSuggestedItems(category, fallbackImage)

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    image,
    subs: (category.subs ?? []).map(sub => ({
      name: sub.name,
      items: [...(sub.items ?? [])],
      image: sub.image ?? null,
    })),
    pageMeta,
    suggested,
    createdAt: null,
    updatedAt: null,
  }
}

export function toCategoryForm(category: SellerCategory): SellerCategoryFormValues {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon || 'category',
    image: category.image ?? '',
    subs: category.subs.map(sub => ({
      name: sub.name,
      items: [...sub.items],
      image: sub.image ?? null,
    })),
    pageMeta: category.pageMeta
      ? {
          hero: { ...category.pageMeta.hero },
          seo: {
            heading: category.pageMeta.seo.heading,
            paragraphs: [...category.pageMeta.seo.paragraphs],
          },
        }
      : emptyPageMeta(),
    suggested: (category.suggested ?? []).map(item => ({ ...item })),
  }
}

export function formToSellerCategory(
  form: SellerCategoryFormValues,
  previous?: SellerCategory | null,
): SellerCategory {
  const now = new Date().toISOString()
  const image = form.image.trim() || null
  const pageMeta = sanitizePageMeta(form.pageMeta)
  const suggested = sanitizeSuggested(form.suggested)

  return {
    id: form.id.trim(),
    name: form.name.trim(),
    icon: form.icon.trim() || 'category',
    image,
    subs: sanitizeSubs(form.subs),
    pageMeta,
    suggested: suggested.length ? suggested : null,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function sellerCategoryToListItem(category: SellerCategory): Category {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    image: category.image,
    subs: category.subs.map(sub => ({
      name: sub.name,
      items: [...sub.items],
      image: sub.image ?? null,
    })),
  }
}

function sanitizeSubs(subs: CategorySub[]): CategorySub[] {
  return subs
    .map(sub => ({
      name: sub.name.trim(),
      items: sub.items.map(item => item.trim()).filter(Boolean),
      image: sub.image?.trim() || null,
    }))
    .filter(sub => sub.name.length > 0)
}

function sanitizePageMeta(meta: CategoryPageMeta): CategoryPageMeta | null {
  const hero = {
    image: meta.hero.image.trim(),
    eyebrow: meta.hero.eyebrow.trim(),
    title: meta.hero.title.trim(),
    subtitle: meta.hero.subtitle.trim(),
  }
  const paragraphs = meta.seo.paragraphs.map(p => p.trim()).filter(Boolean)
  const heading = meta.seo.heading.trim()

  if (!hero.image && !hero.eyebrow && !hero.title && !hero.subtitle && !heading && !paragraphs.length) {
    return null
  }

  return {
    hero,
    seo: {
      heading,
      paragraphs: paragraphs.length ? paragraphs : [''],
    },
  }
}

function sanitizeSuggested(items: CategorySuggestedItem[]): CategorySuggestedItem[] {
  return items
    .map(item => ({
      id: item.id.trim(),
      title: item.title.trim(),
      image: item.image.trim(),
      query: item.query.trim(),
    }))
    .filter(item => item.id && item.title && item.query)
}

export function countSubItems(subs: CategorySub[]) {
  return subs.reduce((sum, sub) => sum + (sub.items?.length ?? 0), 0)
}

export function resolveCategoryIconName(icon: string) {
  const raw = icon.trim()
  if (!raw) return 'i-tabler-category'
  if (raw.startsWith('i-')) return raw
  return `i-tabler-${raw}`
}
