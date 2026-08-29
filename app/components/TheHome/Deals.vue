<template>
  <section>
    <div class=" rounded-3xl overflow-hidden border-primary/50 border ">
      <div class="px-5 py-4 flex items-center justify-between gap-3 text-inverted bg-primary border-primary border ">
        <div class="flex items-center gap-3 min-w-0">
          <UIcon name="i-tabler-bolt-filled" class="size-6 text-warning shrink-0" />
          <div class="min-w-0">
            <div class="font-bold text-sm md:text-base text-white  truncate">
              {{ $t('پیشنهاد شگفت‌انگیز') }}
            </div>
            <div class="text-[11px] text-inverted/80  text-white truncate">
              {{ $t('فقط برای مدت محدود') }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 num shrink-0 " dir="ltr">
          <template v-for="(part, i) in countdownParts" :key="part.key">
            <div
              class="w-9 h-9 rounded-lg  bg-default/20 backdrop-blur text-white grid place-items-center font-bold text-sm"
            >
              {{ part.value }}
            </div>
            <span
              v-if="i < countdownParts.length - 1"
              class="text-white font-bold"
            >:</span>
          </template>
        </div>
      </div>

      <div class="bg-default/80  ">
        <UCarousel
          v-slot="{ item }"
          :items="deals"
          arrows
          :prev="{ color: 'neutral', variant: 'solid', size: 'md' }"
          :next="{ color: 'neutral', variant: 'solid', size: 'md' }"
          prev-icon="i-tabler-chevron-right"
          next-icon="i-tabler-chevron-left"
          :ui="{
            item: 'basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 ps-3',
            container: 'ms-0 p-4',
            prev: 'start-1 sm:start-2 z-20',
            next: 'end-1 sm:end-2 z-20',
          }"
          class="w-full"
        >
          <TheProductCard :product="item" compact />
        </UCarousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { dealsOfTheDay } from '~/data/products'

const deals = dealsOfTheDay

const remaining = ref(5 * 3600 + 42 * 60 + 18)

const toFaDigits = (value: string) =>
  value.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!)

const padFa = (n: number) => toFaDigits(String(n).padStart(2, '0'))

const countdownParts = computed(() => {
  const h = Math.floor(remaining.value / 3600)
  const m = Math.floor((remaining.value % 3600) / 60)
  const s = remaining.value % 60
  return [
    { key: 'h', value: padFa(h) },
    { key: 'm', value: padFa(m) },
    { key: 's', value: padFa(s) },
  ]
})

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    remaining.value = remaining.value > 0
      ? remaining.value - 1
      : 23 * 3600 + 59 * 60 + 59
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
