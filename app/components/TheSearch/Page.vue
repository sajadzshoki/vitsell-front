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
      :subs="showSubcategories ? categorySubs : []"
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
} = useSearchCatalog()

/** Entered via main category path (`/search/category-{id}`) → subcategory chips inside header */
const showSubcategories = computed(() =>
  Boolean(categoryId.value && category.value?.subs?.length),
)

const categorySubs = computed(() => category.value?.subs ?? [])

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

useSeoMeta({
  title: () => heading.value,
  description: () => categorySeo.value?.paragraphs?.[0],
})
</script>
