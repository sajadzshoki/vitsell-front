<template>
  <div class="hidden lg:flex bg-default border border-muted rounded-2xl p-3 md:p-4 mb-4 items-center gap-3 flex-wrap">
    <div class="hidden lg:flex items-center gap-2 flex-1 min-w-0">
      <span class="inline-flex items-center gap-1.5 text-xs text-muted shrink-0">
        <UIcon name="i-tabler-arrows-sort" class="size-4" />
        {{ $t('مرتب‌سازی') }}
      </span>
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
        <UButton
          v-for="option in searchSortOptions"
          :key="option.id"
          type="button"
          size="sm"
          :color="sort === option.id ? 'primary' : 'neutral'"
          :variant="sort === option.id ? 'soft' : 'ghost'"
          class="shrink-0"
          @click="sort = option.id"
        >
          {{ $t(option.label) }}
        </UButton>
      </div>
    </div>

    <p
      v-if="total > 0"
      class="text-xs text-muted num hidden md:block"
    >
      {{ total.toLocaleString('fa-IR') }} {{ $t('کالا') }}
    </p>

    <div class="flex items-center gap-1 ms-auto">
      <UButton
        type="button"
        color="neutral"
        :variant="layout === 'grid' ? 'soft' : 'ghost'"
        size="sm"
        square
        icon="i-tabler-layout-grid"
        :aria-label="$t('نمایش ستونی')"
        @click="layout = 'grid'"
      />
      <UButton
        type="button"
        color="neutral"
        :variant="layout === 'list' ? 'soft' : 'ghost'"
        size="sm"
        square
        icon="i-tabler-list-details"
        :aria-label="$t('نمایش افقی')"
        @click="layout = 'list'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { searchSortOptions, type SearchLayout, type SearchSort } from '~/data/search'

defineProps<{
  total: number
}>()

const sort = defineModel<SearchSort>('sort', { required: true })
const layout = defineModel<SearchLayout>('layout', { required: true })
</script>
