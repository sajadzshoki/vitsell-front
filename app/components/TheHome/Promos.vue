<template>
  <section>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="promo in promos"
        :key="promo.id"
        class="rounded-3xl p-8 text-inverted relative overflow-hidden"
        :class="toneClass(promo.tone)"
      >
        <span class="text-xs bg-default/15 backdrop-blur inline-block px-3 py-1 rounded-full mb-3">
          {{ $t(promo.eyebrow) }}
        </span>

        <h3 class="text-2xl font-bold mb-2">
          {{ $t(promo.title) }}
        </h3>

        <p class="text-sm text-inverted/80 mb-5 leading-6 max-w-md">
          {{ $t(promo.subtitle) }}
        </p>

        <div class="flex items-center gap-2 flex-wrap relative z-10">
          <UButton
            v-if="promo.primaryCta.to"
            :to="promo.primaryCta.to"
            color="neutral"
            variant="solid"
            class="bg-default !text-highlighted hover:bg-elevated font-bold"
          >
            {{ $t(promo.primaryCta.label) }}
          </UButton>
          <UButton
            v-else
            color="neutral"
            variant="solid"
            class="bg-inverted/80 text-inverted hover:bg-inverted font-medium"
          >
            {{ $t(promo.primaryCta.label) }}
          </UButton>

          <UButton
            v-if="promo.secondaryCta"
            color="neutral"
            variant="solid"
            class="bg-default text-highlighted hover:bg-elevated font-bold"
          >
            {{ $t(promo.secondaryCta.label) }}
          </UButton>
        </div>

        <UIcon
          :name="`i-tabler-${promo.icon}`"
          class="absolute -bottom-6 -start-6 size-48 opacity-20 pointer-events-none"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { homePromos, type HomePromo } from '~/data/home'

const promos = homePromos

const toneClass = (tone: HomePromo['tone']) => {
  const map: Record<HomePromo['tone'], string> = {
    primary: 'bg-primary',
    warning: 'bg-warning',
  }
  return map[tone]
}
</script>
