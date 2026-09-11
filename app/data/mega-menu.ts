import { toSearchRoute } from '~/data/categories'

export type MegaMenuStatus = 'active' | 'inactive'
export type MegaMenuItemType = 'category' | 'filter' | 'link'

export type MegaMenuCategoryRef = {
  id: string
  name: string
  icon: string
  image?: string | null
}

/** Matches backend MegaMenuFilterDefinition / CatalogFilterInput. */
export type MegaMenuFilterDefinition = {
  category?: string
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  attrs?: Record<string, string[]>
  q?: string
  onlyDiscount?: boolean
  onlyInStock?: boolean
  fastDelivery?: boolean
  minRating?: number
}

export type PublicMegaMenuItem = {
  id: string
  title: string
  slug?: string | null
  type: MegaMenuItemType
  sortOrder: number
  href?: string
  category?: MegaMenuCategoryRef
  filter?: MegaMenuFilterDefinition
  url?: string
}

export type PublicMegaMenuSection = {
  id: string
  title: string
  slug?: string | null
  sortOrder: number
  href?: string
  category?: MegaMenuCategoryRef
  items: PublicMegaMenuItem[]
  sections: PublicMegaMenuSection[]
}

export type PublicMegaMenu = {
  id: string
  title: string
  slug: string
  icon: string | null
  sortOrder: number
  href?: string
  sections: PublicMegaMenuSection[]
}

export type SellerMegaMenuSummary = {
  id: string
  title: string
  slug: string
  icon: string | null
  sortOrder: number
  status: MegaMenuStatus
  sectionCount: number
  createdAt: string | null
  updatedAt: string | null
}

export type SellerMegaMenuItem = {
  id: string
  sectionId: string
  title: string
  slug: string | null
  type: MegaMenuItemType
  categoryId: string | null
  category: { id: string, name: string, icon: string } | null
  filter: MegaMenuFilterDefinition | null
  url: string | null
  sortOrder: number
  status: MegaMenuStatus
  createdAt: string | null
  updatedAt: string | null
}

export type SellerMegaMenuSection = {
  id: string
  menuId: string
  parentId: string | null
  title: string
  slug: string | null
  categoryId: string | null
  category: { id: string, name: string, icon: string } | null
  sortOrder: number
  status: MegaMenuStatus
  itemCount: number
  childCount: number
  createdAt: string | null
  updatedAt: string | null
  items: SellerMegaMenuItem[]
  sections: SellerMegaMenuSection[]
}

export type SellerMegaMenuTree = SellerMegaMenuSummary & {
  sections: SellerMegaMenuSection[]
}

export type SellerMegaMenuFormValues = {
  title: string
  slug: string
  icon: string
  sortOrder: number
  status: MegaMenuStatus
}

export function emptyMegaMenuForm(): SellerMegaMenuFormValues {
  return {
    title: '',
    slug: '',
    icon: '',
    sortOrder: 0,
    status: 'active',
  }
}

export function megaMenuItemTypeLabel(type: MegaMenuItemType) {
  if (type === 'category') return 'دسته‌بندی'
  if (type === 'filter') return 'فیلتر'
  return 'لینک'
}

export function isMegaMenuFilterEmpty(filter: MegaMenuFilterDefinition | null | undefined) {
  if (!filter) return true
  if (filter.category?.trim()) return false
  if (filter.brands?.length) return false
  if ((filter.minPrice || 0) > 0) return false
  if ((filter.maxPrice || 0) > 0) return false
  if (filter.attrs && Object.keys(filter.attrs).length) return false
  if (filter.q?.trim()) return false
  if (filter.onlyDiscount || filter.onlyInStock || filter.fastDelivery) return false
  if ((filter.minRating || 0) > 0) return false
  return true
}

