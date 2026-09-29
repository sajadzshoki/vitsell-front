<template>
  <div>
    <div v-if="pending && !items.length">
      <TheSkeleton
        :variant="layout === 'list' ? 'product-list' : 'product-grid'"
        :count="8"
      />
    </div>

    <div
      v-else-if="!items.length"
      class="bg-default border border-muted rounded-3xl p-10 md:p-16 text-center"
    >
      <UIcon name="i-tabler-search-off" class="size-20 text-primary/20 mx-auto mb-5" />
      <h2 class="text-lg font-bold text-highlighted mb-2">
        {{ emptyTitle }}
      </h2>
      <p class="text-sm text-muted mb-6 leading-7 max-w-md mx-auto">
        {{ $t('پیشنهاد می‌کنیم کلمات کلیدی دیگری را امتحان کنید یا فیلترها را تغییر دهید.') }}
      </p>
      <div class="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto mb-6">
        <UButton
          v-for="category in suggestedCategories"
          :key="category.id"
          :to="toSearchRoute({ category: category.id })"
          color="neutral"
          variant="subtle"
          size="sm"
        >
          {{ $t(category.name) }}
        </UButton>
      </div>
      <UButton
        to="/"
        color="primary"
        class="font-bold"
      >
        {{ $t('بازگشت به صفحه اصلی') }}
      </UButton>
    </div>

    <template v-else>
      <div :class="gridClass">
        <TheProductStoreCard
          v-for="product in items"
          :key="product.id"
          :product="product"
          :layout="cardLayout"
        />
      </div>

      <div
        v-if="canLoadMore || loadingMore"
        ref="sentinelRef"
        class="mt-6 flex flex-col items-center justify-center gap-3 py-5"
        aria-live="polite"
      >
        <template v-if="loadingMore">
          <div class="flex items-center gap-2 text-primary">
            <UIcon
              name="i-tabler-loader-2"
              class="size-6 animate-spin"
            />
            <span class="text-sm font-medium">
              {{ $t('در حال بارگذاری محصولات بیشتر...') }}
            </span>
          </div>
          <TheSkeleton
            :variant="layout === 'list' ? 'product-list' : 'product-grid'"
            :count="4"
            class="w-full opacity-70"
          />
        </template>
        <div
          v-else
          class="h-12 w-full"
          aria-hidden="true"
        />
      </div>

      <div
        v-if="showPagination"
        class="mt-8 flex justify-center"
      >
        <UPagination
          :page="page"
          :total="total"
          :items-per-page="pageSize"
          :sibling-count="1"
          show-edges
          color="neutral"
          active-color="primary"
          @update:page="onPageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toSearchRoute } from '~/data/categories'
import type { Category } from '~/data/categories'
import type { Product } from '~/data/products'
import type { SearchLayout } from '~/data/search'

const props = defineProps<{
  items: Product[]
  total: number
  page: number
  pageSize: number
  pending: boolean
  loadingMore: boolean
  canLoadMore: boolean
  showPagination: boolean
  layout: SearchLayout
  cardLayout: 'vertical' | 'horizontal'
  emptyTitle: string
  suggestedCategories: Category[]
}>()

const emit = defineEmits<{
  loadMore: []
  pageChange: [page: number]
}>()

const sentinelRef = ref<HTMLElement | null>(null)

const { showcase } = useProductCardStyle()

const gridClass = computed(() => {
  if (props.layout === 'list') return 'flex flex-col gap-3'
  if (showcase.value) {
    return 'grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'
  }
  return 'grid grid-cols-2 gap-1 md:(grid-cols-3 gap-4) xl:grid-cols-4'
})

function onPageChange(next: number) {
  emit('pageChange', next)
}

function tryLoadMore() {
  if (!props.canLoadMore || props.pending || props.loadingMore) return
  emit('loadMore')
}

if (import.meta.client) {
  useInfiniteScroll(
    window,
    () => {
      tryLoadMore()
    },
    {
      distance: 420,
      interval: 300,
      canLoadMore: () => props.canLoadMore && !props.pending && !props.loadingMore,
    },
  )

  useIntersectionObserver(
    sentinelRef,
    ([entry]) => {
      if (entry?.isIntersecting) tryLoadMore()
    },
    { rootMargin: '240px 0px' },
  )
}
</script>
