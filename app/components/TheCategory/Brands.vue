<template>
  <section v-if="brands.length">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-base md:text-lg font-bold text-highlighted">
        {{ $t('محبوب‌ترین برندها') }}
      </h2>
    </div>

    <div class="bg-default border border-muted rounded-3xl p-4 sm:p-6">
      <div class="flex items-center flex-wrap justify-center gap-4 sm:gap-8">
        <NuxtLink
          v-for="brand in brands"
          :key="brand"
          :to="brandRoute(brand)"
          class="text-base sm:text-xl font-bold text-dimmed hover:text-primary transition tracking-wide"
        >
          {{ brand }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  brands: string[]
  brandRoute: (brand: string) => string | { path: string, query?: Record<string, string> }
}>()
</script>
