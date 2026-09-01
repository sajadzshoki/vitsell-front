<template>
  <div class="space-y-5">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-40 rounded-2xl" />
    </div>

    <TheSellerEmptyState
      v-else-if="!settlement"
      icon="i-tabler-building-bank"
      :message="$t('تسویه پیدا نشد')"
    >
      <template #actions>
        <UButton
          to="/seller/finance/settlements"
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
          to="/seller/finance/settlements"
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
              {{ settlement.id }}
            </h2>
            <div class="flex gap-1.5 mt-2 flex-wrap">
              <UBadge
                :color="sellerSettlementStatusMeta[settlement.status].color"
                variant="subtle"
              >
                {{ $t(sellerSettlementStatusMeta[settlement.status].label) }}
              </UBadge>
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ $t(sellerSettlementSourceMeta[settlement.source].label) }}
              </UBadge>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مبلغ') }}
            </div>
            <div class="mt-1 num font-bold">
              {{ formatPrice(settlement.amount) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('کارمزد') }}
            </div>
            <div class="mt-1 num">
              {{ formatPrice(settlement.fees) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('خالص') }}
            </div>
            <div class="mt-1 num font-bold text-success">
              {{ formatPrice(settlement.netAmount) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('درگاه') }}
            </div>
            <div class="mt-1">
              {{ settlement.gateway }}
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
              {{ settlement.reference || '—' }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('تاریخ تسویه') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ settlement.settlementDate }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('ایجاد') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ settlement.createdAt }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('به‌روزرسانی') }}
            </div>
            <div
              class="mt-1 num"
              dir="ltr"
            >
              {{ settlement.updatedAt }}
            </div>
          </div>
        </div>

        <p
          v-if="settlement.note"
          class="mt-5 text-sm text-toned leading-6 rounded-xl bg-muted/40 border border-muted p-4"
        >
          {{ settlement.note }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  sellerSettlementSourceMeta,
  sellerSettlementStatusMeta,
} from '~/data/seller-finance-settlements'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  getSettlement,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const settlement = computed(() => getSettlement(String(route.params.id)))

try {
  await ensureLoaded()
}
catch {
  toast.error(t('بارگذاری تسویه ناموفق بود'))
}
</script>
