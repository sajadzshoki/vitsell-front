<template>
  <section class="relative w-screen max-w-[100vw] ms-[calc(50%-50vw)] -mt-4">
    <UCarousel
      v-slot="{ item }"
      :items="slides"
      loop
      arrows
      dots
      fade
      :autoplay="{ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }"
      prev-icon="i-tabler-chevron-right"
      next-icon="i-tabler-chevron-left"
      :prev="{ color: 'neutral', variant: 'solid', size: 'lg' }"
      :next="{ color: 'neutral', variant: 'solid', size: 'lg' }"
      class="w-full overflow-hidden"
      :ui="{
        item: 'basis-full ps-0',
        container: 'ms-0',
        prev: 'start-3 md:start-5 sm:start-3 z-20',
        next: 'end-3 md:end-5 sm:end-3 z-20',
        dots: 'bottom-4 md:bottom-6 z-20 gap-2',
        dot: 'size-2 bg-default/50 data-[state=active]:bg-default data-[state=active]:w-8 rounded-full transition-all',
      }"
    >
      <div
        class="relative overflow-hidden"
        :class="toneClass(item.tone)"
      >
        <div class="absolute inset-0">
          <img
            :src="item.image"
            :alt="$t(item.title)"
            class="size-full object-cover opacity-35 md:opacity-45"
            loading="lazy"
          >
          <div
            class="absolute inset-0 bg-gradient-to-l opacity-70"
            :class="toneGradient(item.tone)"
          />
        </div>

        <div class="relative z-10 mx-auto max-w-8xl grid grid-cols-1 md:grid-cols-2 items-center min-h-[380px] md:min-h-[440px] px-4 sm:px-6 lg:px-8">
          <div class="py-10 md:py-0">
            <span
              class="inline-flex items-center gap-2 bg-default/10 backdrop-blur px-3 py-1.5 rounded-full text-xs mb-4 border border-default/10 text-inverted"
            >
              <span class="size-1.5 rounded-full bg-current animate-pulse" />
              {{ $t(item.eyebrow) }}
            </span>

            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 text-inverted">
              {{ $t(item.title) }}
            </h1>

            <p class="text-inverted/80 text-sm md:text-base leading-7 mb-7 max-w-md">
              {{ $t(item.subtitle) }}
            </p>

            <div class="flex items-center gap-3 flex-wrap">
              <UButton
                :to="item.to"
                color="neutral"
                variant="solid"
                size="xl"
                trailing-icon="i-tabler-arrow-left"
                class="bg-default text-highlighted hover:bg-elevated font-bold shadow-lg"
              >
                {{ $t(item.cta) }}
              </UButton>

              <div
                v-if="item.discount"
                class="h-12 px-4 rounded-xl bg-default/10 backdrop-blur border border-default/15 flex items-center gap-2 text-inverted"
              >
                <span class="text-xs text-inverted/70">{{ $t('تا') }}</span>
                <span class="text-lg font-black num">{{ item.discount.toLocaleString('fa-IR') }}٪</span>
                <span class="text-xs text-inverted/70">{{ $t('تخفیف') }}</span>
              </div>
            </div>
          </div>

          <div class="relative h-56 md:h-full min-h-[220px] flex items-center justify-center order-first md:order-last">
            <UIcon
              :name="`i-tabler-${item.icon}`"
              class="size-40 md:size-64 text-inverted opacity-90 drop-shadow-2xl"
            />
          </div>
        </div>

        <div class="absolute -bottom-20 -end-20 size-80 rounded-full bg-default/5 pointer-events-none" />
        <div class="absolute top-10 end-40 size-40 rounded-full bg-default/5 hidden md:block pointer-events-none" />
      </div>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
import { heroSlides, type HeroSlideTone } from '~/data/hero'

const slides = heroSlides

const toneClass = (tone: HeroSlideTone) => {
  const map: Record<HeroSlideTone, string> = {
    inverted: 'bg-inverted text-inverted',
    primary: 'bg-primary text-inverted',
    secondary: 'bg-secondary text-inverted',
    success: 'bg-success text-inverted',
  }
  return map[tone]
}

const toneGradient = (tone: HeroSlideTone) => {
  const map: Record<HeroSlideTone, string> = {
    inverted: 'from-inverted via-inverted/80 to-transparent',
    primary: 'from-primary via-primary/80 to-transparent',
    secondary: 'from-secondary via-secondary/80 to-transparent',
    success: 'from-success via-success/80 to-transparent',
  }
  return map[tone]
}
</script>
