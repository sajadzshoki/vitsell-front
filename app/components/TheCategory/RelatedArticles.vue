<template>
  <section>
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-base md:text-lg font-bold text-highlighted">
        {{ $t('مطالب مرتبط') }}
      </h2>
      <span class="text-xs text-dimmed">
        {{ $t('به‌زودی') }}
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-for="article in articles" :key="article.id">
        <NuxtLink
          v-if="article.to"
          :to="article.to"
          class="group bg-default border border-muted rounded-2xl overflow-hidden transition hover:(border-primary/40 shadow-sm)"
        >
          <div class="aspect-[16/10] bg-muted overflow-hidden">
            <img
              :src="article.image"
              :alt="article.title"
              class="size-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            >
          </div>
          <div class="p-4">
            <h3 class="text-sm font-bold text-default line-clamp-2 mb-2 group-hover:text-primary transition">
              {{ $t(article.title) }}
            </h3>
            <p class="text-xs text-muted leading-6 line-clamp-3">
              {{ $t(article.excerpt) }}
            </p>
          </div>
        </NuxtLink>
        <article
          v-else
          class="bg-default border border-muted rounded-2xl overflow-hidden"
        >
          <div class="aspect-[16/10] bg-muted overflow-hidden">
            <img
              :src="article.image"
              :alt="article.title"
              class="size-full object-cover"
              loading="lazy"
            >
          </div>
          <div class="p-4">
            <h3 class="text-sm font-bold text-default line-clamp-2 mb-2">
              {{ $t(article.title) }}
            </h3>
            <p class="text-xs text-muted leading-6 line-clamp-3">
              {{ $t(article.excerpt) }}
            </p>
          </div>
        </article>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CategoryArticle } from '~/data/category-pages'

defineProps<{
  articles: CategoryArticle[]
}>()
</script>
