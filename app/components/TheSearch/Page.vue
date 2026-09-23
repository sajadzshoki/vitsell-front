<template>
  <main class="w-full  md:py-4">
    <TheSkeleton
      v-if="pending && !items.length"
      variant="search-header"
      class="<md:hidden"
    />
    <TheSearchHeader
      v-else
      :heading="heading"
      :total="total"
      class="<md:hidden"
      :is-search-query="isSearchQuery"
      :category-id="categoryId"
      :category-image="categoryImage"
      :subs="showSubcategories ? subcategoryChips : []"
    />

    <TheSearchMobileBar
      v-model:filters="filters"
      v-model:sort="sort"
      v-model:layout="layout"
      :brands="brands"
      :attributes="filterAttributes"
      :price-ceiling="priceCeiling"
      :total="total"
      :active-count="activeFilterCount"
    />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <aside class="hidden lg:block lg:col-span-3">
        <div class="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto scrollbar-none">
          <TheSkeleton
            v-if="pending && !brands.length && !filterAttributes.length"
            variant="search-filters"
          />
          <TheSearchFilters
            v-else
            v-model="filters"
            :brands="brands"
            :attributes="filterAttributes"
            :price-ceiling="priceCeiling"
          />
        </div>
      </aside>

      <div class="lg:col-span-9 min-w-0">
        <TheSearchToolbar
          v-model:sort="sort"
          v-model:layout="layout"
          :total="total"
        />

        <TheSearchResults
          :items="items"
          :total="total"
          :page="page"
          :page-size="pageSize"
          :pending="pending"
          :loading-more="loadingMore"
          :can-load-more="canLoadMore"
          :show-pagination="showPagination"
          :layout="layout"
          :card-layout="cardLayout"
          :empty-title="emptyTitle"
          :suggested-categories="suggestedCategories"
          @load-more="loadMore"
          @page-change="goToPage"
        />
      </div>
    </div>

    <TheCategorySeoBlock
      v-if="categorySeo?.paragraphs?.length"
      :seo="categorySeo"
      class="mt-6 md:mt-8"
    />
  </main>
</template>

<script setup lang="ts">
import { getCategoryImage } from '~/data/category-pages'

const { t } = useI18n()
const route = useRoute()
const { settings } = useSellerSeoSettings()

const {
  q,
  categoryId,
  category,
  categorySeo,
  heading,
  isSearchQuery,
  brands,
  filterAttributes,
  priceCeiling,
  filters,
  sort,
  layout,
  cardLayout,
  page,
  pageSize,
  items,
  total,
  pending,
  loadingMore,
  canLoadMore,
  showPagination,
  activeFilterCount,
  suggestedCategories,
  loadMore,
  goToPage,
} = await useSearchCatalog()

/** Entered via main category path (`/search/category-{id}`) → child taxonomy chips inside header */
const { getChildCategories } = useCategories()

const subcategoryChips = computed(() => {
  const id = categoryId.value
  if (!id) return []
  return getChildCategories(id).map(c => ({
    id: c.id,
    name: c.name,
    image: c.image ?? null,
  }))
})

const showSubcategories = computed(() => subcategoryChips.value.length > 0)

const categoryImage = computed(() =>
  categoryId.value
    ? getCategoryImage(categoryId.value, category.value?.image)
    : null,
)

const emptyTitle = computed(() => {
  if (q.value) {
    return `${t('هیچ نتیجه‌ای برای')} «${q.value}» ${t('یافت نشد')}`
  }
  return t('هیچ محصولی یافت نشد')
})

const indexingQueryKeys = [
  'q',
  'brands',
  'brand',
  'minPrice',
  'maxPrice',
  'attrs',
  'sort',
  'page',
  'onlyDiscount',
  'onlyInStock',
  'fastDelivery',
  'minRating',
]

const hasIndexingQuery = computed(() => indexingQueryKeys.some((key) => {
  const value = route.query[key]
  if (Array.isArray(value)) return value.some(item => String(item || '').trim())
  return String(value || '').trim().length > 0
}))

const canonicalPath = computed(() =>
  categoryId.value ? `/search/category-${categoryId.value}` : '/search',
)

const canonicalUrl = computed(() => {
  const base = settings.value.siteUrl.replace(/\/+$/, '')
  return base ? `${base}${canonicalPath.value}` : canonicalPath.value
})

const indexableListing = computed(() =>
  Boolean(categoryId.value) && !hasIndexingQuery.value,
)

useSeoMeta({
  title: () => heading.value,
  description: () => categorySeo.value?.paragraphs?.[0],
  robots: () => indexableListing.value ? 'index,follow' : 'noindex,follow',
  ogTitle: () => heading.value,
  ogDescription: () => categorySeo.value?.paragraphs?.[0],
  ogUrl: () => canonicalUrl.value,
  ogImage: () => categoryImage.value || undefined,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))
</script>
