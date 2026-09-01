<template>
  <div class="bg-default border border-muted rounded-2xl p-5">
    <div class="flex items-center justify-between gap-3 mb-5 flex-wrap">
      <div>
        <h3 class="font-bold text-highlighted">{{ $t('فروش هفته جاری') }}</h3>
        <p class="text-xs text-muted mt-1">
          {{ $t('مجموع') }}
          <span class="num font-medium text-toned">{{ formatPrice(total) }}</span>
          {{ $t('تومان') }}
        </p>
      </div>
    </div>

    <div class="flex items-end gap-1.5 sm:gap-2.5 h-36 sm:h-44">
      <div
        v-for="point in sales"
        :key="point.label"
        class="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1.5"
      >
        <div class="w-full flex-1 flex items-end">
          <div
            class="w-full rounded-t-lg bg-primary/80 min-h-1"
            :style="{ height: `${barHeight(point.value)}%` }"
            :title="`${point.label}: ${formatPrice(point.value)}`"
          />
        </div>
        <span class="text-[10px] text-muted truncate w-full text-center">
          {{ point.label ? $t(point.label) : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const { sales } = useSeller()

const total = computed(() =>
  sales.value.reduce((sum, point) => sum + point.value, 0),
)

const maxValue = computed(() =>
  Math.max(...sales.value.map(point => point.value), 1),
)

function barHeight(value: number) {
  return Math.max(8, Math.round((value / maxValue.value) * 100))
}
</script>
