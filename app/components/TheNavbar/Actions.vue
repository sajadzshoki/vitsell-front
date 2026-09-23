<template>
  <div class="flex items-center gap-1 shrink-0">
    <TheNavbarAccountMenu />
    <TheNavbarNotifications />

    <div class="w-px h-8 bg-accented mx-1 hidden md:block" />

    <button
      type="button"
      class="relative size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition"
      :aria-label="$t('سبد خرید')"
      @click="navigateTo('/cart')"
    >
      <UIcon
        name="i-tabler-shopping-cart"
        class="size-5"
        :class="cartAnimating ? 'animate-cart-bump' : ''"
      />
      <span
        v-if="cartCount > 0"
        class="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-inverted text-[10px] font-bold grid place-items-center num"
        :class="cartAnimating ? 'animate-cart-bump' : ''"
      >
        {{ cartCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { cartCount, cartBump, isLoggedIn, ensureCartLoaded } = useShop()

const cartAnimating = ref(false)
let bumpTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  void ensureCartLoaded()
})

watch(isLoggedIn, () => {
  void ensureCartLoaded()
})

watch(cartBump, () => {
  cartAnimating.value = false
  nextTick(() => {
    cartAnimating.value = true
    if (bumpTimer) clearTimeout(bumpTimer)
    bumpTimer = setTimeout(() => {
      cartAnimating.value = false
    }, 450)
  })
})

onBeforeUnmount(() => {
  if (bumpTimer) clearTimeout(bumpTimer)
})
</script>
