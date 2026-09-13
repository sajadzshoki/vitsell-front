<template>
  <section v-if="(pending || !loaded) && !posts.length">
    <TheSkeleton variant="blog" />
  </section>

  <section v-else-if="posts.length">
    <div class="bg-default border border-muted rounded-2xl p-4 md:p-6">
      <div class="flex items-center justify-between mb-4 gap-3">
        <h2 class="text-base md:text-lg font-bold text-highlighted">
          {{ $t('از وبلاگ ویتسل') }}
        </h2>
        <UButton
          :to="blogPath"
          color="primary"
          variant="link"
          size="sm"
          trailing-icon="i-tabler-chevron-left"
          class="font-medium shrink-0"
        >
          {{ $t('نمایش بیشتر در بلاگ') }}
        </UButton>
      </div>

      <TheCarousel
        v-slot="{ item }"
        :items="posts"
        arrows
        :per-view="[1, 2, 3, 4, 5]"
        :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
        :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
        prev-icon="i-tabler-chevron-right"
        next-icon="i-tabler-chevron-left"
        :ui="{
          item: ' sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 ps-3 first:ps-0',
          container: 'ms-0',
          prev: 'start-0 z-20',
          next: 'end-0 z-20',
        }"
        class="w-full"
      >
        <NuxtLink
          :to="getBlogPostPath(item.id)"
          class="block relative overflow-hidden rounded-xl aspect-[4/3] w-full h-full group cursor-pointer"
        >
          <img
            :src="item.image"
            :alt="$t(item.title)"
            class="absolute inset-0 size-full object-cover transition-all duration-400 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          >
          <div class="absolute inset-x-0 bottom-0 bg-inverted/75 backdrop-blur-sm px-3 py-2.5 min-h-14 flex items-center justify-center">
            <p class="text-xs sm:text-sm text-inverted text-center line-clamp-1 font-medium leading-relaxed">
              {{ $t(item.title) }}
            </p>
          </div>
        </NuxtLink>
      </TheCarousel>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getBlogPostPath, staticPagePaths } from '~/data/static-pages'

const { homeBlogPosts: posts, pending, loaded } = useHome()
const blogPath = staticPagePaths.blog
</script>
