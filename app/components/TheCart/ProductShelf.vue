<template>
  <section
    v-if="pending || products.length"
    class="mt-5 bg-default border border-muted rounded-2xl p-3 md:p-4 w-full"
  >
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <UIcon
          v-if="icon"
          :name="icon"
          class="size-5 shrink-0"
          :class="iconClass"
        />
        <h2 class="text-sm md:text-base font-bold text-highlighted truncate">
          {{ title }}
        </h2>
      </div>
      <UButton
        v-if="viewAllTo && products.length"
        :to="viewAllTo"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-chevron-left"
        class="font-medium shrink-0 cursor-pointer"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>

    <div
      v-if="pending && !products.length"
      class="py-6 text-center text-sm text-muted"
    >
      {{ $t('در حال بارگذاری...') }}
    </div>

    <div
      v-else-if="products.length"
      class="overflow-hidden"
    >
      <TheCarousel
        v-slot="{ item }"
        :items="products"
        arrows
        :per-view="[3, 4, 5, 6, 7]"
        :prev="{ color: 'neutral', variant: 'solid', size: 'sm' }"
        :next="{ color: 'neutral', variant: 'solid', size: 'sm' }"
        prev-icon="i-tabler-chevron-right"
        next-icon="i-tabler-chevron-left"
        :ui="{
          item: 'basis-[31%] sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[14.2%] ps-0 pe-2',
          container: 'ms-0 items-stretch',
          prev: 'start-1 sm:start-2 z-20',
          next: 'end-1 sm:end-2 z-20',
        }"
        class="w-full"
      >
        <TheProductStoreCard
          :product="item"
          compact
          class="h-full"
        />
      </TheCarousel>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import type { RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
  title: string
  icon?: string
  iconClass?: string
  products: Product[]
  pending?: boolean
  viewAllTo?: RouteLocationRaw
}>(), {
  icon: undefined,
  iconClass: 'text-primary',
  pending: false,
  viewAllTo: undefined,
})
</script>
