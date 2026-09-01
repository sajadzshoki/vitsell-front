<template>
  <section
    v-if="(pending || !loaded) && !slides.length"
    class="relative w-screen max-w-[100vw] ms-[calc(50%-50vw)] -mt-4"
  >
    <TheSkeleton variant="hero" />
  </section>

  <section
    v-else-if="slides.length"
    class="select-none relative w-screen max-w-[100vw] ms-[calc(50%-50vw)] -mt-4 [--ui-bg-inverted:var(--ui-color-neutral-950)] [--ui-text-inverted:var(--ui-color-neutral-50)] [--ui-bg:var(--ui-color-neutral-50)] [--ui-bg-elevated:var(--ui-color-neutral-100)] [--ui-text-highlighted:var(--ui-color-neutral-900)] [--ui-text:var(--ui-color-neutral-800)]"
  >
    <UCarousel
      v-slot="{ item, index }"
      :items="slides"
      loop
      fade
      arrows
      dots
      :autoplay="{ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }"
      prev-icon="i-tabler-chevron-right"
      next-icon="i-tabler-chevron-left"
      :prev="{ color: 'neutral', variant: 'solid', size: 'lg' }"
      :next="{ color: 'neutral', variant: 'solid', size: 'lg' }"
      class="w-full overflow-hidden"
      :ui="{
        item: 'basis-full min-w-full ps-0',
        container: 'ms-0',
        prev: 'start-3 md:start-5 z-20',
        next: 'end-3 md:end-5 z-20',
        dots: 'bottom-4 md:bottom-6 z-20 gap-2',
        dot: 'size-2 bg-default/50 data-[state=active]:bg-default data-[state=active]:w-8 rounded-full transition-all',
      }"
    >
      <div class="relative overflow-hidden min-h-[380px] md:min-h-[440px] bg-inverted">
        <img
          :src="item.image"
          :alt="$t(item.title)"
          class="absolute inset-0 size-full object-cover object-center"
          loading="eager"
          decoding="async"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
        >

        <div
          v-if="item.tone !== 'inverted'"
          class="absolute inset-0 opacity-20 pointer-events-none"
          :class="toneClass(item.tone)"
        />

        <div class="absolute inset-0 bg-inverted/55 md:bg-inverted/25 pointer-events-none" />
        <div
          class="absolute inset-0 pointer-events-none bg-[linear-gradient(to_inline-end,var(--ui-bg-inverted)_0%,color-mix(in_srgb,var(--ui-bg-inverted)_78%,transparent)_40%,transparent_76%)]"
        />

        <div class="relative z-10 mx-auto max-w-8xl grid grid-cols-1 md:grid-cols-2 items-center min-h-[380px] md:min-h-[440px] px-4 sm:px-6 lg:px-8">
          <div class="py-10 md:py-0">
            <span
              class="inline-flex items-center gap-2 bg-default/15 backdrop-blur px-3 py-1.5 rounded-full text-xs mb-4 border border-default/15 text-inverted"
            >
              <span class="size-1.5 rounded-full bg-current animate-pulse" />
              {{ $t(item.eyebrow) }}
            </span>

            <component
              :is="index === 0 ? 'h1' : 'h2'"
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 text-inverted drop-shadow-sm"
            >
              {{ $t(item.title) }}
            </component>

            <p class="text-inverted/90 text-sm md:text-base leading-7 mb-7 max-w-md">
              {{ $t(item.subtitle) }}
            </p>

            <div class="flex items-center gap-3 flex-wrap">
              <UButton
                :to="item.to"
                color="neutral"
                variant="outline"
                size="xl"
                trailing-icon="i-tabler-arrow-left"
                :ui="{
                  base: 'h-12 rounded-xl font-bold shadow-lg border-default/20 bg-default text-highlighted dark:text-black hover:bg-elevated',
                }"
              >
                {{ $t(item.cta) }}
              </UButton>

              <div
                v-if="item.discount"
                class="h-12 px-4 rounded-xl bg-default/15 backdrop-blur border border-default/15 flex items-center gap-2 text-inverted"
              >
                <span class="text-xs text-inverted/80">{{ $t('تا') }}</span>
                <span class="text-lg font-black num">{{ item.discount.toLocaleString('fa-IR') }}٪</span>
                <span class="text-xs text-inverted/80">{{ $t('تخفیف') }}</span>
              </div>
            </div>
          </div>

          <div class="relative h-56 md:h-full min-h-[240px] flex items-center justify-center order-first md:order-last p-6">
            <img
              :src="item.image"
              :alt="$t(item.title)"
              class="max-h-52 md:max-h-80 w-auto max-w-full object-contain drop-shadow-2xl rounded-2xl"
              loading="eager"
              decoding="async"
            >
          </div>
        </div>
      </div>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
import type { HeroSlideTone } from '~/data/hero'

const { heroSlides: slides, pending, loaded } = useHome()

const toneClass = (tone: HeroSlideTone) => {
  if (tone === 'inverted') return ''
  return { primary: 'bg-primary', secondary: 'bg-secondary', success: 'bg-success' }[tone]
}
</script>
