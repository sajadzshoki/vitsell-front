<template>
  <TheCartProductShelf
    :title="$t('علاقه‌مندی‌ها')"
    icon="i-tabler-heart"
    icon-class="text-error"
    :products="items"
    :pending="pending"
    view-all-to="/account/wishlist"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Product ids already in cart — excluded from the shelf. */
  excludeIds?: string[]
}>()

const { wishlistProducts, fetchWishlist, isLoggedIn } = useShop()
const pending = ref(false)

const exclude = computed(() => new Set((props.excludeIds || []).map(String)))

const items = computed(() =>
  wishlistProducts.value.filter(p => !exclude.value.has(p.id)),
)

onMounted(async () => {
  if (!isLoggedIn.value) return
  pending.value = true
  try {
    await fetchWishlist()
  }
  finally {
    pending.value = false
  }
})
</script>
