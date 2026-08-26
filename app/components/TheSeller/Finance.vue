<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        v-for="card in cards"
        :key="card.label"
        class="bg-default border border-muted rounded-2xl p-4"
      >
        <div
          class="size-10 rounded-xl grid place-items-center mb-3"
          :class="card.iconWrap"
        >
          <UIcon :name="card.icon" class="size-5" />
        </div>
        <div class="text-xs text-muted mb-1">{{ $t(card.label) }}</div>
        <div class="text-lg font-black text-highlighted num">
          {{ formatPrice(card.value) }}
          <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
        </div>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h2 class="font-bold text-highlighted">{{ $t('تسویه‌حساب‌ها') }}</h2>
        <UButton
          color="primary"
          size="sm"
          class="font-medium"
          :disabled="wallet.available <= 0"
          @click="onPayout"
        >
          {{ $t('درخواست تسویه') }}
        </UButton>
      </div>

      <div
        v-if="payouts.length === 0"
        class="text-center py-12 text-sm text-muted"
      >
        {{ $t('هنوز تسویه‌ای ثبت نشده') }}
      </div>
      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="payout in payouts"
          :key="payout.id"
          class="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted border border-muted"
        >
          <div class="min-w-0">
            <div class="text-sm font-medium text-highlighted num" dir="ltr">
              {{ payout.id }}
            </div>
            <div class="text-[11px] text-muted num mt-0.5">{{ payout.date }}</div>
          </div>
          <div class="text-end shrink-0">
            <div class="text-sm font-bold text-highlighted num">
              {{ formatPrice(payout.amount) }}
            </div>
            <UBadge
              :color="payout.status === 'paid' ? 'success' : 'warning'"
              variant="subtle"
              size="xs"
              class="mt-1"
            >
              {{ payout.status === 'paid' ? $t('واریز شده') : $t('در انتظار واریز') }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const { t } = useI18n()
const toast = useAppToast()
const { wallet, payouts, requestPayout } = useSeller()

const cards = computed(() => [
  {
    label: 'موجودی قابل برداشت',
    value: wallet.value.available,
    icon: 'i-tabler-wallet',
    iconWrap: 'bg-primary/15 text-primary',
  },
  {
    label: 'در حال تسویه',
    value: wallet.value.pending,
    icon: 'i-tabler-clock',
    iconWrap: 'bg-warning/15 text-warning',
  },
  {
    label: 'فروش این ماه',
    value: wallet.value.monthSales,
    icon: 'i-tabler-chart-bar',
    iconWrap: 'bg-success/15 text-success',
  },
])

function onPayout() {
  const ok = requestPayout()
  if (ok) {
    toast.success(t('درخواست تسویه ثبت شد'))
    return
  }
  toast.warning(t('موجودی قابل برداشت ندارید'))
}
</script>
