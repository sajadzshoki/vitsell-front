<template>
  <section class="relative overflow-hidden rounded-3xl border border-muted bg-default">
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-56 md:min-h-72">
      <div class="flex flex-col justify-center p-6 sm:p-8 lg:p-10 order-2 md:order-1">
        <span class="text-xs font-semibold text-primary mb-2">
          {{ $t(hero.eyebrow) }}
        </span>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-highlighted mb-3">
          {{ $t(hero.title) }}
        </h1>
        <p class="text-sm text-muted leading-7 max-w-lg mb-5">
          {{ $t(hero.subtitle) }}
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <UButton
            :to="searchRoute"
            color="primary"
            size="lg"
            trailing-icon="i-tabler-arrow-left"
            class="font-bold"
          >
            {{ $t('مشاهده همه محصولات') }}
          </UButton>
          <p class="text-xs text-dimmed num">
            {{ productCount.toLocaleString('fa-IR') }} {{ $t('کالا') }}
          </p>
        </div>
      </div>

      <div class="relative order-1 md:order-2 min-h-48 md:min-h-full bg-muted">
        <img
          :src="hero.image"
          :alt="hero.title"
          class="absolute inset-0 size-full object-cover"
          loading="eager"
        >
        <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-default/80 via-default/20 to-transparent" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CategoryPageMeta } from '~/data/category-pages'

defineProps<{
  hero: CategoryPageMeta['hero']
  productCount: number
  searchRoute: string | { path: string, query?: Record<string, string> }
}>()
</script>
