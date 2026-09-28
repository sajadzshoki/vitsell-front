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
        prev: 'hidden md:flex start-5 bottom-5 top-auto !translate-y-0 z-20 opacity-100 hover:brightness-110 !h-fit',
        next: 'hidden md:flex start-16 bottom-5 top-auto !translate-y-0 z-20 opacity-100 hover:brightness-110 !h-fit !w-fit',
        dots: 'bottom-2.5 md:bottom-6 z-20 gap-1.5 md:gap-2 ',
        dot: 'size-1.5 md:size-2 bg-default/50 data-[state=active]:bg-default data-[state=active]:w-5 md:data-[state=active]:w-8 rounded-full transition-all',
      }"
    >
      <!--
        Hero banner upload ratio: 4:1 desktop / 2:1 mobile (e.g. 1920×480).
        One full-bleed image — object-cover fills the frame.
      -->
      <div class="relative overflow-hidden w-full aspect-[4/1] <md:aspect-[3/1] bg-inverted">
        <img
          :src="item.image"
          :alt="$t(item.title)"
          class="absolute inset-0 size-full object-cover object-center"
          loading="eager"
          decoding="async"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
        >

        <div
          class="relative z-10 mx-auto max-w-8xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 md:pb-10"
        >
          <div class="w-full max-w-lg">
            <span
              class="inline-flex items-center gap-1.5 md:gap-2 bg-default/15 backdrop-blur px-2.5 py-1 md:(px-3 py-1.5) rounded-full text-[10px] md:text-xs mb-2 md:mb-3 border border-default/15 text-inverted"
            >
              <span class="size-1 md:size-1.5 rounded-full bg-current animate-pulse" />
              {{ $t(item.eyebrow) }}
            </span>

            <h2
              class="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black leading-snug md:leading-tight mb-1.5 md:mb-3 text-inverted drop-shadow-sm line-clamp-2"
            >
              {{ $t(item.title) }}
            </h2>

            <p class="text-inverted/90 text-xs md:text-base leading-5 md:leading-7 mb-3 md:mb-5 max-w-md line-clamp-2">
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
