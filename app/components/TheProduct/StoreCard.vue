<template>
  <TheProductShowcaseCard
    v-if="showcase"
    :product="product"
  />
  <TheProductCard
    v-else
    :product="product"
    :compact="compact"
    :layout="layout"
  />
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

withDefaults(defineProps<{
  product: Product
  compact?: boolean
  layout?: 'vertical' | 'horizontal'
}>(), {
  compact: false,
  layout: 'vertical',
})

const { showcase } = useProductCardStyle()
</script>
