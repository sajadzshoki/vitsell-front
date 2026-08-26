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

export type SearchFilters = {
  brands: string[]
  minPrice: number
  maxPrice: number
  onlyDiscount: boolean
  onlyInStock: boolean
  fastDelivery: boolean
  minRating: number
}

export const SEARCH_PAGE_SIZE = 12
export const SEARCH_INFINITE_LOADS = 3
export const SEARCH_PRICE_MAX = 250_000_000

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  brands: [],
  minPrice: 0,
  maxPrice: SEARCH_PRICE_MAX,
  onlyDiscount: false,
  onlyInStock: false,
  fastDelivery: false,
  minRating: 0,
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

export function countActiveFilters(filters: SearchFilters) {
  let count = filters.brands.length
  if (filters.onlyDiscount) count++
  if (filters.onlyInStock) count++
  if (filters.fastDelivery) count++
  if (filters.minRating > 0) count++
  if (filters.minPrice > 0 || filters.maxPrice < SEARCH_PRICE_MAX) count++
  return count
}

export function cloneSearchFilters(filters: SearchFilters = DEFAULT_SEARCH_FILTERS): SearchFilters {
  return {
    ...filters,
    brands: [...filters.brands],
  }
}
