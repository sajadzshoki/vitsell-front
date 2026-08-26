<template>
  <main class="w-full  md:py-4">
    <TheSearchHeader
      :heading="heading"
      :total="total"
      class="<md:hidden"
      :is-search-query="isSearchQuery"
    />

    <TheSearchMobileBar
      v-model:filters="filters"
      v-model:sort="sort"
      v-model:layout="layout"
      :brands="brands"
      :total="total"
      :active-count="activeFilterCount"
    />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <aside class="hidden lg:block lg:col-span-3">
        <div class="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto scrollbar-none">
          <TheSearchFilters
            v-model="filters"
            :brands="brands"
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
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()

const {
  q,
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
  pending,
  loadingMore,
  canLoadMore,
  showPagination,
  activeFilterCount,
  suggestedCategories,
  loadMore,
  goToPage,
} = useSearchCatalog()

const emptyTitle = computed(() => {
  if (q.value) {
    return `${t('هیچ نتیجه‌ای برای')} «${q.value}» ${t('یافت نشد')}`
  }
  return t('هیچ محصولی یافت نشد')
})

useSeoMeta({
  title: () => heading.value,
})
</script>
