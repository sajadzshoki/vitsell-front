<template>
  <article class="flex flex-col gap-6 md:gap-8">
    <nav class="text-xs text-muted flex items-center gap-2 flex-wrap">
      <NuxtLink
        to="/"
        class="hover:text-primary transition cursor-pointer"
      >
        {{ $t('خانه') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <NuxtLink
        :to="blogIndexPath"
        class="hover:text-primary transition cursor-pointer"
      >
        {{ $t('بلاگ') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned line-clamp-1">
        {{ $t(post.title) }}
      </span>
    </nav>

    <div class="bg-default border border-muted rounded-2xl overflow-hidden">
      <div class="relative aspect-[21/9] md:aspect-[2.4/1] bg-muted overflow-hidden">
        <img
          v-if="post.image"
          :src="post.image"
          :alt="post.title"
          class="size-full object-cover"
        >
        <div
          v-else
          class="size-full grid place-items-center"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-16 opacity-60"
          />
        </div>
        <div
          v-if="post.popular"
          class="absolute top-4 start-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-error text-inverted text-[11px] font-medium px-3 py-1"
        >
          <UIcon
            name="i-tabler-heart-filled"
            class="size-3.5"
          />
          {{ $t('مورد علاقه کاربران') }}
        </div>
      </div>

      <div class="p-5 md:p-8">
        <div class="flex items-center gap-2 flex-wrap mb-3">
          <NuxtLink
            :to="{ path: blogIndexPath, query: { category: post.category } }"
            class="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-primary/15 transition"
          >
            {{ $t(post.category) }}
          </NuxtLink>
          <span class="text-[11px] text-dimmed num">
            {{ $t(post.date) }}
          </span>
          <span class="text-[11px] text-dimmed">
            · {{ $t(post.readTime) }}
          </span>
          <span
            v-if="(post.engagement ?? 0) > 0"
            class="inline-flex items-center gap-1 text-[11px] text-dimmed num"
          >
            ·
            <UIcon
              name="i-tabler-flame"
              class="size-3.5 text-warning"
            />
            {{ (post.engagement ?? 0).toLocaleString('fa-IR') }}
          </span>
        </div>

        <h1 class="text-xl md:text-2xl font-bold text-highlighted leading-8 mb-3">
          {{ $t(post.title) }}
        </h1>

        <p class="text-sm text-muted mb-6">
          {{ $t('نویسنده') }}: {{ $t(post.author) }}
        </p>

        <p
          v-if="post.excerpt"
          class="text-sm md:text-base text-toned leading-8 mb-6 p-4 rounded-xl bg-muted/50 border border-muted"
        >
          {{ $t(post.excerpt) }}
        </p>

        <div class="flex flex-col gap-4 text-sm md:text-base text-toned leading-8">
          <p
            v-for="(paragraph, index) in post.content"
            :key="index"
          >
            {{ $t(paragraph) }}
          </p>
        </div>

        <div
          v-if="post.highlights?.length"
          class="mt-8 p-4 md:p-5 rounded-xl bg-muted/40 border border-muted"
        >
          <h2 class="text-sm font-bold text-highlighted mb-3 flex items-center gap-2">
            <UIcon
              name="i-tabler-list-check"
              class="size-4 text-primary"
            />
            {{ $t('نکات کلیدی') }}
          </h2>
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="(item, index) in post.highlights"
              :key="index"
              class="flex items-start gap-2.5 text-sm text-toned leading-7"
            >
              <UIcon
                name="i-tabler-circle-check"
                class="size-4 text-primary shrink-0 mt-1"
              />
              <span>{{ $t(item) }}</span>
            </li>
          </ul>
        </div>

        <div
          v-if="categoryLinks.length"
          class="mt-8 flex flex-wrap items-center gap-2"
        >
          <span class="text-xs text-muted">
            {{ $t('دسته‌های مرتبط') }}:
          </span>
          <UButton
            v-for="cat in categoryLinks"
            :key="cat.id"
            :to="toSearchRoute({ category: cat.id })"
            color="primary"
            variant="soft"
            size="xs"
          >
            {{ $t(cat.name) }}
          </UButton>
        </div>
      </div>
    </div>

    <section v-if="morePosts.length">
      <div class="flex items-center justify-between mb-4 gap-3">
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ $t('مطالب بیشتر') }}
        </h2>
        <UButton
          :to="blogIndexPath"
          color="primary"
          variant="link"
          size="sm"
          trailing-icon="i-tabler-arrow-left"
          class="font-medium shrink-0"
        >
          {{ $t('مشاهده همه') }}
        </UButton>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TheBlogPostCard
          v-for="item in morePosts"
          :key="item.id"
          :post="item"
        />
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { getCategoryById, toSearchRoute } from '~/data/categories'
import {
  staticPagePaths,
  type StaticBlogPost,
} from '~/data/static-pages'

const props = defineProps<{
  post: StaticBlogPost
  morePosts?: StaticBlogPost[]
}>()

const blogIndexPath = staticPagePaths.blog

const morePosts = computed(() => props.morePosts ?? [])

const categoryLinks = computed(() =>
  (props.post.relatedCategories ?? [])
    .map(id => getCategoryById(id))
    .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat)),
)
</script>
