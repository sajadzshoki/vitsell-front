<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col">
    <TheNavbar />
    <div
      class="mx-auto max-w-8xl w-full flex-1 pb-24 md:pb-4"
      :class="isCategoryIndex ? 'max-md:(px-0 py-0 pb-16)' : 'px-3 py-4 sm:px-4 lg:px-6'"
    >
      <slot />
    </div>
    <TheFooter
      class="pb-20 md:pb-0"
      :class="{ 'max-md:hidden': isCategoryIndex }"
    />
    <TheBottomNav />
    <TheCompareBar />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isCategoryIndex = computed(() => route.path === '/category')
</script>
