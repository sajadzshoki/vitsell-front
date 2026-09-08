<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="h-20 rounded-2xl"
        />
      </div>
      <USkeleton
        v-for="i in 5"
        :key="`row-${i}`"
        class="h-24 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <TheSellerPageHeader
          :title="$t('تراکنش‌ها')"
          :description="$t('دفترکل یکپارچه پرداخت، بازپرداخت، تسویه و تعدیل')"
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

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="text-xs text-muted mb-1">
            {{ $t(card.label) }}
          </div>
          <div
            class="text-base font-bold num"
            :class="card.tone"
          >
            {{ card.value }}
          </div>
        </div>
      </div>

      <TheSellerListToolbar
        v-model:search="search"
        :status="status"
        :tabs="statusTabs"
        :search-placeholder="$t('جستجوی شناسه، سفارش، مشتری یا مرجع')"
        :has-active="hasActiveFilters || typeFilter !== 'all' || gatewayFilter !== 'all'"
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
          <USelect
            :model-value="gatewayFilter"
            :items="gatewayItems"
            value-key="value"
            class="w-44"
            @update:model-value="onGatewayChange"
          />
        </template>
      </TheSellerListToolbar>

      <TheSellerEmptyState
        v-if="!transactions.length"
        icon="i-tabler-arrows-exchange"
        :message="$t('هنوز تراکنشی ثبت نشده')"
      />

      <TheSellerEmptyState
        v-else-if="!filtered.length"
        icon="i-tabler-filter-off"
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
          class="block bg-muted border border-muted rounded-2xl p-4 hover:bg-primary/5 transition-all  cursor-pointer"
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
                <template v-if="item.customerPhone">
                  ·
                  <span
                    class="num"
                    dir="ltr"
                  >{{ item.customerPhone }}</span>
                </template>
                <template v-if="item.orderId">
                  · {{ $t('سفارش') }}
                  <span
                    class="num"
                    dir="ltr"
                  >{{ item.orderId }}</span>
                </template>
                · {{ item.sourceLabel }}
                <template v-if="item.gateway">
                  · {{ item.gateway }}
                </template>
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
  transactions,
  transactionsMeta,
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
const gatewayFilter = computed(() => String(route.query.gateway ?? 'all'))

const typeItems = computed(() => [
  { label: t('همه انواع'), value: 'all' },
  ...Object.entries(sellerFinanceTransactionTypeMeta).map(([value, meta]) => ({
    label: t(meta.label),
    value,
  })),
])

const gatewayItems = computed(() => {
  const fromMeta = transactionsMeta.value.gatewayOptions || []
  const fromRows = [...new Set(transactions.value.map(t => t.gateway).filter(Boolean))]
  const names = [...new Set([...fromMeta, ...fromRows])].sort((a, b) => a.localeCompare(b, 'fa'))
  return [
    { label: t('همه درگاه‌ها'), value: 'all' },
    ...names.map(name => ({ label: name, value: name })),
  ]
})

const statusTabs = computed(() => {
  const counts = transactionsMeta.value.statusCounts || {}
  const all = transactions.value
  const n = (key: string) => Number(counts[key]) || all.filter(i => key === 'all' ? true : i.status === key).length
  return [
    { id: 'all', label: t('همه'), count: n('all') || all.length },
    { id: 'pending', label: t('در انتظار'), count: n('pending') },
    { id: 'processing', label: t('در حال پردازش'), count: n('processing') },
    { id: 'completed', label: t('تکمیل‌شده'), count: n('completed') },
    { id: 'failed', label: t('ناموفق'), count: n('failed') },
  ]
})

const filtered = computed(() =>
  filterTransactions({
    search: search.value,
    status: status.value,
    type: typeFilter.value,
    gateway: gatewayFilter.value,
  }),
)

const summaryCards = computed(() => {
  const inflow = filtered.value.filter(t => t.signedAmount > 0).reduce((s, t) => s + t.signedAmount, 0)
  const outflow = filtered.value.filter(t => t.signedAmount < 0).reduce((s, t) => s + Math.abs(t.signedAmount), 0)
  const net = inflow - outflow
  return [
    { label: 'ورودی', value: formatPrice(inflow), tone: 'text-success' },
    { label: 'خروجی', value: formatPrice(outflow), tone: 'text-error' },
    {
      label: 'خالص',
      value: `${net >= 0 ? '+' : '−'}${formatPrice(Math.abs(net))}`,
      tone: net < 0 ? 'text-error' : 'text-success',
    },
  ]
})

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

function onGatewayChange(value: string | number) {
  const next = String(value || 'all')
  void patchQuery({ gateway: next === 'all' ? undefined : next, page: undefined })
}

async function clearAll() {
  await clearFilters()
  await patchQuery({ type: undefined, gateway: undefined })
}

function exportCsv() {
  downloadSellerCsv(
    'finance-transactions',
    ['شناسه', 'نوع', 'وضعیت', 'مبلغ', 'مبلغ با علامت', 'سفارش', 'مشتری', 'تلفن', 'درگاه', 'مرجع', 'تاریخ'],
    filtered.value.map(r => [
      r.id,
      sellerFinanceTransactionTypeMeta[r.type as SellerFinanceTransactionType].label,
      sellerFinanceTransactionStatusMeta[r.status].label,
      r.amount,
      r.signedAmount,
      r.orderId,
      r.customerName,
      r.customerPhone || '',
      r.gateway,
      r.reference,
      r.createdAt.slice(0, 10),
    ]),
  )
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری تراکنش‌ها ناموفق بود'))
</script>
