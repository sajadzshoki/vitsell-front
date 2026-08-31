<template>
  <section>
    <div class="bg-default border border-muted rounded-3xl p-4 md:p-6">
      <div class="flex items-center justify-between mb-5 gap-3">
        <div>
          <h2 class="text-base md:text-lg font-bold text-highlighted">
            {{ $t('دسته‌بندی‌های محبوب') }}
          </h2>
          <p class="text-xs text-muted mt-1">
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

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="toSearchRoute({ category: category.id })"
          class="group flex flex-col items-center gap-2.5 cursor-pointer"
        >
          <div
            class="relative w-full aspect-square rounded-3xl bg-muted overflow-hidden border border-muted transition duration-300 group-hover:(border-primary/30 shadow-md bg-primary/5)"
          >
            <img
              :src="imageFor(category)"
              :alt="$t(category.name)"
              class="absolute inset-0 size-full object-contain p-4 md:p-5 transition duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            >
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-default/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"
            />
          </div>
          <span
            class="text-xs sm:text-sm font-medium text-toned text-center leading-snug group-hover:text-primary transition"
          >
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

const { categories } = useHome()

function imageFor(category: Category) {
  return getCategoryImage(category.id, category.image)
}
</script>
