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
          :to="toSearchRoute({ q: category.name, category: category.id })"
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
        <TheProductCard
          v-for="product in items"
          :key="product.id"
          :product="product"
          :layout="cardLayout"
        />
      </div>

      <div
        v-if="canLoadMore"
        ref="sentinelRef"
        class="h-10"
      />

      <div
        v-if="loadingMore"
        class="mt-4"
      >
        <TheSkeleton
          :variant="layout === 'list' ? 'product-list' : 'product-grid'"
          :count="4"
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

const gridClass = computed(() =>
  props.layout === 'list'
    ? 'flex flex-col gap-2'
    : 'grid grid-cols-2 gap-1 md:(grid-cols-3 gap-4) xl:grid-cols-4',
)

function onPageChange(next: number) {
  emit('pageChange', next)
}

if (import.meta.client) {
  useInfiniteScroll(
    window,
    () => {
      emit('loadMore')
    },
    {
      distance: 320,
      interval: 400,
      canLoadMore: () => props.canLoadMore && !props.pending && !props.loadingMore,
    },
  )
}
</script>
