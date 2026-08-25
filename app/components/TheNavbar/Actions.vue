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
      <UIcon name="i-tabler-shopping-cart" class="size-5" />
      <span
        v-if="cartCount > 0"
        class="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-inverted text-[10px] font-bold grid place-items-center num"
      >
        {{ cartCount }}
      </span>
    </button>

    <button
      type="button"
      class="lg:hidden size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition"
      :aria-label="$t('منو')"
      @click="emit('openMobile')"
    >
      <UIcon name="i-tabler-menu-2" class="size-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  openMobile: []
}>()

const { cartCount } = useShop()
</script>
