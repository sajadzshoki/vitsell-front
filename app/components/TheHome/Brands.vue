<template>
  <section v-if="(pending || !loaded) && !brands.length">
    <TheSkeleton variant="brand" />
  </section>

  <section v-else-if="brands.length">
    <div class="bg-default rounded-3xl p-4 sm:p-6">
      <div class="sm:hidden">
        <UCarousel
          v-slot="{ item }"
          :items="brands"
          arrows
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
            viewport: 'px-8',
            prev: 'start-0 z-20 shadow-sm',
            next: 'end-0 z-20 shadow-sm',
          }"
        >
          <button
            type="button"
            class="w-full text-lg font-bold text-dimmed hover:text-highlighted transition tracking-wide cursor-pointer py-2"
          >
            {{ item }}
          </button>
        </UCarousel>
      </div>

      <div class="hidden sm:flex items-center flex-wrap justify-around gap-6">
        <button
          v-for="brand in brands"
          :key="brand"
          type="button"
          class="text-lg md:text-2xl font-bold text-dimmed hover:text-highlighted transition tracking-wide cursor-pointer"
        >
          {{ brand }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { brands, pending, loaded } = useHome()
</script>
