<template>
  <div class="w-full">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      <TheProductCard
        v-for="p in list"
        :key="p.id"
        :product="p"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { products } from '~/data/products'

const route = useRoute()

const list = computed(() => {
  const id = String(route.params.id)
  const filtered = products.filter(p => p.category === id)
  return filtered.length ? filtered : products
})
</script>
