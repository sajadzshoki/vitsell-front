<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="h-24 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <TheSellerPageHeader
          :title="$t('تراکنش‌ها')"
          :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رکورد')}`"
        >
          <template #actions>
            <UButton
              v-if="can('transactions.export')"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-download"
              class="cursor-pointer"
              @click="exportCsv"
            >
              {{ $t('خروجی') }}
            </UButton>
          </template>
        </TheSellerPageHeader>
      </div>

      <TheSellerListToolbar
        v-model:search="search"
        :status="status"
        :tabs="statusTabs"
        :search-placeholder="$t('جستجوی شناسه، سفارش، مشتری یا مرجع')"
        :has-active="hasActiveFilters || typeFilter !== 'all'"
        @update:status="status = $event"
        @clear="clearAll"
      >
        <template #extra>
          <USelect
            :model-value="typeFilter"
            :items="typeItems"
            value-key="value"
            class="w-40"
            @update:model-value="onTypeChange"
          />
        </template>
      </TheSellerListToolbar>

      <TheSellerEmptyState
        v-if="!filtered.length"
        icon="i-tabler-arrows-exchange"
        :message="$t('تراکنشی با این فیلتر پیدا نشد')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <NuxtLink
          v-for="item in paged"
          :key="item.id"
          :to="`/seller/finance/transactions/${item.id}`"
          class="block bg-muted border border-muted rounded-2xl p-4 hover:bg-primary/5 transition cursor-pointer"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >{{ item.id }}</span>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerFinanceTransactionTypeMeta[item.type].label) }}
                </UBadge>
                <UBadge
                  :color="sellerFinanceTransactionStatusMeta[item.status].color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerFinanceTransactionStatusMeta[item.status].label) }}
                </UBadge>
              </div>
              <div class="text-[11px] text-muted mt-1">
                {{ item.customerName }}
                <template v-if="item.orderId">
                  · {{ $t('سفارش') }}
                  <span
                    class="num"
                    dir="ltr"
                  >{{ item.orderId }}</span>
                </template>
                · {{ item.sourceLabel }}
              </div>
            </div>
            <div class="text-end shrink-0">
              <div
                class="text-sm font-bold num"
                :class="item.signedAmount < 0 ? 'text-error' : item.signedAmount > 0 ? 'text-success' : 'text-highlighted'"
              >
                {{ formatSigned(item.signedAmount) }}
              </div>
              <div class="text-[11px] text-muted num mt-0.5">
                {{ item.createdAt.slice(0, 10) }}
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div
        v-if="pageCount > 1"
        class="mt-5 flex justify-center"
      >
        <UPagination
          v-model:page="page"
          :total="filtered.length"
          :items-per-page="pageSize"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import { formatPrice } from '~/data/products'
import {
  sellerFinanceTransactionStatusMeta,
  sellerFinanceTransactionTypeMeta,
  type SellerFinanceTransactionType,
} from '~/data/seller-finance-transactions'

const PAGE_SIZE = 10
const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const {
  filterTransactions,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

const pageSize = PAGE_SIZE

const typeFilter = computed(() => String(route.query.type ?? 'all'))

const typeItems = computed(() => [
  { label: t('همه انواع'), value: 'all' },
  ...Object.entries(sellerFinanceTransactionTypeMeta).map(([value, meta]) => ({
    label: t(meta.label),
    value,
  })),
])

const statusTabs = computed(() => {
  const all = filterTransactions({})
  return [
    { id: 'all', label: t('همه'), count: all.length },
    { id: 'pending', label: t('در انتظار'), count: all.filter(i => i.status === 'pending').length },
    { id: 'processing', label: t('در حال پردازش'), count: all.filter(i => i.status === 'processing').length },
    { id: 'completed', label: t('تکمیل‌شده'), count: all.filter(i => i.status === 'completed').length },
    { id: 'failed', label: t('ناموفق'), count: all.filter(i => i.status === 'failed').length },
  ]
})

const filtered = computed(() =>
  filterTransactions({
    search: search.value,
    status: status.value,
    type: typeFilter.value,
  }),
)

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function formatSigned(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${formatPrice(Math.abs(amount))}`
}

function onTypeChange(value: string | number) {
  const next = String(value || 'all')
  void patchQuery({ type: next === 'all' ? undefined : next, page: undefined })
}

async function clearAll() {
  await clearFilters()
  await patchQuery({ type: undefined })
}

function exportCsv() {
  downloadSellerCsv(
    'finance-transactions',
    ['شناسه', 'نوع', 'وضعیت', 'مبلغ', 'مبلغ با علامت', 'سفارش', 'مشتری', 'درگاه', 'مرجع', 'تاریخ'],
    filtered.value.map(r => [
      r.id,
      sellerFinanceTransactionTypeMeta[r.type as SellerFinanceTransactionType].label,
      sellerFinanceTransactionStatusMeta[r.status].label,
      r.amount,
      r.signedAmount,
      r.orderId,
      r.customerName,
      r.gateway,
      r.reference,
      r.createdAt.slice(0, 10),
    ]),
  )
}

try {
  await ensureLoaded()
}
catch {
  toast.error(t('بارگذاری تراکنش‌ها ناموفق بود'))
}
</script>
