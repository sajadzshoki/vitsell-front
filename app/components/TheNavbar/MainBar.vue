<template>
  <div class="mx-auto max-w-8xl px-3 py-3 gap-2 sm:(px-4 py-4 gap-4) lg:(px-6) flex justify-between items-center">
    <TheNavbarLogo  />
    <div class="<md:hidden">
      <TheNavbarMegaMenu />
    </div>
    <TheNavbarSearch v-model="searchQuery" class="flex-1" />
    <TheNavbarNotifications class="md:!hidden shrink-0" />
    <TheNavbarActions class="<md:hidden" />
  </div>

  <!-- <div class="mx-auto max-w-8xl px-3 py-3 gap-2 sm:(px-4 py-4 gap-4) lg:(px-6) flex justify-between items-center">
    <TheNavbarLogo  />
    <div class="<md:hidden">
      <TheNavbarMegaMenu />
    </div>
    <TheNavbarSearch v-model="searchQuery" class="flex-1" />
    <TheNavbarNotifications class="md:!hidden shrink-0" />
    <TheNavbarActions class="<md:hidden" />
  </div> -->

</template>

<script setup lang="ts">
const route = useRoute()
const searchQuery = ref('')

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string') searchQuery.value = q
  },
  { immediate: true },
)
</script>
