<template>
  <section v-if="articles.length">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div class="min-w-0">
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ $t('مطالب مرتبط') }}
        </h2>
        <p class="text-xs text-muted mt-1">
          {{ $t('راهنما، بررسی و اخبار از بلاگ دیجی‌شاپ') }}
        </p>
      </div>
      <UButton
        :to="viewAllRoute"
        color="primary"
        variant="link"
        size="sm"
        trailing-icon="i-tabler-arrow-left"
        class="font-medium shrink-0"
      >
        {{ $t('مشاهده همه') }}
      </UButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="article in articles"
        :key="article.id"
        :to="article.to"
        class="group bg-default border border-muted rounded-2xl overflow-hidden transition-all  hover:(border-primary/40 shadow-sm)"
      >
        <div class="aspect-[16/10] bg-muted overflow-hidden">
          <img
            :src="article.image"
            :alt="article.title"
            class="size-full object-cover transition-all duration-400 group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <div class="p-4">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full <md:hidden">
              {{ $t(article.category) }}
            </span>
            <span class="text-[11px] text-dimmed">
              {{ $t(article.readTime) }}
            </span>
          </div>
          <h3 class="text-sm font-bold text-default line-clamp-2 mb-2 group-hover:text-primary transition">
            {{ $t(article.title) }}
          </h3>
          <p class="text-xs text-muted leading-6 line-clamp-2">
            {{ $t(article.excerpt) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
export type RelatedArticleItem = {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  readTime: string
  to: string
}

defineProps<{
  articles: RelatedArticleItem[]
  viewAllRoute: string
}>()
</script>
