<template>
  <section>
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-base md:text-lg font-bold text-highlighted">
        {{ $t('دسته‌بندی‌های پیشنهادی') }}
      </h2>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="searchRoute(item.query)"
        class="flex flex-col items-center gap-2 group"
      >
        <div class="size-16 sm:size-20 rounded-full border-2 border-primary/30 p-0.5 bg-default transition-all  group-hover:(border-primary shadow-sm)">
          <div class="size-full rounded-full overflow-hidden bg-muted">
            <img
              :src="item.image"
              :alt="item.title"
              class="size-full object-cover"
              loading="lazy"
            >
          </div>
        </div>
        <span class="text-[11px] sm:text-xs text-toned text-center leading-snug line-clamp-2 group-hover:text-primary transition">
          {{ item.title }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CategorySuggestedItem } from '~/data/category-pages'

defineProps<{
  items: CategorySuggestedItem[]
  searchRoute: (query: string) => string | { path: string, query?: Record<string, string> }
}>()
</script>
