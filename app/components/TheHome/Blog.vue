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
          item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 ps-3 first:ps-0 flex',
          container: 'ms-0 items-stretch',
          prev: 'start-0 z-20',
          next: 'end-0 z-20',
        }"
        class="w-full"
      >
        <NuxtLink
          :to="getBlogPostPath(item.id)"
          class="group relative block h-44 w-full cursor-pointer overflow-hidden rounded-xl bg-muted md:h-48"
        >
          <img
            v-if="item.image"
            :src="resolveMediaUrl(item.image)"
            :alt="$t(item.title)"
            class="absolute inset-0 size-full object-cover transition-all duration-400 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          >
          <TheIcon
            v-else
            icon-type="img"
            name="noImage.png"
            class="absolute inset-0 m-auto size-16 opacity-60"
          />
          <div class="absolute inset-x-0 bottom-0 flex h-14 items-center justify-center bg-inverted/75 px-3 backdrop-blur-sm">
            <p class="line-clamp-2 text-center text-xs font-medium leading-relaxed text-inverted sm:text-sm">
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
