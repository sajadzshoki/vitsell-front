<template>
  <section
    v-if="items.length"
    class="mt-6 md:mt-10"
  >
    <div class="flex items-center justify-between mb-3.5 md:mb-5 gap-3">
      <h2 class="text-base md:text-lg font-bold text-highlighted">
        {{ $t('محصولات مشابه') }}
      </h2>
      <UButton
        v-if="showViewAll"
        :to="{ name: 'category-catId', params: { catId: product.category } }"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
        class="font-medium shrink-0"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>
    <div :class="showcase
      ? 'grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'
      : 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4'"
    >
      <TheProductStoreCard
        v-for="item in items"
        :key="item.id"
        :product="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const { showcase } = useProductCardStyle()

const props = defineProps<{
  product: Product
  related?: Product[]
}>()

const items = computed(() => props.related ?? [])

/** Hide «مشاهده همه» when the row is sparse (desktop grid is 6 cols). */
const showViewAll = computed(() => items.value.length >= 6)
</script>
