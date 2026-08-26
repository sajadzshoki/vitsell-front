<template>
  <div class="bg-default border border-muted rounded-2xl p-5 lg:sticky lg:top-36 space-y-3">
    <h3 class="font-bold text-highlighted pb-3 border-b border-muted">
      {{ $t('خلاصه پرداخت') }}
    </h3>

    <div class="flex items-baseline justify-between">
      <span class="text-xs text-muted">
        {{ $t('قیمت کالاها') }}
        ({{ cartLines.length.toLocaleString('fa-IR') }})
      </span>
      <span class="text-sm font-medium text-default num">
        {{ formatPrice(cartSubtotal) }}
      </span>
    </div>

    <div
      v-if="discountAmount > 0"
      class="flex items-baseline justify-between"
    >
      <span class="text-xs text-muted">{{ $t('سود شما از تخفیف') }}</span>
      <span class="text-sm font-medium text-error num">
        −{{ formatPrice(discountAmount) }}
      </span>
    </div>

    <div class="flex items-baseline justify-between">
      <span class="text-xs text-muted">{{ $t('هزینه ارسال') }}</span>
      <span
        class="text-sm font-medium num"
        :class="shippingCost === 0 ? 'text-success' : 'text-default'"
      >
        {{ shippingCost === 0 ? $t('رایگان') : formatPrice(shippingCost) }}
      </span>
    </div>

    <div class="border-t border-muted pt-3 flex items-baseline justify-between">
      <span class="text-sm text-muted">{{ $t('مبلغ قابل پرداخت') }}</span>
      <div class="flex items-baseline gap-1">
        <span class="text-lg font-black text-highlighted num">
          {{ formatPrice(total) }}
        </span>
        <span class="text-[10px] text-muted">{{ $t('تومان') }}</span>
      </div>
    </div>

    <div class="bg-success/10 rounded-xl p-3 text-[11px] text-success flex items-center gap-2">
      <UIcon
        name="i-tabler-shield-check"
        class="size-4 shrink-0"
      />
      {{ $t('پرداخت شما در بستری کاملاً امن انجام می‌شود.') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const store = useCheckoutStore()
const { shippingCost } = storeToRefs(store)

const { cartSubtotal, cartLines, discountAmount } = useShop()

const total = computed(() =>
  Math.max(0, cartSubtotal.value - discountAmount.value + shippingCost.value),
)

defineExpose({ total })
</script>
