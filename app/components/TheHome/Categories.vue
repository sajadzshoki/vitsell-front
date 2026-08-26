<template>
  <section>
    <div class="bg-default rounded-3xl p-4 md:p-6">
      <div class="flex items-center justify-between mb-5 gap-3">
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ $t('دسته‌بندی‌های محبوب') }}
        </h2>
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="toCategoryRoute(category.id)"
          class="flex flex-col items-center gap-2 p-3 pt-1 rounded-2xl transition group hover:bg-primary/5"
        >
          <div
            class="!size-14 rounded-2xl bg-muted group-hover:bg-transparent grid place-items-center text-muted group-hover:text-primary transition"
          >
            <UIcon :name="getCategoryIcon(category.id)" class="size-6" />
          </div>
          <span class="text-[11px] text-toned text-center leading-tight group-hover:text-primary transition">
            {{ $t(category.name) }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { categories, getCategoryIcon, toCategoryRoute } from '~/data/categories'
</script>
