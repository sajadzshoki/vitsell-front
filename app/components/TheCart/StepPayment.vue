<template>
  <div>
    <h2 class="font-bold text-highlighted mb-5">
      {{ $t('انتخاب روش پرداخت') }}
    </h2>
    <div
      v-if="!paymentOptions.length"
      class="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-toned leading-6"
    >
      {{ $t('در حال حاضر روش پرداخت فعالی تعریف نشده است. با پشتیبانی فروشگاه تماس بگیرید.') }}
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <button
        v-for="option in paymentOptions"
        :key="option.id"
        type="button"
        class="w-full flex items-center gap-4 p-4 rounded-2xl border text-start cursor-pointer transition"
        :class="paymentMethod === option.id
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-accented'"
        @click="paymentMethod = option.id"
      >
        <span
          class="size-4 rounded-full border-2 shrink-0 grid place-items-center"
          :class="paymentMethod === option.id ? 'border-primary' : 'border-accented'"
        >
          <span
            v-if="paymentMethod === option.id"
            class="size-2 rounded-full bg-primary"
          />
        </span>
        <span class="size-11 rounded-xl bg-muted grid place-items-center shrink-0">
          <UIcon
            :name="`i-tabler-${option.icon}`"
            class="size-6 text-primary"
          />
        </span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-default">
            {{ $t(option.name) }}
          </div>
          <div class="text-xs text-muted mt-0.5">
            {{ $t(option.desc) }}
          </div>
        </div>
      </button>
    </div>

    <div
      v-if="paymentMethod === 'online'"
      class="mt-4 bg-muted rounded-xl p-4 flex items-center gap-4 flex-wrap"
    >
      <span class="text-xs text-muted">{{ $t('درگاه‌های پشتیبانی شده') }}:</span>
      <div class="flex items-center gap-3 text-xs font-bold text-dimmed">
        <template
          v-for="(g, i) in checkoutGateways"
          :key="g"
        >
          <span>{{ $t(g) }}</span>
          <span
            v-if="i < checkoutGateways.length - 1"
            class="text-accented"
          >•</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkoutGateways } from '~/data/checkout'

const store = useCheckoutStore()
const { paymentMethod, paymentOptions } = storeToRefs(store)
</script>
