<template>
  <div class="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
    <TheNavbarLogo />
    <TheNavbarMegaMenu />
    <TheNavbarSearch v-model="searchQuery" />
    <TheNavbarActions @open-mobile="mobileOpen = true" />
  </div>

  <TheNavbarMobileDrawer v-model:open="mobileOpen" />
</template>

<script setup lang="ts">
const searchQuery = ref('')
const mobileOpen = ref(false)
</script>
