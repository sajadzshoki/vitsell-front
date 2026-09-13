<template>
  <div class="space-y-5">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-12 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <TheSellerPageHeader
          :title="$t('گزارش‌های مالی')"
          :description="$t('فروش، پرداخت، بازپرداخت و اثر تخفیف در بازه انتخابی')"
        >
          <template #actions>
            <UButton
              v-if="can('finance_reports.export')"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-download"
              class="cursor-pointer"
              :loading="reportsLoading"
              @click="exportCsv"
            >
              {{ $t('خروجی CSV') }}
            </UButton>
          </template>
        </TheSellerPageHeader>

        <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-5 flex-wrap">
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <UButton
              v-for="opt in financePeriodOptions"
              :key="opt.id"
              type="button"
              size="sm"
              :color="period === opt.id ? 'primary' : 'neutral'"
              :variant="period === opt.id ? 'soft' : 'ghost'"
              class="shrink-0 cursor-pointer"
              @click="onPeriod(opt.id)"
            >
              {{ $t(opt.label) }}
            </UButton>
          </div>
          <div
            v-if="period === 'custom'"
            class="flex items-center gap-2 flex-wrap"
          >
            <div class="w-40">
              <TheIRDatePicker
                :model-value="customStart || null"
                :header="$t('از تاریخ')"
                :placeholder="$t('انتخاب تاریخ')"
                @update:model-value="customStart = $event || ''"
              />
            </div>
            <div class="w-40">
              <TheIRDatePicker
                :model-value="customEnd || null"
                :header="$t('تا تاریخ')"
                :placeholder="$t('انتخاب تاریخ')"
                @update:model-value="customEnd = $event || ''"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-5">
          <UButton
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            size="sm"
            :color="activeTab === tab.id ? 'primary' : 'neutral'"
            :variant="activeTab === tab.id ? 'soft' : 'ghost'"
            class="shrink-0 cursor-pointer"
            @click="activeTab = tab.id"
          >
            {{ $t(tab.label) }}
          </UButton>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div
            v-for="card in activeCards"
            :key="card.label"
            class="bg-muted border border-muted rounded-2xl p-4"
          >
            <div class="text-xs text-muted mb-1">
              {{ $t(card.label) }}
            </div>
            <div
              v-if="card.isMoney"
              class="text-base font-bold text-highlighted num"
            >
              {{ formatPrice(card.value as number) }}
              <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
            </div>
            <div
              v-else
              class="text-base font-bold text-highlighted num"
            >
              {{ card.display }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('روند فروش و پرداخت') }}
        </h3>
        <ClientOnly>
          <apexchart
            type="line"
            height="280"
            :options="trendOptions"
            :series="trendSeries"
          />
          <template #fallback>
            <USkeleton class="h-72 rounded-xl" />
          </template>
        </ClientOnly>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import { formatPrice } from '~/data/products'
import { financePeriodOptions, isDateInRange, type FinancePeriodId } from '~/data/seller-finance'
import { sellerFinancePaymentStatusMeta } from '~/data/seller-finance-payments'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  period,
  customStart,
  customEnd,
  setPeriod,
  range,
  kpis,
  discountImpact,
  reportTrend,
  payments,
  loaded,
  loading,
  ensureLoaded,
  fetchReports,
} = useSellerFinance()

const activeTab = ref<'sales' | 'payments' | 'refunds' | 'discounts' | 'orders'>('sales')
const reportsLoading = ref(false)

const tabs = [
  { id: 'sales' as const, label: 'فروش' },
  { id: 'payments' as const, label: 'پرداخت‌ها' },
  { id: 'refunds' as const, label: 'بازپرداخت‌ها' },
  { id: 'discounts' as const, label: 'اثر تخفیف' },
  { id: 'orders' as const, label: 'مالی سفارش' },
]

const discountPctLabel = computed(() => {
  const gross = kpis.value.grossRevenue
  const disc = discountImpact.value.orderDiscountTotal
  if (!gross) return '—'
  const pct = Math.round((disc / gross) * 1000) / 10
  return `${pct.toLocaleString('fa-IR')}٪`
})

