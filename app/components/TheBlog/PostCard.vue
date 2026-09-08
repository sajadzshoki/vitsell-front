<template>
  <NuxtLink
    :to="getBlogPostPath(post.id)"
    class="group cursor-pointer text-start"
    :class="rootClass"
  >
    <div
      class="relative bg-muted overflow-hidden shrink-0 "
      :class="mediaClass"
    >
      <img
        v-if="post.image"
        :src="post.image"
        :alt="$t(post.title)"
        class="size-full object-cover transition-all duration-300  group-hover:scale-105"
        :loading="variant === 'featured' ? 'eager' : 'lazy'"
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

      <span
        v-if="post.readTime"
        class="absolute top-2.5 start-2.5 z-10 rounded-lg bg-inverted/70 text-inverted text-[11px] font-medium px-2.5 py-1 backdrop-blur-sm"
      >
        {{ $t('مطالعه') }} {{ $t(post.readTime) }}
      </span>
    </div>

    <div
      class="flex flex-col min-w-0"
      :class="bodyClass"
    >
      <time
        v-if="post.date"
        class="text-[11px] text-dimmed num mb-1.5"
      >
        {{ $t(post.date) }}
      </time>

      <h3
        class="font-bold text-highlighted leading-7 transition-all group-hover:text-primary"
        :class="titleClass"
      >
        {{ $t(post.title) }}
      </h3>

      <p
        class="text-sm text-muted leading-7"
        :class="excerptClass"
      >
        {{ $t(post.excerpt) }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { getBlogPostPath, type StaticBlogPost } from '~/data/static-pages'

const props = withDefaults(defineProps<{
  post: StaticBlogPost
  /** default = grid card; featured = large latest; side = compact horizontal */
  variant?: 'default' | 'featured' | 'side'
  /** @deprecated use variant="featured" */
  featured?: boolean
}>(), {
  variant: 'default',
  featured: false,
})

const variant = computed(() => {
  if (props.featured) return 'featured' as const
  return props.variant
})

const rootClass = computed(() => {
  if (variant.value === 'side') {
    // items-start → date/title flush with image top (Figma)
    return 'flex flex-row gap-3 items-start'
  }
  if (variant.value === 'featured') {
    return 'flex flex-col gap-3 h-full'
  }
  return 'flex flex-col gap-3'
})

const mediaClass = computed(() => {
  if (variant.value === 'side') {
    return 'h-32 sm:h-32 aspect-[16/10] rounded-xl'
  }
  if (variant.value === 'featured') {
    return 'aspect-[16/10] h-80 rounded-2xl'
  }
  return 'aspect-[16/10] rounded-xl'
})

const bodyClass = computed(() => {
  if (variant.value === 'side') return 'flex-1 py-0.5'
  return ''
})

const titleClass = computed(() => {
  if (variant.value === 'featured') return 'text-lg md:text-xl line-clamp-2 mb-2'
  if (variant.value === 'side') return 'text-sm line-clamp-2 mb-1'
  return 'text-sm md:text-base line-clamp-2 mb-1.5'
})

const excerptClass = computed(() => {
  if (variant.value === 'featured') return 'line-clamp-3 md:line-clamp-4'
  if (variant.value === 'side') return 'line-clamp-2 text-xs sm:text-sm'
  return 'line-clamp-3'
})
</script>
