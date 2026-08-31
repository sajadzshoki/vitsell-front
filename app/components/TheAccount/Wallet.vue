<template>
  <div class="space-y-5">
    <div class="hidden lg:flex items-center justify-between">
      <h2 class="font-bold text-highlighted">{{ $t('کیف پول') }}</h2>
    </div>

    <div
      v-if="loading"
      class="space-y-4"
    >
      <USkeleton class="h-44 rounded-3xl" />
      <div class="grid grid-cols-3 gap-3">
        <USkeleton
          v-for="n in 3"
          :key="n"
          class="h-24 rounded-2xl"
        />
      </div>
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <!-- Balance hero -->
      <section class="relative overflow-hidden rounded-3xl bg-primary p-5 sm:p-6 text-inverted">
        <div class="relative z-10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-inverted/80 text-xs sm:text-sm">
                <UIcon name="i-tabler-wallet" class="size-4 sm:size-5" />
                <span>{{ $t('موجودی کیف پول') }}</span>
              </div>
              <div class="mt-2 sm:mt-3 flex items-baseline gap-2 flex-wrap">
                <span class="text-3xl sm:text-4xl font-black num tracking-tight">
                  {{ formatPrice(summary.balance) }}
                </span>
                <span class="text-sm font-medium text-inverted/80">{{ $t('تومان') }}</span>
              </div>
              <p
                v-if="summary.pendingWithdraw > 0"
                class="mt-2 text-[11px] sm:text-xs text-inverted/75"
              >
                {{ $t('در انتظار برداشت') }}:
                <span class="num font-bold">{{ formatPrice(summary.pendingWithdraw) }}</span>
                {{ $t('تومان') }}
              </p>
            </div>
            <div class="size-12 sm:size-14 rounded-2xl bg-inverted/15 grid place-items-center shrink-0 backdrop-blur-sm">
              <UIcon name="i-tabler-coin" class="size-6 sm:size-7" />
            </div>
          </div>

          <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2">
            <UButton
              color="neutral"
              variant="solid"
              size="lg"
              class="font-bold flex-1 justify-center bg-inverted text-primary hover:bg-inverted/90"
              leading-icon="i-tabler-plus"
              @click="topUpOpen = true"
            >
              {{ $t('افزایش موجودی') }}
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              class="font-bold flex-1 justify-center border-inverted/40 text-inverted hover:bg-inverted/10"
              leading-icon="i-tabler-arrow-up-right"
              :disabled="summary.balance < walletMinWithdraw"
              @click="withdrawOpen = true"
            >
              {{ $t('درخواست برداشت') }}
            </UButton>
          </div>
        </div>

        <UIcon
          name="i-tabler-circles"
          class="absolute -end-8 -bottom-10 size-40 text-inverted/10 pointer-events-none"
        />
        <UIcon
          name="i-tabler-wallet"
          class="absolute -start-6 -top-8 size-28 text-inverted/10 pointer-events-none"
        />
      </section>

      <!-- Month stats -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          v-for="card in statCards"
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
          <div class="text-base sm:text-lg font-black text-highlighted num">
            {{ formatPrice(card.value) }}
            <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
          </div>
        </div>
      </section>

      <!-- Transactions -->
      <section class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-4 sm:(p-5) md:p-6 max-lg:p-0">
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
          <UIcon name="i-tabler-receipt-off" class="size-14 text-dimmed mx-auto mb-3" />
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

const filterChips: { label: string; value: WalletTxFilter }[] = [
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
    await fetchWallet()
  }
  finally {
    loading.value = false
  }
})
</script>
