<template>
  <div class="space-y-5">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-40 rounded-2xl" />
      <USkeleton class="h-48 rounded-2xl" />
    </div>

    <TheSellerEmptyState
      v-else-if="!payment"
      icon="i-tabler-credit-card-off"
      :message="$t('پرداخت پیدا نشد')"
    >
      <template #actions>
        <UButton
          to="/seller/finance/payments"
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
          to="/seller/finance/payments"
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
              {{ payment.id }}
            </h2>
            <UBadge
              class="mt-2"
              :color="sellerFinancePaymentStatusMeta[payment.status].color"
              variant="subtle"
            >
              {{ $t(sellerFinancePaymentStatusMeta[payment.status].label) }}
            </UBadge>
          </div>
          <div class="flex gap-2 flex-wrap">
            <UButton
              :to="`/seller/orders/${payment.orderId}`"
              color="neutral"
              variant="soft"
              size="sm"
              class="cursor-pointer"
            >
              {{ $t('سفارش') }} {{ payment.orderId }}
            </UButton>
            <UButton
              v-if="can('payments.manage')"
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-tabler-notes"
              class="cursor-pointer"
              @click="reviewOpen = true"
            >
              {{ $t('یادداشت بررسی') }}
            </UButton>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مشتری') }}
            </div>
            <div class="mt-1">
              {{ payment.customerName }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مبلغ') }}
            </div>
            <div class="mt-1 num font-bold">
              {{ formatPrice(payment.amount) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('روش پرداخت') }}
            </div>
            <div class="mt-1">
              {{ payment.paymentMethod }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('درگاه') }}
            </div>
            <div class="mt-1">
              {{ payment.gateway }}
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
              {{ payment.authority || '—' }}
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
              {{ payment.refId || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('شناسه تراکنش') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ payment.transactionId }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('تاریخ ایجاد') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ payment.createdAt }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('تاریخ تکمیل') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ payment.completedAt || '—' }}
            </div>
          </div>
        </div>

        <div
          v-if="payment.adminNote"
          class="mt-5 rounded-xl border border-muted bg-muted/40 p-4 text-sm"
        >
          <div class="text-[11px] text-muted mb-1">
            {{ $t('یادداشت ادمین') }}
          </div>
          <p class="text-default leading-6">
            {{ payment.adminNote }}
          </p>
          <p
            v-if="payment.reviewedAt"
            class="text-[11px] text-muted mt-2 num"
            dir="ltr"
          >
            {{ payment.reviewedAt }}
          </p>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('بازپرداخت‌های مرتبط') }}
        </h3>
        <TheSellerEmptyState
          v-if="!linkedRefunds.length"
          icon="i-tabler-receipt-refund"
          :message="$t('بازپرداختی برای این سفارش نیست')"
        />
        <div
          v-else
          class="space-y-2"
        >
          <NuxtLink
            v-for="rf in linkedRefunds"
            :key="rf.id"
            to="/seller/refunds"
            class="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted border border-muted cursor-pointer hover:bg-primary/5"
          >
            <div>
              <div
                class="text-sm font-medium num"
                dir="ltr"
              >
                {{ rf.id }}
              </div>
              <div class="text-[11px] text-muted">
                {{ $t(sellerRefundStatusMeta[rf.status].label) }}
              </div>
            </div>
            <div class="text-sm font-bold num">
              {{ formatPrice(rf.amount) }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>

    <UModal
      v-model:open="reviewOpen"
      :title="$t('یادداشت بررسی پرداخت')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitReview"
        >
          <TheFormInput
            v-model="reviewNote"
            :label="$t('یادداشت')"
            required
          />
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="reviewOpen = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              class="cursor-pointer"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { sellerFinancePaymentStatusMeta } from '~/data/seller-finance-payments'
import { sellerRefundStatusMeta } from '~/data/seller-returns-refunds'

const actor = { id: 'admin', name: 'ادمین' }
const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const {
  getPayment,
  fetchPayment,
  refunds,
  reviewPayment,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const payment = computed(() => getPayment(String(route.params.id)))
const linkedRefunds = computed(() => {
  if (!payment.value) return []
  return refunds.value.filter(r => r.orderId === payment.value!.orderId)
})

const reviewOpen = ref(false)
const reviewNote = ref('')

watch(payment, (p) => {
  reviewNote.value = p?.adminNote || ''
}, { immediate: true })

function submitReview() {
  if (!payment.value) return
  const result = reviewPayment(payment.value.id, reviewNote.value, actor)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  reviewOpen.value = false
  toast.success(t('یادداشت بررسی ذخیره شد'))
}

const boot = await ensureLoaded()
if (!boot.ok) {
  toast.error(t(boot.error || 'بارگذاری پرداخت ناموفق بود'))
}
else if (!payment.value) {
  const detail = await fetchPayment(String(route.params.id))
  if (!detail.ok) toast.error(t(detail.error || 'پرداخت یافت نشد'))
}
</script>