const activeCards = computed(() => {
  const k = kpis.value
  if (activeTab.value === 'sales') {
    return [
      { label: 'درآمد ناخالص', value: k.grossRevenue, isMoney: true, display: '' },
      { label: 'درآمد خالص', value: k.netRevenue, isMoney: true, display: '' },
      { label: 'فروش هفته', value: k.weekRevenue, isMoney: true, display: '' },
      { label: 'فروش ماه', value: k.monthRevenue, isMoney: true, display: '' },
    ]
  }
  if (activeTab.value === 'payments') {
    return [
      { label: 'پرداخت موفق', value: 0, isMoney: false, display: k.successfulPayments.toLocaleString('fa-IR') },
      { label: 'در انتظار', value: 0, isMoney: false, display: k.pendingPayments.toLocaleString('fa-IR') },
      { label: 'ناموفق', value: 0, isMoney: false, display: k.failedPaymentCount.toLocaleString('fa-IR') },
      { label: 'حجم پرداخت', value: k.paymentVolume, isMoney: true, display: '' },
    ]
  }
  if (activeTab.value === 'refunds') {
    return [
      { label: 'مجموع بازپرداخت', value: k.totalRefunded, isMoney: true, display: '' },
      { label: 'در انتظار', value: 0, isMoney: false, display: k.pendingRefunds.toLocaleString('fa-IR') },
      { label: 'تکمیل‌شده', value: 0, isMoney: false, display: k.completedRefunds.toLocaleString('fa-IR') },
      { label: 'ناموفق', value: 0, isMoney: false, display: k.failedRefunds.toLocaleString('fa-IR') },
    ]
  }
  if (activeTab.value === 'discounts') {
    return [
      { label: 'مجموع تخفیف سفارش', value: discountImpact.value.orderDiscountTotal, isMoney: true, display: '' },
      { label: 'درآمد ناخالص', value: k.grossRevenue, isMoney: true, display: '' },
      { label: 'اثر نسبی', value: 0, isMoney: false, display: discountPctLabel.value },
    ]
  }
  return [
    { label: 'سفارش پرداخت‌شده', value: 0, isMoney: false, display: k.paidOrders.toLocaleString('fa-IR') },
    { label: 'پرداخت‌نشده', value: 0, isMoney: false, display: k.unpaidOrders.toLocaleString('fa-IR') },
    { label: 'بازپرداخت کامل', value: 0, isMoney: false, display: k.refundedOrders.toLocaleString('fa-IR') },
    { label: 'بازپرداخت جزئی', value: 0, isMoney: false, display: k.partiallyRefundedOrders.toLocaleString('fa-IR') },
  ]
})

const trendSeries = computed(() => {
  const trend = reportTrend.value
  const paymentData = trend.payments.length
    ? trend.payments
    : trend.sales.map(() => 0)
  return [
    { name: t('فروش'), data: trend.sales },
    { name: t('پرداخت'), data: paymentData },
  ]
})

const trendOptions = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#2563EB', '#22C55E'],
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148,163,184,0.25)', strokeDashArray: 4 },
  xaxis: {
    categories: reportTrend.value.labels,
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px' },
      formatter: (val: number) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(val),
    },
  },
  legend: { position: 'bottom' },
  tooltip: {
    y: { formatter: (val: number) => formatPrice(val) },
  },
}))

async function refreshReports() {
  reportsLoading.value = true
  try {
    const res = await fetchReports({ force: true })
    if (!res.ok) toast.error(t(res.error || 'بارگذاری گزارش مالی ناموفق بود'))
  }
  finally {
    reportsLoading.value = false
  }
}

async function onPeriod(id: FinancePeriodId) {
  setPeriod(id)
  await refreshReports()
}

let customDebounce: ReturnType<typeof setTimeout> | null = null
watch([customStart, customEnd], () => {
  if (period.value !== 'custom') return
  if (customDebounce) clearTimeout(customDebounce)
  customDebounce = setTimeout(() => {
    void refreshReports()
  }, 350)
})

function exportCsv() {
  downloadSellerCsv(
    'finance-reports',
    ['شاخص', 'مقدار'],
    [
      ['درآمد ناخالص', kpis.value.grossRevenue],
      ['درآمد خالص', kpis.value.netRevenue],
      ['حجم پرداخت', kpis.value.paymentVolume],
      ['مجموع بازپرداخت', kpis.value.totalRefunded],
      ['تخفیف سفارش', discountImpact.value.orderDiscountTotal],
      ['سفارش پرداخت‌شده', kpis.value.paidOrders],
      ['پرداخت موفق', kpis.value.successfulPayments],
      ...payments.value
        .filter(p => isDateInRange(p.createdAt, range.value.start, range.value.end))
        .map(p => [
          `پرداخت ${p.id}`,
          `${sellerFinancePaymentStatusMeta[p.status].label} / ${p.amount}`,
        ]),
    ],
  )
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری گزارش مالی ناموفق بود'))
</script>
