<template>
  <div >
    <div class="flex items-center gap-1 flex-wrap mb-1">
      <!-- <UBadge color="neutral" variant="subtle" size="sm">
        {{ product.brand }}
      </UBadge> -->
      <UBadge
        v-if="product.badge"
        color="primary"
        variant="subtle"
        size="sm"
        class="font-medium"
      >
        {{ $t(product.badge) }}
      </UBadge>
    </div>
    <div class="flex items-center justify-between <md:(flexCol )">
    <component
      :is="asHeading ? 'h1' : 'p'"
      class="text-highlighted text-base font-bold leading-7 md:(text-2xl font-extrabold leading-10)"
    >
      {{ product.title }}
    </component>
    <p
      v-if="product.shortName"
      class="text-muted mt-1 text-xs md:text-base <md:self-end"

    >
      {{ product.shortName }}
    </p>
  </div>
</div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

withDefaults(defineProps<{
  product: Product
  asHeading?: boolean
}>(), {
  asHeading: true,
})
</script>
