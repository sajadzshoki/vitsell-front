<template>
  <section class="relative">
    <UCarousel
      v-slot="{ item }"
      :items="items"
      arrows
      align="start"
      loop
      :slides-to-scroll="3"
      prev-icon="i-tabler-chevron-right"
      next-icon="i-tabler-chevron-left"
      :prev="{ color: 'neutral', variant: 'solid', size: 'sm' }"
      :next="{ color: 'neutral', variant: 'solid', size: 'sm' }"
      class="w-full"
      :ui="{
        item: 'basis-[4.5rem] sm:basis-[6.25rem] md:basis-[6.75rem] lg:basis-[7.25rem] shrink-0',
        container: 'ms-0 py-1',
        viewport: 'px-9 sm:px-10',
        prev: 'start-0 z-20 shadow-sm',
        next: 'end-0 z-20 shadow-sm',
      }"
    >
      <NuxtLink
        :to="item.to"
        class="flex flex-col items-center gap-1.5 group w-full px-1.5"
      >
        <div
          class="size-14 sm:size-16 md:size-[4.5rem] rounded-full border-2 border-primary/40 p-0.5 bg-default shrink-0 transition group-hover:(border-primary shadow-sm)"
        >
          <div class="size-full rounded-full bg-primary/10 overflow-hidden grid place-items-center p-0.5">
            <img
              :src="item.image"
              :alt="$t(item.title)"
              class="size-full rounded-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
        <span
          class="text-[11px] sm:text-xs text-toned text-center leading-snug line-clamp-2 w-full group-hover:text-primary transition"
        >
          {{ $t(item.title) }}
        </span>
      </NuxtLink>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
import { homeCircleItems } from '~/data/home'

const items = homeCircleItems
</script>
