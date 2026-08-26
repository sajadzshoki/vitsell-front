<template>
  <nav
    class="overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0"
    :aria-label="$t('دسته‌بندی‌های اصلی')"
  >
    <div class="flex items-center gap-2 min-w-max pb-1">
      <NuxtLink
        v-for="item in categories"
        :key="item.id"
        :to="toCategoryRoute(item.id)"
        class="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition"
        :class="item.id === activeId
          ? 'bg-primary text-inverted'
          : 'bg-elevated text-toned hover:(bg-primary/10 text-primary)'"
      >
        <UIcon :name="getCategoryIcon(item.id)" class="size-4 shrink-0" />
        {{ $t(item.name) }}
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { categories, getCategoryIcon, toCategoryRoute, type Category } from '~/data/categories'

defineProps<{
  activeId: string
}>()
</script>
