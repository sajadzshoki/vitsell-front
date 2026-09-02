<template>
  <div class="space-y-5">
    <div class="hidden lg:flex items-center justify-between">
      <h2 class="font-bold text-highlighted">{{ $t('کیف پول') }}</h2>
    </div>

    <div v-if="loading">
      <TheSkeleton variant="wallet" />
    </div>

    <template v-else>
      <!-- Balance + month stats -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative overflow-hidden rounded-2xl bg-primary p-4 text-inverted [--ui-text-inverted:white] flex flex-col min-h-[128px]">
          <div class="relative z-10 flex flex-col flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5 text-inverted/80 text-xs min-w-0">
                <UIcon
                  name="i-tabler-wallet"
                  class="size-3.5 shrink-0"
                />
                <span class="truncate">{{ $t('موجودی کیف پول') }}</span>
              </div>
              <div class="size-9 rounded-xl bg-default/15 grid place-items-center shrink-0">
                <UIcon
                  name="i-tabler-coin"
                  class="size-4.5"
                />
              </div>
            </div>
            <div class="mt-auto pt-3">
              <div class="flex items-baseline gap-1.5 flex-wrap">
                <span class="text-xl sm:text-2xl font-black num tracking-tight leading-none">
                  {{ formatPrice(summary.balance) }}
                </span>
                <span class="text-[11px] font-medium text-inverted/75">{{ $t('تومان') }}</span>
              </div>
            </div>
          </div>
          <UIcon
            name="i-tabler-circles"
            class="absolute -end-6 -bottom-8 size-28 text-inverted/10 pointer-events-none"
          />
        </div>

        <div
          v-for="card in statCards"
          :key="card.label"
          class="rounded-2xl border border-muted bg-default p-4 flex flex-col min-h-[128px]"
        >
          <div
            class="size-9 rounded-xl grid place-items-center"
            :class="card.iconWrap"
          >
            <UIcon
              :name="card.icon"
              class="size-4.5"
            />
          </div>
          <div class="mt-auto pt-3">
            <div class="text-xs text-muted mb-1 leading-5">
              {{ $t(card.label) }}
            </div>
            <div class="text-base sm:text-lg font-black text-highlighted num leading-tight">
              {{ formatPrice(card.value) }}
              <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions — semantic colors for light & dark -->
      <section class="flex flex-col sm:flex-row gap-2">
        <UButton
          color="primary"
          size="lg"
          class="font-bold sm:flex-none justify-center"
          leading-icon="i-tabler-plus"
          @click="topUpOpen = true"
        >
          {{ $t('افزایش موجودی') }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="font-bold sm:flex-none justify-center"
          leading-icon="i-tabler-arrow-up-right"
          :disabled="summary.balance < walletMinWithdraw"
          @click="withdrawOpen = true"
        >
          {{ $t('درخواست برداشت') }}
        </UButton>
      </section>

      <!-- Transactions -->
      <section class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:p-5 md:p-6 max-lg:p-0">
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 class="font-bold text-highlighted">{{ $t('تراکنش‌های اخیر') }}</h3>
          <span class="text-xs text-muted num">
            {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('مورد') }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-4 pb-0.5">
          <UButton
            v-for="chip in filterChips"
            :key="chip.value"
            :color="txFilter === chip.value ? 'primary' : 'neutral'"
            :variant="txFilter === chip.value ? 'soft' : 'ghost'"
            size="sm"
            class="shrink-0 font-medium"
            @click="txFilter = chip.value"
          >
            {{ $t(chip.label) }}
          </UButton>
        </div>

        <div
          v-if="filtered.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-receipt-off"
            class="size-14 text-dimmed mx-auto mb-3"
          />
          <p class="text-sm text-muted">{{ $t('تراکنشی برای نمایش نیست') }}</p>
        </div>
        <div
          v-else
          class="space-y-2.5"
        >
          <TheAccountWalletTransactionRow
            v-for="tx in filtered"
            :key="tx.id"
            :tx="tx"
          />
        </div>
      </section>
    </template>

    <TheAccountWalletTopUpModal v-model:open="topUpOpen" />
    <TheAccountWalletWithdrawModal v-model:open="withdrawOpen" />
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { walletMinWithdraw } from '~/data/account-wallet'
import type { WalletTxFilter } from '~/composables/useAccountWallet'

const { summary, fetchWallet, filterTransactions } = useAccountWallet()
const route = useRoute()
const toast = useAppToast()
const { t } = useI18n()

const loading = ref(true)
const topUpOpen = ref(false)
const withdrawOpen = ref(false)
const txFilter = ref<WalletTxFilter>('all')

const filtered = computed(() => filterTransactions(txFilter.value))

const statCards = computed(() => [
  {
    label: 'شارژ این ماه',
    value: summary.value.monthTopup,
    icon: 'i-tabler-arrow-down-left',
    iconWrap: 'bg-success/15 text-success',
  },
  {
    label: 'خرج این ماه',
    value: summary.value.monthSpent,
    icon: 'i-tabler-arrow-up-right',
    iconWrap: 'bg-error/15 text-error',
  },
  {
    label: 'در انتظار برداشت',
    value: summary.value.pendingWithdraw,
    icon: 'i-tabler-clock-hour-4',
    iconWrap: 'bg-warning/15 text-warning',
  },
])

const filterChips: { label: string, value: WalletTxFilter }[] = [
  { label: 'همه', value: 'all' },
  { label: 'شارژ', value: 'topup' },
  { label: 'خرید', value: 'purchase' },
  { label: 'بازگشت', value: 'refund' },
  { label: 'پاداش', value: 'reward' },
  { label: 'برداشت', value: 'withdraw' },
]

onMounted(async () => {
  loading.value = true
  try {
    await fetchWallet({ force: true })
  }
  finally {
    loading.value = false
  }

  const topup = route.query.topup
  if (topup === 'ok') {
    toast.success(t('موجودی با موفقیت افزایش یافت'))
  }
  else if (topup === 'cancelled') {
    toast.error(t('پرداخت لغو شد'))
  }
  else if (topup === 'failed') {
    toast.error(t('پرداخت ناموفق بود'))
  }
  if (typeof topup === 'string') {
    const q = { ...route.query }
    delete q.topup
    navigateTo({ path: route.path, query: q }, { replace: true })
  }
})
</script>
