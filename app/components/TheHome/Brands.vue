<template>
  <section v-if="(pending || !loaded) && !brands.length">
    <TheSkeleton variant="brand" />
  </section>

  <section v-else-if="brands.length">
    <div class="bg-default rounded-3xl p-4 sm:p-6">
      <div class="sm:hidden">
        <TheCarousel
          v-slot="{ item }"
          :items="previewBrands"
          arrows
          :per-view="[3, 3, 3, 3, 3]"
          align="start"
          :slides-to-scroll="2"
          prev-icon="i-tabler-chevron-right"
          next-icon="i-tabler-chevron-left"
          :prev="{ color: 'neutral', variant: 'solid', size: 'sm' }"
          :next="{ color: 'neutral', variant: 'solid', size: 'sm' }"
          class="w-full"
          :ui="{
            item: 'basis-1/3 ps-3',
            container: 'ms-0 items-center',
            viewport: 'md:px-8 ',
            prev: 'start-0 z-20 shadow-sm',
            next: 'end-0 z-20 shadow-sm',
          }"
        >
          <NuxtLink
            :to="toSearchRoute({ brands: item })"
            class="w-full text-lg font-bold text-dimmed hover:text-highlighted transition-all tracking-wide cursor-pointer py-2 block text-center"
          >
            {{ item }}
          </NuxtLink>
        </TheCarousel>
      </div>

      <div class="hidden sm:flex items-center flex-wrap justify-around gap-6">
        <NuxtLink
          v-for="brand in previewBrands"
          :key="brand"
          :to="toSearchRoute({ brands: brand })"
          class="text-lg md:text-2xl font-bold text-dimmed hover:text-highlighted transition-all tracking-wide cursor-pointer"
        >
          {{ brand }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toSearchRoute } from '~/data/categories'

const PREVIEW_LIMIT = 10

const { brands, pending, loaded } = useHome()

const previewBrands = computed(() => brands.value.slice(0, PREVIEW_LIMIT))
</script>
