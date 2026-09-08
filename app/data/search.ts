export type SearchSort =
  | 'relevant'
  | 'viewed'
  | 'bestselling'
  | 'newest'
  | 'fastest'
  | 'expensive'
  | 'cheapest'
  | 'bestrated'
  | 'discount'

export type SearchLayout = 'grid' | 'list'

export type SearchFilterAttributeValue = {
  id: string
  label: string
  value: string
  meta?: string
}

export type SearchFilterAttribute = {
  id: string
  name: string
  slug: string
  type: string
  values: SearchFilterAttributeValue[]
}

export type SearchFilters = {
  brands: string[]
  minPrice: number
  maxPrice: number
  onlyDiscount: boolean
  onlyInStock: boolean
  fastDelivery: boolean
  minRating: number
  /** attribute slug → selected values */
  attrs: Record<string, string[]>
}

export type SearchFacets = {
  minPrice: number
  maxPrice: number
  brands: string[]
  attributes: SearchFilterAttribute[]
}

export const SEARCH_PAGE_SIZE = 12
export const SEARCH_INFINITE_LOADS = 3
/** Fallback ceiling before facets load */
export const SEARCH_PRICE_MAX = 250_000_000

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  brands: [],
  minPrice: 0,
  maxPrice: SEARCH_PRICE_MAX,
  onlyDiscount: false,
  onlyInStock: false,
  fastDelivery: false,
  minRating: 0,
  attrs: {},
}

export const searchSortOptions: { id: SearchSort, label: string }[] = [
  { id: 'relevant', label: 'مرتبط‌ترین' },
  { id: 'viewed', label: 'پربازدیدترین' },
  { id: 'bestselling', label: 'پرفروش‌ترین' },
  { id: 'newest', label: 'جدیدترین' },
  { id: 'fastest', label: 'سریع‌ترین ارسال' },
  { id: 'expensive', label: 'گران‌ترین' },
  { id: 'cheapest', label: 'ارزان‌ترین' },
  { id: 'bestrated', label: 'بیشترین امتیاز' },
  { id: 'discount', label: 'بیشترین تخفیف' },
]

export const searchRatingOptions = [4, 3, 2, 0] as const

export function countActiveFilters(filters: SearchFilters, priceCeiling = SEARCH_PRICE_MAX) {
  let count = filters.brands.length
  if (filters.onlyDiscount) count++
  if (filters.onlyInStock) count++
  if (filters.fastDelivery) count++
  if (filters.minRating > 0) count++
  if (filters.minPrice > 0 || filters.maxPrice < priceCeiling) count++
  for (const values of Object.values(filters.attrs || {})) {
    count += values.length
  }
  return count
}

export function cloneSearchFilters(filters: SearchFilters = DEFAULT_SEARCH_FILTERS): SearchFilters {
  const attrs: Record<string, string[]> = {}
  for (const [key, values] of Object.entries(filters.attrs || {})) {
    attrs[key] = [...values]
  }
  return {
    ...filters,
    brands: [...filters.brands],
    attrs,
  }
}

export function emptySearchFacets(): SearchFacets {
  return {
    minPrice: 0,
    maxPrice: SEARCH_PRICE_MAX,
    brands: [],
    attributes: [],
  }
}
