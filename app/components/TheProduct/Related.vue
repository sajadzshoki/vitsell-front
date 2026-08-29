<template>
  <section
    v-if="items.length"
    class="mt-10"
  >
    <div class="flex items-center justify-between mb-5 gap-3">
      <h2 class="text-lg font-bold text-highlighted">
        {{ $t('محصولات مشابه') }}
      </h2>
      <UButton
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
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <TheProductCard
        v-for="item in items"
        :key="item.id"
        :product="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  product: Product
  related?: Product[]
}>()

const items = computed(() => props.related ?? [])
</script>
