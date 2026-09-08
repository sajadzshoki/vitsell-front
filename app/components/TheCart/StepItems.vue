<template>
  <div class="space-y-3">
    <TheCartItem
      v-for="line in cartLines"
      :key="line.id"
      :product="line.product"
      :qty="line.qty"
    />

    <!-- <NuxtLink
      to="/"
      class="flex items-center justify-center w-full h-12 rounded-2xl border-2 border-dashed border-muted text-sm text-muted font-medium transition-all  hover:(border-primary text-primary)"
    >
      {{ $t('+ ادامه خرید') }}
    </NuxtLink> -->
  </div>
</template>

<script setup lang="ts">
const { cartLines } = useShop()
</script>
