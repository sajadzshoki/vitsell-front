<template>
  <div class="space-y-5">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-40 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <TheSellerEmptyState
      v-else-if="!tx"
      icon="i-tabler-file-off"
      :message="$t('تراکنش پیدا نشد')"
    >
      <template #actions>
        <UButton
          to="/seller/finance/transactions"
          color="primary"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('بازگشت به لیست') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <template v-else>
      <div class="md:hidden">
        <UButton
          to="/seller/finance/transactions"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-chevron-right"
          class="cursor-pointer"
        >
          {{ $t('بازگشت') }}
        </UButton>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2
              class="text-lg font-bold text-highlighted num"
              dir="ltr"
            >
              {{ tx.id }}
            </h2>
            <div class="flex gap-1.5 mt-2 flex-wrap">
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ $t(sellerFinanceTransactionTypeMeta[tx.type].label) }}
              </UBadge>
              <UBadge
                :color="sellerFinanceTransactionStatusMeta[tx.status].color"
                variant="subtle"
              >
                {{ $t(sellerFinanceTransactionStatusMeta[tx.status].label) }}
              </UBadge>
            </div>
          </div>
          <div
            class="text-end text-lg font-black num"
            :class="tx.signedAmount < 0 ? 'text-error' : 'text-success'"
          >
            {{ formatSigned(tx.signedAmount) }}
            <span class="text-xs font-medium text-muted">{{ $t('تومان') }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('منبع') }}
            </div>
            <div class="mt-1">
              {{ tx.sourceLabel }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('درگاه') }}
            </div>
            <div class="mt-1">
              {{ tx.gateway || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('روش پرداخت') }}
            </div>
            <div class="mt-1">
              {{ tx.paymentMethod || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مرجع') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ tx.reference || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مشتری') }}
            </div>
            <div class="mt-1">
              {{ tx.customerName }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('شماره تماس') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ tx.customerPhone || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مبلغ مطلق') }}
            </div>
            <div class="mt-1 num">
              {{ formatPrice(tx.amount) }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('روابط مرتبط') }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="tx.orderId"
            :to="`/seller/orders/${tx.orderId}`"
            color="neutral"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('سفارش') }} {{ tx.orderId }}
          </UButton>
          <UButton
            v-if="tx.paymentId"
            :to="`/seller/finance/payments/${tx.paymentId}`"
            color="neutral"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('پرداخت') }}
          </UButton>
          <UButton
            v-if="tx.refundId"
            :to="`/seller/refunds?q=${encodeURIComponent(tx.refundId)}`"
            color="neutral"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('بازپرداخت') }} {{ tx.refundId }}
          </UButton>
          <UButton
            v-if="tx.settlementId"
            :to="`/seller/finance/settlements/${tx.settlementId}`"
            color="neutral"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('تسویه') }}
          </UButton>
          <p
            v-if="!tx.orderId && !tx.paymentId && !tx.refundId && !tx.settlementId"
            class="text-sm text-muted"
          >
            {{ $t('رابطه مرتبطی ثبت نشده') }}
          </p>
        </div>
      </div>

      <div
        v-if="linkedPayment"
        class="bg-default border border-muted rounded-2xl p-5 md:p-6"
      >
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('داده پرداخت') }}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('شناسه پرداخت') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ linkedPayment.id }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('Authority') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ linkedPayment.authority || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('RefId') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ linkedPayment.refId || '—' }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('زمان‌بندی') }}
        </h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm">
            <div class="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
              <UIcon
                name="i-tabler-plus"
                class="size-4"
              />
            </div>
            <div>
              <div class="font-medium text-highlighted">
                {{ $t('ایجاد') }}
              </div>
              <div
                class="text-xs text-muted num"
                dir="ltr"
              >
                {{ tx.createdAt }}
              </div>
            </div>
          </div>
          <div
            v-if="tx.completedAt"
            class="flex items-center gap-3 text-sm"
          >
            <div class="size-8 rounded-lg bg-success/10 text-success grid place-items-center shrink-0">
              <UIcon
                name="i-tabler-check"
                class="size-4"
              />
            </div>
            <div>
              <div class="font-medium text-highlighted">
                {{ $t('تکمیل') }}
              </div>
              <div
                class="text-xs text-muted num"
                dir="ltr"
              >
                {{ tx.completedAt }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  sellerFinanceTransactionStatusMeta,
  sellerFinanceTransactionTypeMeta,
} from '~/data/seller-finance-transactions'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  getTransaction,
  getPayment,
  fetchTransaction,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const tx = computed(() => getTransaction(String(route.params.id)))
const linkedPayment = computed(() => {
  if (!tx.value?.paymentId) return null
  return getPayment(tx.value.paymentId)
})

function formatSigned(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${formatPrice(Math.abs(amount))}`
}

const boot = await ensureLoaded()
if (!boot.ok) {
  toast.error(t(boot.error || 'بارگذاری تراکنش ناموفق بود'))
}
else if (!tx.value) {
  const detail = await fetchTransaction(String(route.params.id))
  if (!detail.ok) toast.error(t(detail.error || 'تراکنش یافت نشد'))
}
</script>
