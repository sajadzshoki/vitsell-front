<template>
  <div class="bg-default border border-muted rounded-2xl p-5 lg:sticky lg:top-36 space-y-4">
    <h3 class="font-bold text-highlighted">
      {{ $t('خلاصه سفارش') }}
    </h3>

    <div>
      <label class="text-xs text-muted mb-2 block">
        {{ $t('کد تخفیف دارید؟') }}
      </label>
      <div class="flex gap-2 items-center">
        <UInput
          v-model="code"
          :placeholder="$t('مثال: BAZAR10')"
          size="md"
          class="flex-1"
          :ui="{ base: 'uppercase' }"
          @keydown.enter="onApply"
        />
        <UButton
          type="button"
          color="neutral"
          variant="solid"
          size="md"
          class="shrink-0 bg-inverted text-inverted hover:bg-inverted/90"
          @click="onApply"
        >
          {{ $t('اعمال') }}
        </UButton>
      </div>
      <p
        v-if="codeMsg"
        class="text-[11px] mt-2"
        :class="codeMsg.ok ? 'text-success' : 'text-error'"
      >
        {{ $t(codeMsg.text) }}
      </p>
      <div
        v-if="discountCode"
        class="mt-2 flex items-center justify-between bg-success/10 text-success rounded-xl px-3 py-2 text-xs"
      >
        <span>
          {{ $t('کد فعال') }}:
          <b class="num">{{ discountCode }}</b>
        </span>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-tabler-x"
          class="text-success hover:text-error"
          :aria-label="$t('حذف کد تخفیف')"
          @click="onClearDiscount"
        />
      </div>
    </div>

    <div class="border-t border-muted pt-4 space-y-2.5">
      <div class="flex items-baseline justify-between">
        <span class="text-xs text-muted">
          {{ $t('قیمت کالاها') }}
          ({{ itemCount.toLocaleString('fa-IR') }})
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
    </div>

    <div class="border-t border-muted pt-4 flex items-baseline justify-between">
      <span class="text-sm text-muted">{{ $t('مبلغ قابل پرداخت') }}</span>
      <div class="flex items-baseline gap-1">
        <span class="text-xl font-black text-highlighted num">
          {{ formatPrice(total) }}
        </span>
        <span class="text-xs text-muted">{{ currencyLabel }}</span>
      </div>
    </div>

    <p
      v-if="taxHint"
      class="text-[11px] text-dimmed text-center"
    >
      {{ taxHint }}
    </p>

    <div class="hidden md:block">
      <UButton
        type="button"
        color="primary"
        size="xl"
        class="font-bold shadow-lg shadow-primary/25 w-full"
        trailing-icon="i-tabler-arrow-left"
        @click="emit('next')"
      >
        {{ $t('ثبت سفارش') }}
      </UButton>
    </div>

    <p class="text-[11px] text-dimmed text-center leading-6">
      {{ $t('با ثبت سفارش،') }}
      <NuxtLink
        to="/terms"
        class="!text-primary underline hover:scale-105"
      >
        {{ $t('شرایط استفاده') }}
      </NuxtLink>
      {{ $t('را می‌پذیرم.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const emit = defineEmits<{
  next: []
}>()

const { t } = useI18n()
const store = useCheckoutStore()
const { shippingCost } = storeToRefs(store)
const { currencyLabel, site } = useSiteSettings()

const {
  cartSubtotal,
  cartLines,
  discountCode,
  discountAmount,
  applyDiscount,
  clearDiscount,
} = useShop()

const code = ref('')
const codeMsg = ref<{ ok: boolean, text: string } | null>(null)

const itemCount = computed(() => cartLines.value.length)

const total = computed(() =>
  Math.max(0, cartSubtotal.value - discountAmount.value + shippingCost.value),
)

const taxHint = computed(() => {
  if (site.value.taxDisplay === 'exclusive') return t('مالیات در قیمت لحاظ نشده است')
  if (site.value.taxDisplay === 'none') return t('بدون مالیات')
  return ''
})

function onApply() {
  if (!code.value.trim()) return
  const ok = applyDiscount(code.value)
  codeMsg.value = {
    ok,
    text: ok ? 'کد تخفیف با موفقیت اعمال شد' : 'کد تخفیف نامعتبر است',
  }
  if (ok) code.value = ''
}

function onClearDiscount() {
  clearDiscount()
  codeMsg.value = null
}
</script>
