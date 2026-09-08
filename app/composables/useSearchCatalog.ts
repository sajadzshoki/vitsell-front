import type { Product } from '~/data/products'
import {
  cloneSearchFilters,
  countActiveFilters,
  emptySearchFacets,
  SEARCH_INFINITE_LOADS,
  SEARCH_PAGE_SIZE,
  SEARCH_PRICE_MAX,
  type SearchFacets,
  type SearchFilters,
  type SearchLayout,
  type SearchSort,
} from '~/data/search'
import {
  getCategoryPageMeta,
  type CategoryPageMeta,
} from '~/data/category-pages'

type CategoryPagePayload = {
  meta: CategoryPageMeta | null
}

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

export async function fetchSearchCatalog(query: SearchCatalogQuery): Promise<SearchCatalogResult> {
  const { fetchProducts } = useProducts()
  const { result } = await fetchProducts({
    q: query.q || undefined,
    category: query.category || undefined,
    brands: query.filters.brands.length ? query.filters.brands : undefined,
    minPrice: query.filters.minPrice,
    maxPrice: query.filters.maxPrice,
    onlyDiscount: query.filters.onlyDiscount || undefined,
    onlyInStock: query.filters.onlyInStock || undefined,
    fastDelivery: query.filters.fastDelivery || undefined,
    minRating: query.filters.minRating || undefined,
    attrs: Object.keys(query.filters.attrs || {}).length ? query.filters.attrs : undefined,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
  })
  return {
    items: result.items,
    total: result.total,
  }
}

export function useSearchCatalog() {
  const route = useRoute()
  const { t } = useI18n()
  const { categories, getCategoryById, fetchCategories } = useCategories()

  const filters = ref<SearchFilters>(cloneSearchFilters())
  const sort = ref<SearchSort>('relevant')
  const layout = ref<SearchLayout>('grid')
  const page = ref(1)
  const infiniteLoads = ref(0)
  const items = ref<Product[]>([])
  const total = ref(0)
  const pending = ref(false)
  const loadingMore = ref(false)
  const facets = ref<SearchFacets>(emptySearchFacets())
  const categorySeo = ref<CategoryPageMeta['seo'] | null>(null)
  const skipNextFilterWatch = ref(false)

  const q = computed(() => String(route.query.q ?? '').trim())
  /** Path `/search/category-{id}` (preferred) or legacy `?category=` */
  const categoryId = computed(() => {
    const fromParam = String(route.params.id ?? '').trim()
    if (fromParam) return fromParam
    return String(route.query.category ?? '').trim()
  })
  const category = computed(() => getCategoryById(categoryId.value))

  const brands = computed(() => facets.value.brands)
  const filterAttributes = computed(() => facets.value.attributes)
  const priceCeiling = computed(() =>
    Math.max(facets.value.maxPrice || SEARCH_PRICE_MAX, facets.value.minPrice || 0, 1),
  )

  function brandsFromRoute(): string[] {
    const raw = route.query.brands ?? route.query.brand
    if (Array.isArray(raw)) {
      return raw.flatMap(v => String(v).split(',')).map(s => s.trim()).filter(Boolean)
    }
    if (raw == null || raw === '') return []
    return String(raw).split(',').map(s => s.trim()).filter(Boolean)
  }

  const routeBrands = computed(() => brandsFromRoute())

  if (routeBrands.value.length) {
    filters.value = { ...cloneSearchFilters(filters.value), brands: [...routeBrands.value] }
  }

  const heading = computed(() => {
    if (q.value) return q.value
    if (category.value) return category.value.name
    if (categoryId.value) return categoryId.value
    if (filters.value.brands.length === 1) return filters.value.brands[0]!
    if (filters.value.brands.length > 1) {
      return filters.value.brands.join('، ')
    }
    return t('همه محصولات')
  })

  const isSearchQuery = computed(() => Boolean(q.value))
  const activeFilterCount = computed(() =>
    countActiveFilters(filters.value, priceCeiling.value),
  )
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
  const suggestedCategories = computed(() => categories.value.slice(0, 6))

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

  async function refreshFacets() {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (categoryId.value) params.set('category', categoryId.value)
    const qs = params.toString()
    const { result } = await useGet<SearchFacets>(
      `/catalog/facets${qs ? `?${qs}` : ''}`,
      { headers: { 'no-error': true } },
    )

    const next = result ?? emptySearchFacets()
    const ceiling = Math.max(Number(next.maxPrice) || SEARCH_PRICE_MAX, 1)
    facets.value = {
      minPrice: Math.max(0, Number(next.minPrice) || 0),
      maxPrice: ceiling,
      brands: Array.isArray(next.brands) ? next.brands : [],
      attributes: Array.isArray(next.attributes) ? next.attributes : [],
    }

    // Align price slider ceiling to full search result set (not page limit).
    skipNextFilterWatch.value = true
    filters.value = {
      ...cloneSearchFilters(filters.value),
      attrs: {},
      minPrice: 0,
      maxPrice: ceiling,
    }
  }

  async function refreshCategorySeo() {
    const id = categoryId.value
    if (!id) {
      categorySeo.value = null
      return
    }

    const { result: pageMeta } = await useGet<CategoryPagePayload>(
      `/category-pages/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )

    const fallback = getCategoryPageMeta(id)
    const resolved = category.value
    const seo = pageMeta?.meta?.seo ?? fallback.seo

    categorySeo.value = {
      heading: seo.heading || resolved?.name || id,
      paragraphs: seo.paragraphs?.length ? seo.paragraphs : fallback.seo.paragraphs,
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
    filters.value = {
      ...cloneSearchFilters(),
      maxPrice: priceCeiling.value,
    }
  }

  function toggleBrand(brand: string) {
    const next = new Set(filters.value.brands)
    if (next.has(brand)) next.delete(brand)
    else next.add(brand)
    filters.value = { ...filters.value, brands: Array.from(next) }
  }

  function toggleAttr(slug: string, value: string) {
    const current = new Set(filters.value.attrs[slug] || [])
    if (current.has(value)) current.delete(value)
    else current.add(value)
    const attrs = { ...filters.value.attrs }
    if (current.size) attrs[slug] = Array.from(current)
    else delete attrs[slug]
    filters.value = { ...filters.value, attrs }
  }

  onMounted(() => {
    fetchCategories({ withCounts: false })
  })

  watch(
    categoryId,
    () => {
      refreshCategorySeo()
    },
    { immediate: true },
  )

  watch(
    routeBrands,
    (next) => {
      const current = filters.value.brands
      const same = next.length === current.length && next.every((b, i) => b === current[i])
      if (same) return
      filters.value = { ...filters.value, brands: [...next] }
    },
  )

  watch(
    [q, categoryId],
    async () => {
      await refreshFacets()
      await resetAndLoad()
      const { track } = useUserActivity()
      const cat = categoryId.value
      const query = q.value?.trim()
      if (cat && !query) {
        void track({ type: 'category_view', category: cat })
      }
      else if (query) {
        void track({
          type: 'search',
          query,
          category: cat || undefined,
        })
      }
    },
    { immediate: true },
  )

  watchDebounced(
    [filters, sort],
    () => {
      if (skipNextFilterWatch.value) {
        skipNextFilterWatch.value = false
        return
      }
      resetAndLoad()
    },
    { deep: true, debounce: 200 },
  )

  return {
    q,
    categoryId,
    category,
    categorySeo,
    heading,
    isSearchQuery,
    brands,
    filterAttributes,
    priceCeiling,
    facets,
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
    toggleAttr,
  }
}
