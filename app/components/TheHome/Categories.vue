<template>
  <section v-if="(pending || !loaded) && !categories.length">
    <TheSkeleton variant="category" />
  </section>

  <section v-else-if="categories.length">
    <div class="bg-default border border-muted rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6">
      <div class="flex items-center justify-between mb-3 sm:mb-5 gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <UIcon
              name="i-tabler-layout-grid"
              class="size-4 sm:size-5 text-primary shrink-0"
            />
            <h2 class="text-sm sm:text-base md:text-lg font-bold text-highlighted truncate">
              {{ $t('دسته‌بندی‌های محبوب') }}
            </h2>
          </div>
          <p class="text-[11px] sm:text-xs text-muted mt-0.5 sm:mt-1 line-clamp-1">
            {{ $t('از میان دسته‌های پرمخاطب انتخاب کنید') }}
          </p>
        </div>
        <UButton
          to="/category"
          color="primary"
          variant="link"
          size="sm"
          trailing-icon="i-tabler-arrow-left"
          class="font-medium shrink-0"
        >
          {{ $t('مشاهده همه') }}
        </UButton>
      </div>

      <!-- Mobile: horizontal strip -->
      <div class="sm:hidden">
        <TheCarousel
          v-slot="{ item }"
          :items="previewCategories"
          arrows
          :per-view="[4, 4, 4, 4, 4]"
          align="start"
          :slides-to-scroll="3"
          prev-icon="i-tabler-chevron-right"
          next-icon="i-tabler-chevron-left"
          :prev="{ color: 'neutral', variant: 'solid', size: 'sm' }"
          :next="{ color: 'neutral', variant: 'solid', size: 'sm' }"
          class="w-full"
          :ui="{
            item: 'basis-[22%] ps-2',
            container: 'ms-0 items-start',
            viewport: 'md:px-7 -mx-3',
            prev: 'start-0 z-20 shadow-sm',
            next: 'end-0 z-20 shadow-sm',
          }"
        >
          <NuxtLink
            :to="toSearchRoute({ category: item.id })"
            class="group flex flex-col items-center gap-1.5 cursor-pointer w-full"
          >
            <div
              class="relative size-14 mx-auto rounded-full bg-primary/10 overflow-hidden border border-muted ring-0 transition-all duration-300 group-hover:(border-primary/40 ring-4 ring-primary/10 bg-primary/12 shadow-sm)"
            >
              <img
                :src="imageFor(item)"
                :alt="$t(item.name)"
                class="absolute inset-0 size-full object-cover p-1.5 transition-all  duration-300 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              >
            </div>
            <span class="text-[10px] font-medium text-toned text-center leading-tight line-clamp-2 w-full group-hover:text-primary transition">
              {{ $t(item.name) }}
            </span>
          </NuxtLink>
        </TheCarousel>
      </div>

      <!-- Tablet / desktop grid -->
      <div class="hidden sm:grid grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
        <NuxtLink
          v-for="category in previewCategories"
          :key="category.id"
          :to="toSearchRoute({ category: category.id })"
          class="group flex flex-col items-center gap-2 cursor-pointer"
        >
          <div
            class="relative size-20 md:size-[4.75rem] lg:size-[5.25rem] mx-auto rounded-full bg-primary/10 overflow-hidden border border-muted transition-all duration-300 group-hover:(border-primary/40 ring-4 ring-primary/10 bg-primary/12 shadow-md)"
          >
            <img
              :src="imageFor(category)"
              :alt="$t(category.name)"
              class="absolute inset-0 size-full object-cover p-2.5 md:p-3 transition-all  duration-300 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            >
          </div>
          <span class="text-xs md:text-sm font-medium text-toned text-center leading-snug line-clamp-2 group-hover:text-primary transition">
            {{ $t(category.name) }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Category } from '~/data/categories'
import { toSearchRoute } from '~/data/categories'
import { getCategoryImage } from '~/data/category-pages'

const PREVIEW_LIMIT = 10

const { categories, pending, loaded } = useHome()

const previewCategories = computed(() => categories.value.slice(0, PREVIEW_LIMIT))

function imageFor(category: Category) {
  return getCategoryImage(category.id, category.image)
}
</script>
