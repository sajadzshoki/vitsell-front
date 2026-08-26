<template>
  <div
    class="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-muted bg-default/95 backdrop-blur-md px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px] shadow-inverted/10"
  >
    <div class="flex items-center gap-3 max-w-8xl mx-auto">
      <div
        v-if="showTotal"
        class="shrink-0 min-w-0"
      >
        <div class="text-[10px] text-muted leading-none mb-0.5">
          {{ $t('مبلغ قابل پرداخت') }}
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-base font-black text-highlighted num truncate">
            {{ formatPrice(total) }}
          </span>
          <span class="text-[10px] text-muted shrink-0">{{ $t('تومان') }}</span>
        </div>
      </div>

      <template v-if="step === 0">
        <UButton
          type="button"
          color="primary"
          size="xl"
          block
          class="flex-1 min-w-0 font-bold shadow-lg shadow-primary/25 h-11"
          trailing-icon="i-tabler-arrow-left"
          @click="emit('next')"
        >
          {{ $t('ادامه فرآیند خرید') }}
        </UButton>
      </template>

      <template v-else>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          square
          class="size-11 shrink-0"
          icon="i-tabler-arrow-right"
          :aria-label="$t('مرحله قبل')"
          @click="emit('prev')"
        />
        <UButton
          type="button"
          color="primary"
          size="xl"
          block
          class="flex-1 min-w-0 font-bold shadow-lg shadow-primary/25 h-11"
          :trailing-icon="step === 4 ? undefined : 'i-tabler-arrow-left'"
          :disabled="!canProceed"
          @click="emit('next')"
        >
          {{ step === 4 ? $t('ثبت نهایی سفارش') : $t('مرحله بعد') }}
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutStepId } from '~/data/checkout'
import { formatPrice } from '~/data/products'

withDefaults(defineProps<{
  step: CheckoutStepId
  total: number
  canProceed: boolean
  showTotal?: boolean
}>(), {
  showTotal: true,
})

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>
