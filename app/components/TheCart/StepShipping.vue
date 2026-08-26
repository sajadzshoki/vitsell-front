<template>
  <div>
    <h2 class="font-bold text-highlighted mb-5">
      {{ $t('انتخاب روش ارسال') }}
    </h2>
    <div class="space-y-3">
      <button
        v-for="option in checkoutShippingOptions"
        :key="option.id"
        type="button"
        class="w-full flex items-center gap-4 p-4 rounded-2xl border text-start cursor-pointer transition"
        :class="shippingMethod === option.id
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-accented'"
        @click="shippingMethod = option.id"
      >
        <span
          class="size-4 rounded-full border-2 shrink-0 grid place-items-center"
          :class="shippingMethod === option.id ? 'border-primary' : 'border-accented'"
        >
          <span
            v-if="shippingMethod === option.id"
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
        <div class="text-sm font-bold num shrink-0">
          <span
            v-if="option.price === 0"
            class="text-success"
          >{{ $t('رایگان') }}</span>
          <span v-else>{{ formatPrice(option.price) }} {{ $t('تومان') }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkoutShippingOptions } from '~/data/checkout'
import { formatPrice } from '~/data/products'

const store = useCheckoutStore()
const { shippingMethod } = storeToRefs(store)
</script>
