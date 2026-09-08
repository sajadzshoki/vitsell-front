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
    <TheCarousel
      v-slot="{ item, index }"
      :items="slides"
      :per-view="[1, 1, 1, 1, 1]"
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
        prev: 'hidden md:flex start-5 z-20',
        next: 'hidden md:flex end-5 z-20',
        dots: 'bottom-2.5 md:bottom-6 z-20 gap-1.5 md:gap-2',
        dot: 'size-1.5 md:size-2 bg-default/50 data-[state=active]:bg-default data-[state=active]:w-5 md:data-[state=active]:w-8 rounded-full transition-all',
      }"
    >
      <div class="relative overflow-hidden h-[220px] sm:h-[280px] md:h-auto md:min-h-[440px] bg-inverted">
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

        <!-- Mobile: bottom scrim for readable text -->
        <div
          class="absolute inset-0 pointer-events-none md:hidden bg-gradient-to-t from-inverted via-inverted/70 to-inverted/10"
        />
        <!-- Desktop: light wash + side gradient for copy -->
        <div class="absolute inset-0 hidden md:block bg-inverted/25 pointer-events-none" />
        <div
          class="absolute inset-0 hidden md:block pointer-events-none bg-[linear-gradient(to_inline-end,var(--ui-bg-inverted)_0%,color-mix(in_srgb,var(--ui-bg-inverted)_78%,transparent)_40%,transparent_76%)]"
        />

        <div
          class="relative z-10 mx-auto max-w-8xl h-full md:grid md:grid-cols-2 md:items-center md:min-h-[440px] px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 md:pb-0 md:justify-center"
        >
          <div class="w-full max-w-lg md:max-w-none py-0 md:py-0">
            <span
              class="inline-flex items-center gap-1.5 md:gap-2 bg-default/15 backdrop-blur px-2.5 py-1 md:(px-3 py-1.5) rounded-full text-[10px] md:text-xs mb-2 md:mb-4 border border-default/15 text-inverted"
            >
              <span class="size-1 md:size-1.5 rounded-full bg-current animate-pulse" />
              {{ $t(item.eyebrow) }}
            </span>

            <component
              :is="index === 0 ? 'h1' : 'h2'"
              class="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-black leading-snug md:leading-tight mb-1.5 md:mb-4 text-inverted drop-shadow-sm line-clamp-2"
            >
              {{ $t(item.title) }}
            </component>

            <p class="text-inverted/90 text-xs md:text-base leading-5 md:leading-7 mb-3 md:mb-7 max-w-md line-clamp-2 md:line-clamp-none">
              {{ $t(item.subtitle) }}
            </p>

            <div class="flex items-center gap-2 md:gap-3 flex-wrap">
              <UButton
                v-if="item.to"
                :to="item.to"
                color="neutral"
                variant="outline"
                size="md"
                trailing-icon="i-tabler-arrow-left"
                class="md:h-12 md:text-base md:px-5 cursor-pointer"
                :ui="{
                  base: 'rounded-xl font-bold shadow-lg border-default/20 bg-default text-highlighted dark:text-black hover:bg-elevated',
                }"
              >
                {{ $t(item.cta || 'مشاهده') }}
              </UButton>

              <div
                v-if="slides[index]?.discount"
                class="h-9 md:h-12 px-2.5 md:px-4 rounded-lg md:rounded-xl bg-default/15 backdrop-blur border border-default/15 flex items-center gap-1.5 md:gap-2 text-inverted"
              >
                <span class="text-[10px] md:text-xs text-inverted/80">{{ $t('تا') }}</span>
                <span class="text-sm md:text-lg font-black num">{{ slides[index]!.discount!.toLocaleString('fa-IR') }}٪</span>
                <span class="text-[10px] md:text-xs text-inverted/80">{{ $t('تخفیف') }}</span>
              </div>
            </div>
          </div>

          <div class="relative hidden md:flex h-full min-h-[240px] items-center justify-center p-6">
            <img
              :src="item.image"
              :alt="$t(item.title)"
              class="max-h-80 w-auto max-w-full object-contain drop-shadow-2xl rounded-2xl"
              loading="eager"
              decoding="async"
            >
          </div>
        </div>
      </div>
    </TheCarousel>
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
