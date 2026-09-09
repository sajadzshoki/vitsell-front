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
          :title="$t('پرداخت‌ها')"
          :description="$t('پرداخت‌های سفارش‌ها از درگاه و وضعیت تأیید')"
          :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رکورد')}`"
        >
          <template #actions>
            <UButton
              v-if="canExport"
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
          <div class="text-base font-bold text-highlighted num">
            {{ card.value }}
          </div>
        </div>
      </div>

      <TheSellerListToolbar
        v-model:search="search"
        :status="status"
        :tabs="statusTabs"
        :search-placeholder="$t('جستجوی شناسه، سفارش، مرجع یا مشتری')"
        :has-active="hasActiveFilters || gatewayFilter !== 'all'"
        @update:status="status = $event"
        @clear="clearAll"
      >
        <template #extra>
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
        v-if="!payments.length"
        icon="i-tabler-credit-card"
        :message="$t('هنوز پرداختی ثبت نشده')"
      />

      <TheSellerEmptyState
        v-else-if="!filtered.length"
        icon="i-tabler-filter-off"
        :message="$t('پرداختی با این فیلتر پیدا نشد')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <NuxtLink
          v-for="item in paged"
          :key="item.id"
          :to="`/seller/finance/payments/${item.id}`"
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
                  :color="sellerFinancePaymentStatusMeta[item.status].color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerFinancePaymentStatusMeta[item.status].label) }}
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
                · {{ $t('سفارش') }}
                <span
                  class="num"
                  dir="ltr"
                >{{ item.orderId }}</span>
                · {{ item.gateway }}
                <template v-if="item.refId || item.authority">
                  ·
                  <span
                    class="num"
                    dir="ltr"
                  >{{ item.refId || item.authority }}</span>
                </template>
              </div>
            </div>
            <div class="text-end shrink-0">
              <div class="text-sm font-bold text-highlighted num">
                {{ formatPrice(item.amount) }}
              </div>
              <div class="text-[11px] text-muted num mt-0.5">
                {{ item.createdAt.slice(0, 10) }}
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <TheSellerPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filtered.length"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import { formatPrice } from '~/data/products'
import { sellerFinancePaymentStatusMeta } from '~/data/seller-finance-payments'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const {
  filterPayments,
  payments,
  paymentsMeta,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const { search, status, page, pageSize, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

const canExport = computed(() => can('transactions.export') || can('payments.view'))
const gatewayFilter = computed(() => String(route.query.gateway ?? 'all'))

const gatewayItems = computed(() => {
  const fromMeta = paymentsMeta.value.gatewayOptions || []
  const fromRows = [...new Set(payments.value.map(p => p.gateway).filter(Boolean))]
  const names = [...new Set([...fromMeta, ...fromRows])].sort((a, b) => a.localeCompare(b, 'fa'))
  return [
    { label: t('همه درگاه‌ها'), value: 'all' },
    ...names.map(name => ({ label: name, value: name })),
  ]
})

const statusTabs = computed(() => {
  const counts = paymentsMeta.value.statusCounts || {}
  const all = payments.value
  const n = (key: string, fallback: () => number) => Number(counts[key]) || fallback()
  return [
    { id: 'all', label: t('همه'), count: n('all', () => all.length) },
    { id: 'successful', label: t('موفق'), count: n('successful', () => all.filter(i => i.status === 'successful').length) },
    {
      id: 'pending',
      label: t('در انتظار'),
      count: n('pending_group', () => all.filter(i => i.status === 'pending' || i.status === 'processing').length),
    },
    { id: 'failed', label: t('ناموفق'), count: n('failed', () => all.filter(i => i.status === 'failed').length) },
    {
      id: 'refunded',
      label: t('بازپرداخت'),
      count: n('refunded_group', () => all.filter(i => i.status === 'refunded' || i.status === 'partially_refunded').length),
    },
  ]
})

const filtered = computed(() => {
  let list = filterPayments({
    search: search.value,
    status: status.value === 'pending' || status.value === 'refunded' ? undefined : status.value,
    gateway: gatewayFilter.value,
  })
  if (status.value === 'pending') {
    list = list.filter(p => p.status === 'pending' || p.status === 'processing')
  }
  else if (status.value === 'refunded') {
    list = list.filter(p => p.status === 'refunded' || p.status === 'partially_refunded')
  }
  return list
})

const summaryCards = computed(() => {
  const successful = filtered.value.filter(p => p.status === 'successful' || p.status === 'partially_refunded' || p.status === 'refunded')
  const volume = successful.reduce((s, p) => s + p.amount, 0)
  const pending = filtered.value.filter(p => p.status === 'pending' || p.status === 'processing').length
  return [
    { label: 'حجم موفق', value: formatPrice(volume) },
    { label: 'تعداد موفق', value: successful.length.toLocaleString('fa-IR') },
    { label: 'در انتظار', value: pending.toLocaleString('fa-IR') },
  ]
})


const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function onGatewayChange(value: string | number) {
  const next = String(value || 'all')
  void patchQuery({ gateway: next === 'all' ? undefined : next, page: undefined })
}

async function clearAll() {
  await clearFilters()
  await patchQuery({ gateway: undefined })
}

function exportCsv() {
  downloadSellerCsv(
    'finance-payments',
    ['شناسه', 'سفارش', 'مشتری', 'تلفن', 'وضعیت', 'مبلغ', 'درگاه', 'مرجع', 'تاریخ'],
    filtered.value.map(r => [
      r.id,
      r.orderId,
      r.customerName,
      r.customerPhone || '',
      sellerFinancePaymentStatusMeta[r.status].label,
      r.amount,
      r.gateway,
      r.refId || r.authority || '',
      r.createdAt.slice(0, 10),
    ]),
  )
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری پرداخت‌ها ناموفق بود'))
</script>
