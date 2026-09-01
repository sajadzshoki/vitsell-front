<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-28 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <TheSellerPageHeader
          :title="$t('مغایرت‌گیری')"
          :description="$t('ناسازگاری‌های مالی بین سفارش، پرداخت، بازپرداخت و تسویه')"
          :count-label="`${visible.length.toLocaleString('fa-IR')} ${$t('مورد')}`"
        />
      </div>

      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <UButton
          type="button"
          :color="showReconciled ? 'neutral' : 'primary'"
          :variant="showReconciled ? 'ghost' : 'soft'"
          size="sm"
          class="cursor-pointer"
          @click="showReconciled = false"
        >
          {{ $t('باز') }}
          <span class="num ms-1">{{ openDiscrepancies.length.toLocaleString('fa-IR') }}</span>
        </UButton>
        <UButton
          type="button"
          :color="showReconciled ? 'primary' : 'neutral'"
          :variant="showReconciled ? 'soft' : 'ghost'"
          size="sm"
          class="cursor-pointer"
          @click="showReconciled = true"
        >
          {{ $t('رسیدگی‌شده') }}
          <span class="num ms-1">{{ reconciledCount.toLocaleString('fa-IR') }}</span>
        </UButton>
      </div>

      <TheSellerEmptyState
        v-if="!visible.length"
        icon="i-tabler-scale"
        :message="showReconciled ? $t('مورد رسیدگی‌شده‌ای نیست') : $t('مغایرت بازی وجود ندارد')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="item in visible"
          :key="item.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-highlighted">
                  {{ $t(item.title) }}
                </span>
                <UBadge
                  :color="severityColor(item.severity)"
                  variant="subtle"
                  size="xs"
                >
                  {{ severityLabel(item.severity) }}
                </UBadge>
                <UBadge
                  v-if="item.reconciled"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t('رسیدگی‌شده') }}
                </UBadge>
              </div>
              <p class="text-xs text-muted mt-2 leading-6">
                {{ item.detail }}
              </p>
              <div class="flex flex-wrap gap-2 mt-3">
                <UButton
                  v-if="item.orderId"
                  :to="`/seller/orders/${item.orderId}`"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="cursor-pointer"
                >
                  {{ $t('سفارش') }} {{ item.orderId }}
                </UButton>
                <UButton
                  v-if="item.paymentId"
                  :to="`/seller/finance/payments/${item.paymentId}`"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="cursor-pointer"
                >
                  {{ $t('پرداخت') }}
                </UButton>
                <UButton
                  v-if="item.settlementId"
                  :to="`/seller/finance/settlements/${item.settlementId}`"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="cursor-pointer"
                >
                  {{ $t('تسویه') }}
                </UButton>
              </div>
            </div>
            <UButton
              v-if="!item.reconciled && can('financial_reconciliation.manage')"
              type="button"
              color="success"
              variant="soft"
              size="sm"
              class="cursor-pointer shrink-0"
              @click="markDone(item.id)"
            >
              {{ $t('علامت رسیدگی') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FinanceDiscrepancySeverity } from '~/data/seller-finance-reconciliation'

const actor = { id: 'admin', name: 'ادمین' }
const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  discrepancies,
  openDiscrepancies,
  markDiscrepancyReconciled,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const showReconciled = ref(false)

const reconciledCount = computed(() => discrepancies.value.filter(d => d.reconciled).length)

const visible = computed(() =>
  showReconciled.value
    ? discrepancies.value.filter(d => d.reconciled)
    : openDiscrepancies.value,
)

function severityColor(s: FinanceDiscrepancySeverity): 'error' | 'warning' | 'info' {
  if (s === 'high') return 'error'
  if (s === 'medium') return 'warning'
  return 'info'
}

function severityLabel(s: FinanceDiscrepancySeverity) {
  if (s === 'high') return t('بالا')
  if (s === 'medium') return t('متوسط')
  return t('پایین')
}

function markDone(id: string) {
  markDiscrepancyReconciled(id, actor)
  toast.success(t('مغایرت به‌عنوان رسیدگی‌شده علامت خورد'))
}

try {
  await ensureLoaded()
}
catch {
  toast.error(t('بارگذاری مغایرت‌گیری ناموفق بود'))
}
</script>
