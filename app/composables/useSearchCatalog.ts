import { categories, getCategoryById } from '~/data/categories'
import { categoryLabels, products, type Product } from '~/data/products'
import {
  cloneSearchFilters,
  countActiveFilters,
  DEFAULT_SEARCH_FILTERS,
  SEARCH_INFINITE_LOADS,
  SEARCH_PAGE_SIZE,
  type SearchFilters,
  type SearchLayout,
  type SearchSort,
} from '~/data/search'

export type SearchCatalogQuery = {
  q: string
  category: string
  filters: SearchFilters
  sort: SearchSort
  page: number
  pageSize: number
}

export type SearchCatalogResult = {
  items: Product[]
  total: number
}

function productDiscount(product: Product) {
  if (!product.oldPrice) return 0
  return (product.oldPrice - product.price) / product.oldPrice
}

const brandAliases: Record<string, string> = {
  Apple: 'اپل',
  Samsung: 'سامسونگ',
  Xiaomi: 'شیائومی',
  Huawei: 'هوآوی',
  Honor: 'آنر',
  Nokia: 'نوکیا',
  Sony: 'سونی',
  ASUS: 'ایسوس',
  Lenovo: 'لنوو',
  HP: 'اچ‌پی',
  Acer: 'ایسر',
  Microsoft: 'مایکروسافت',
  JBL: 'جی‌بی‌ال',
  Anker: 'انکر',
  Sennheiser: 'سنهایزر',
  Bose: 'بوز',
  LG: 'ال‌جی',
}

function matchesQuery(product: Product, q: string) {
  if (!q) return true
  const haystack = [
    product.title,
    product.brand,
    brandAliases[product.brand] ?? '',
    product.category,
    product.categoryLabel,
    product.shortDesc ?? '',
  ].join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(token => haystack.includes(token))
}

function applyFilters(list: Product[], filters: SearchFilters) {
  return list.filter((product) => {
    if (filters.brands.length && !filters.brands.includes(product.brand)) return false
    if (filters.onlyDiscount && !product.oldPrice) return false
    if (filters.onlyInStock && product.inStock === false) return false
    if (filters.fastDelivery && !product.fastDelivery) return false
    if (product.rating < filters.minRating) return false
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false
    return true
  })
}

function applySort(list: Product[], sort: SearchSort) {
  const next = [...list]
  next.sort((a, b) => {
    switch (sort) {
      case 'cheapest':
        return a.price - b.price
      case 'expensive':
        return b.price - a.price
      case 'bestrated':
        return b.rating - a.rating
      case 'newest':
        return b.reviews - a.reviews
      case 'fastest':
        return Number(b.fastDelivery) - Number(a.fastDelivery)
      case 'discount':
        return productDiscount(b) - productDiscount(a)
      case 'viewed':
        return b.reviews - a.reviews
      case 'bestselling':
        return b.reviews - a.reviews
      default:
        return b.reviews - a.reviews
    }
  })
  return next
}

/**
 * Local stand-in for the future catalog API.
 * Keep the signature so a real `$fetch` can replace the body later.
 */
export async function fetchSearchCatalog(query: SearchCatalogQuery): Promise<SearchCatalogResult> {
  // Simulated latency so pending/skeleton states stay ready for a real API.
  await new Promise(resolve => setTimeout(resolve, 160))
  const q = query.q.trim()
  const matched = products.filter((product) => {
    if (query.category && product.category !== query.category) return false
    return matchesQuery(product, q)
  })

  const list = applySort(applyFilters(matched, query.filters), query.sort)
  const start = (query.page - 1) * query.pageSize
  return {
    items: list.slice(start, start + query.pageSize),
    total: list.length,
  }
}

export function useSearchCatalog() {
  const route = useRoute()
  const { t } = useI18n()

  const filters = ref<SearchFilters>(cloneSearchFilters())
  const sort = ref<SearchSort>('relevant')
  const layout = ref<SearchLayout>('grid')
  const page = ref(1)
  const infiniteLoads = ref(0)
  const items = ref<Product[]>([])
  const total = ref(0)
  const pending = ref(false)
  const loadingMore = ref(false)

  const q = computed(() => String(route.query.q ?? '').trim())
  const categoryId = computed(() => String(route.query.category ?? '').trim())
  const category = computed(() => getCategoryById(categoryId.value))

  const heading = computed(() => {
    if (q.value) return q.value
    if (category.value) return category.value.name
    if (categoryId.value) return categoryLabels[categoryId.value] ?? categoryId.value
    return t('همه محصولات')
  })

  const isSearchQuery = computed(() => Boolean(q.value))

  const brands = computed(() => {
    const source = categoryId.value
      ? products.filter(p => p.category === categoryId.value)
      : products
    return Array.from(new Set(source.map(p => p.brand))).sort((a, b) => a.localeCompare(b, 'fa'))
  })

  const activeFilterCount = computed(() => countActiveFilters(filters.value))
  const pageSize = SEARCH_PAGE_SIZE
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
  const canLoadMore = computed(() =>
    infiniteLoads.value < SEARCH_INFINITE_LOADS
    && items.value.length < total.value,
  )
  const showPagination = computed(() =>
    infiniteLoads.value >= SEARCH_INFINITE_LOADS
    && total.value > pageSize,
  )
  const cardLayout = computed(() => layout.value === 'list' ? 'horizontal' : 'vertical')

  const suggestedCategories = computed(() => categories.slice(0, 6))

  function catalogQuery(targetPage: number): SearchCatalogQuery {
    return {
      q: q.value,
      category: categoryId.value,
      filters: cloneSearchFilters(filters.value),
      sort: sort.value,
      page: targetPage,
      pageSize,
    }
  }

  async function loadPage(targetPage: number, append: boolean) {
    if (append) loadingMore.value = true
    else pending.value = true

    try {
      const result = await fetchSearchCatalog(catalogQuery(targetPage))
      total.value = result.total
      page.value = targetPage
      items.value = append ? [...items.value, ...result.items] : result.items
    }
    finally {
      pending.value = false
      loadingMore.value = false
    }
  }

  async function resetAndLoad() {
    infiniteLoads.value = 0
    items.value = []
    await loadPage(1, false)
  }

  async function loadMore() {
    if (pending.value || loadingMore.value || !canLoadMore.value) return
    infiniteLoads.value += 1
    await loadPage(page.value + 1, true)
  }

  async function goToPage(targetPage: number) {
    infiniteLoads.value = SEARCH_INFINITE_LOADS
    await loadPage(targetPage, false)
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function resetFilters() {
    filters.value = cloneSearchFilters()
  }

  function toggleBrand(brand: string) {
    const next = new Set(filters.value.brands)
    if (next.has(brand)) next.delete(brand)
    else next.add(brand)
    filters.value = { ...filters.value, brands: Array.from(next) }
  }

  watch(
    [q, categoryId],
    () => {
      resetAndLoad()
    },
    { immediate: true },
  )

  watchDebounced(
    [filters, sort],
    () => {
      resetAndLoad()
    },
    { deep: true, debounce: 200 },
  )

  return {
    q,
    categoryId,
    category,
    heading,
    isSearchQuery,
    brands,
    filters,
    sort,
    layout,
    cardLayout,
    page,
    pageSize,
    items,
    total,
    totalPages,
    pending,
    loadingMore,
    canLoadMore,
    showPagination,
    activeFilterCount,
    suggestedCategories,
    loadMore,
    goToPage,
    resetFilters,
    toggleBrand,
  }
}
