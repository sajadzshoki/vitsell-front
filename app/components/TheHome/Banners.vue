<template>
  <section v-if="items.length">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <NuxtLink
        v-for="banner in items"
        :key="banner.id"
        :to="banner.to"
        class="group relative overflow-hidden rounded-2xl min-h-36 md:min-h-40 cursor-pointer"
      >
        <img
          :src="banner.image"
          :alt="$t(banner.title)"
          class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        >
        <div
          class="absolute inset-0 opacity-90"
          :class="toneOverlay(banner.tone)"
        />
        <div class="relative z-10 h-full flex flex-col justify-end p-4 md:p-5 text-inverted">
          <h3 class="text-base md:text-lg font-bold leading-snug">
            {{ $t(banner.title) }}
          </h3>
          <p
            v-if="banner.subtitle"
            class="text-xs md:text-sm text-inverted/85 mt-1"
          >
            {{ $t(banner.subtitle) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeBanner } from '~/data/home'

const props = defineProps<{
  items: HomeBanner[]
}>()

const toneOverlay = (tone: HomeBanner['tone']) => {
  const map: Record<HomeBanner['tone'], string> = {
    primary: 'bg-primary/80',
    secondary: 'bg-secondary/80',
    warning: 'bg-warning/80',
    success: 'bg-success/80',
    inverted: 'bg-inverted/75',
  }
  return map[tone]
}
</script>
