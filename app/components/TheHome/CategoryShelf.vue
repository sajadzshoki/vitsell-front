<template>
  <section v-if="products.length">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-base md:text-lg font-bold text-highlighted">
        {{ $t(shelf.title) }}
      </h2>
      <UButton
        :to="shelf.viewAllTo"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-chevron-left"
        class="font-medium shrink-0"
      >
        {{ $t('نمایش همه') }}
      </UButton>
    </div>

    <div class="bg-default border border-muted rounded-2xl overflow-hidden">
      <TheCarousel
        v-slot="{ item }"
        :items="products"
        arrows
        :per-view="carouselPerView"
        :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
        :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
        prev-icon="i-tabler-chevron-right"
        next-icon="i-tabler-chevron-left"
        :ui="{
          item: carouselItemClass,
          container: 'ms-0 p-3 md:p-4 items-stretch',
          prev: 'start-1 sm:start-2 z-20',
          next: 'end-1 sm:end-2 z-20',
        }"
        class="w-full"
      >
        <TheProductStoreCard :product="item" />
      </TheCarousel>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeCategoryShelf } from '~/data/home'

const props = defineProps<{
  shelf: HomeCategoryShelf
}>()

const { carouselPerView, carouselItemClass } = useProductCardStyle()
const { productsForCategory } = useHome()
const products = computed(() => productsForCategory(props.shelf.category, 12))
</script>
