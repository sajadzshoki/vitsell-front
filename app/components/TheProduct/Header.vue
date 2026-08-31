<template>
  <div>
    <div
      class="flex items-center gap-1 flex-wrap"
      :class="size === 'sm' ? 'mb-1' : 'mb-3'"
    >
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
    <component
      :is="asHeading ? 'h1' : 'p'"
      class="text-highlighted"
      :class="size === 'sm'
        ? 'text-base font-bold leading-7'
        : 'text-xl md:text-2xl font-extrabold leading-9 md:leading-10'"
    >
      {{ product.title }}
    </component>
    <p
      v-if="product.shortName"
      class="text-muted mt-1"
      :class="size === 'sm' ? 'text-xs' : 'text-sm md:text-base'"
      dir="ltr"
    >
      {{ product.shortName }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

withDefaults(defineProps<{
  product: Product
  size?: 'sm' | 'lg'
  asHeading?: boolean
}>(), {
  size: 'lg',
  asHeading: true,
})
</script>