export function compactMegaMenuFilter(filter: MegaMenuFilterDefinition): MegaMenuFilterDefinition | null {
  const next: MegaMenuFilterDefinition = {}
  const category = filter.category?.trim()
  if (category) next.category = category
  const brands = (filter.brands || []).map(b => String(b).trim()).filter(Boolean)
  if (brands.length) next.brands = brands
  const minPrice = Number(filter.minPrice || 0) || 0
  const maxPrice = Number(filter.maxPrice || 0) || 0
  if (minPrice > 0) next.minPrice = minPrice
  if (maxPrice > 0) next.maxPrice = maxPrice
  if (filter.attrs) {
    const attrs: Record<string, string[]> = {}
    for (const [slug, values] of Object.entries(filter.attrs)) {
      const list = (values || []).map(v => String(v).trim()).filter(Boolean)
      if (slug.trim() && list.length) attrs[slug.trim()] = list
    }
    if (Object.keys(attrs).length) next.attrs = attrs
  }
  const q = filter.q?.trim()
  if (q) next.q = q
  if (filter.onlyDiscount) next.onlyDiscount = true
  if (filter.onlyInStock) next.onlyInStock = true
  if (filter.fastDelivery) next.fastDelivery = true
  const minRating = Number(filter.minRating || 0) || 0
  if (minRating > 0) next.minRating = minRating
  return Object.keys(next).length ? next : null
}

export function megaMenuFilterToSearchRoute(filter: MegaMenuFilterDefinition) {
  return toSearchRoute({
    q: filter.q,
    category: filter.category,
    brands: filter.brands,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    attrs: filter.attrs,
  })
}

export type MegaMenuRoute = string | { path: string, query?: Record<string, string> }

export function isExternalMegaHref(to: MegaMenuRoute | null | undefined): boolean {
  if (!to || typeof to !== 'string') return false
  return /^https?:\/\//i.test(to) || to.startsWith('//')
}

/**
 * Resolve item → NuxtLink target.
 * Prefer API SEO `href` (`/category/...`); fall back to search / external url.
 */
export function megaMenuItemToRoute(
  item: Pick<PublicMegaMenuItem, 'type' | 'category' | 'filter' | 'url' | 'href'>,
): MegaMenuRoute | null {
  if (item.type === 'link' && item.url?.trim()) {
    return item.url.trim()
  }
  if (item.href?.trim()) {
    return item.href.trim()
  }
  if (item.type === 'category' && item.category?.id) {
    return toSearchRoute({ category: item.category.id })
  }
  if (item.type === 'filter' && item.filter) {
    return megaMenuFilterToSearchRoute(item.filter)
  }
  return null
}

/** Root menu column — API href, else first section, else linked category search. */
export function megaMenuRootToRoute(menu: PublicMegaMenu): MegaMenuRoute | null {
  if (menu.href?.trim()) return menu.href.trim()
  const firstHref = menu.sections[0]?.href?.trim()
  if (firstHref) return firstHref
  const catId = menu.sections.find(s => s.category?.id)?.category?.id
  if (catId) return toSearchRoute({ category: catId })
  return null
}

/** Section column / group title — API href first, else category search. */
export function megaMenuSectionToRoute(section: PublicMegaMenuSection): MegaMenuRoute | null {
  if (section.href?.trim()) return section.href.trim()
  if (section.category?.id) return toSearchRoute({ category: section.category.id })
  return null
}

export type MegaMenuResolvePayload = {
  path: string
  title: string
  type: 'menu' | 'section' | 'item'
  category: string | null
  filter: MegaMenuFilterDefinition | null
  href: string
}

export function flattenMegaMenuSectionIds(sections: SellerMegaMenuSection[]): string[] {
  const ids: string[] = []
  function walk(list: SellerMegaMenuSection[]) {
    for (const section of list) {
      ids.push(section.id)
      if (section.sections.length) walk(section.sections)
    }
  }
  walk(sections)
  return ids
}

export function collectMegaMenuItemIds(section: SellerMegaMenuSection): string[] {
  return section.items.map(item => item.id)
}

export function moveIdInList(ids: string[], id: string, dir: -1 | 1): string[] | null {
  const index = ids.indexOf(id)
  const next = index + dir
  if (index < 0 || next < 0 || next >= ids.length) return null
  const copy = [...ids]
  const current = copy[index]!
  copy[index] = copy[next]!
  copy[next] = current
  return copy
}
