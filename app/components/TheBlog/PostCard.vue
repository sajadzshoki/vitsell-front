<template>
  <NuxtLink
    :to="getBlogPostPath(post.id)"
    class="group flex flex-col bg-default border border-muted rounded-2xl overflow-hidden transition cursor-pointer hover:(border-primary/40 shadow-sm)"
    :class="featured ? 'md:flex-row md:min-h-72' : ''"
  >
    <div
      class="relative bg-muted overflow-hidden shrink-0"
      :class="featured
        ? 'aspect-[16/10] md:(aspect-auto w-[48%] min-h-72)'
        : 'aspect-[16/10]'"
    >
      <img
        v-if="post.image"
        :src="post.image"
        :alt="post.title"
        class="size-full object-cover transition duration-500 group-hover:scale-105"
        :loading="featured ? 'eager' : 'lazy'"
      >
      <div
        v-else
        class="size-full grid place-items-center"
      >
        <TheIcon
          icon-type="img"
          name="noImage.png"
          class="size-12 opacity-60"
        />
      </div>

      <div
        v-if="post.popular"
        class="absolute top-3 start-3 z-10 size-9 rounded-full bg-error text-inverted grid place-items-center shadow-sm"
        :title="$t('مورد علاقه کاربران')"
      >
        <UIcon
          name="i-tabler-heart-filled"
          class="size-4"
        />
      </div>
    </div>

    <div
      class="flex flex-col flex-1 min-w-0 p-4"
      :class="featured ? 'md:(p-6 justify-center)' : ''"
    >
      <div class="flex items-center gap-2 flex-wrap mb-2">
        <span class="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
          {{ $t(post.category) }}
        </span>
        <span
          v-if="post.date"
          class="text-[11px] text-dimmed num"
        >
          {{ $t(post.date) }}
        </span>
      </div>

      <h3
        class="font-bold text-highlighted leading-7 transition group-hover:text-primary"
        :class="featured ? 'text-lg md:text-xl line-clamp-3 mb-2' : 'text-sm line-clamp-2 mb-1.5'"
      >
        {{ $t(post.title) }}
      </h3>

      <p
        class="text-sm text-toned leading-7 flex-1"
        :class="featured ? 'line-clamp-3 md:line-clamp-4' : 'line-clamp-2'"
      >
        {{ $t(post.excerpt) }}
      </p>

      <div class="mt-3 pt-3 border-t border-muted flex items-center justify-between gap-3">
        <span class="text-[11px] text-muted">
          {{ $t('زمان مطالعه') }}: {{ $t(post.readTime) }}
        </span>
        <span
          v-if="(post.engagement ?? 0) > 0"
          class="inline-flex items-center gap-1 text-[11px] text-muted num"
          :title="$t('تعداد تعامل')"
        >
          <UIcon
            name="i-tabler-flame"
            class="size-3.5"
            :class="(post.engagement ?? 0) >= 80 ? 'text-warning' : 'text-dimmed'"
          />
          {{ (post.engagement ?? 0).toLocaleString('fa-IR') }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { getBlogPostPath, type StaticBlogPost } from '~/data/static-pages'

defineProps<{
  post: StaticBlogPost
  featured?: boolean
}>()
</script>
