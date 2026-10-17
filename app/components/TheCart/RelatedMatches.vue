<template>
  <TheCartProductShelf
    :title="$t('به سبد شما می‌خوره')"
    icon="i-tabler-shopping-cart-heart"
    icon-class="text-warning"
    :products="items"
    :pending="pending"
  />
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  productIds: string[]
}>()

const { fetchRelatedForCart } = useRelatedProducts()
const items = ref<Product[]>([])
const pending = ref(false)

async function load() {
  const ids = props.productIds.filter(Boolean)
  if (!ids.length) {
    items.value = []
    return
  }
  pending.value = true
  try {
    items.value = await fetchRelatedForCart(ids)
  }
  finally {
    pending.value = false
  }
}

watch(
  () => props.productIds.join(','),
  () => { void load() },
  { immediate: true },
)
</script>
