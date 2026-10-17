<template>
  <TheCartProductShelf
    :title="$t('بازدیدهای اخیر')"
    icon="i-tabler-history"
    icon-class="text-info"
    :products="items"
    :pending="pending"
  />
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{
  /** Product ids already in cart — excluded from the shelf. */
  excludeIds?: string[]
}>()

const { recentViewedProductIds, hydrateLocal } = useUserActivity()
const { fetchRelatedByIds } = useRelatedProducts()

const items = ref<Product[]>([])
const pending = ref(false)

async function load() {
  hydrateLocal()
  const exclude = new Set((props.excludeIds || []).map(String))
  const ids = recentViewedProductIds(24).filter(id => !exclude.has(id))
  if (!ids.length) {
    items.value = []
    return
  }
  pending.value = true
  try {
    items.value = await fetchRelatedByIds(ids, { excludeIds: [...exclude] })
  }
  finally {
    pending.value = false
  }
}

watch(
  () => (props.excludeIds || []).join(','),
  () => { void load() },
)

onMounted(() => {
  void load()
})
</script>
