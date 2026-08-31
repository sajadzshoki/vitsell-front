import type { Product } from '~/data/products'
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
  const { fetchProducts } = useProducts()

  const filters = ref<SearchFilters>(cloneSearchFilters())
  const sort = ref<SearchSort>('relevant')
  const layout = ref<SearchLayout>('grid')
  const page = ref(1)
  const infiniteLoads = ref(0)
  const items = ref<Product[]>([])
  const total = ref(0)
  const pending = ref(false)
  const loadingMore = ref(false)
  const brands = ref<string[]>([])
  const categorySeo = ref<CategoryPageMeta['seo'] | null>(null)

  const q = computed(() => String(route.query.q ?? '').trim())
  const categoryId = computed(() => String(route.query.category ?? '').trim())
  const category = computed(() => getCategoryById(categoryId.value))

  const heading = computed(() => {
    if (q.value) return q.value
    if (category.value) return category.value.name
    if (categoryId.value) return categoryId.value
    return t('همه محصولات')
  })

  const isSearchQuery = computed(() => Boolean(q.value))
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

  async function refreshBrands() {
    const { result } = await fetchProducts({
      category: categoryId.value || undefined,
      pageSize: 48,
      page: 1,
    })
    brands.value = Array.from(new Set(result.items.map(p => p.brand)))
      .sort((a, b) => a.localeCompare(b, 'fa'))
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
    await Promise.all([loadPage(1, false), refreshBrands()])
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
    categorySeo,
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
