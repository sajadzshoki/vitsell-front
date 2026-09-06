<template>
  <div class="space-y-5">
    <div
      v-if="loading && !loaded"
      class="space-y-5"
    >
      <USkeleton class="h-12 rounded-2xl" />
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <USkeleton
          v-for="i in 8"
          :key="i"
          class="h-28 rounded-2xl"
        />
      </div>
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <TheSellerPageHeader
          :title="$t('داشبورد مالی')"
          :description="$t('نمای کلی درآمد، پرداخت، بازپرداخت و وضعیت مالی فروشگاه')"
        />

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
              @click="setPeriod(opt.id)"
            >
              {{ $t(opt.label) }}
            </UButton>
          </div>
          <div
            v-if="period === 'custom'"
            class="flex items-center gap-2 flex-wrap"
          >
            <TheFormInput
              v-model="customStart"
              type="date"
              :label="$t('از تاریخ')"
              class="w-40"
              dir="ltr"
            />
            <TheFormInput
              v-model="customEnd"
              type="date"
              :label="$t('تا تاریخ')"
              class="w-40"
              dir="ltr"
            />
          </div>
        </div>

        <section class="mb-6">
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('درآمد') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div
              v-for="card in revenueCards"
              :key="card.label"
              class="bg-muted border border-muted rounded-2xl p-4"
            >
              <div class="text-xs text-muted mb-1">
                {{ $t(card.label) }}
              </div>
              <div class="text-lg font-black text-highlighted num">
                {{ formatPrice(card.value) }}
                <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
              </div>
              <p
                v-if="card.hint"
                class="text-[11px] text-muted mt-2"
              >
                {{ card.hint }}
              </p>
            </div>
          </div>
        </section>

        <section class="mb-6">
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('سفارش‌ها') }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <div
              v-for="card in orderCards"
              :key="card.label"
              class="bg-muted border border-muted rounded-2xl p-4"
            >
              <div class="text-xs text-muted mb-1">
                {{ $t(card.label) }}
              </div>
              <div class="text-base font-bold text-highlighted num">
                {{ card.value.toLocaleString('fa-IR') }}
              </div>
            </div>
          </div>
        </section>

        <section class="mb-6">
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('پرداخت‌ها') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div
              v-for="card in paymentCards"
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
                {{ formatPrice(card.value) }}
                <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
              </div>
              <div
                v-else
                class="text-base font-bold text-highlighted num"
              >
                {{ card.value.toLocaleString('fa-IR') }}
              </div>
            </div>
          </div>
        </section>

        <section class="mb-6">
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('بازپرداخت‌ها') }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              v-for="card in refundCards"
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
                {{ formatPrice(card.value) }}
              </div>
              <div
                v-else
                class="text-base font-bold text-highlighted num"
              >
                {{ card.value.toLocaleString('fa-IR') }}
              </div>
            </div>
          </div>
        </section>

        <section class="mb-6">
          <h3 class="text-sm font-bold text-highlighted mb-3">
            {{ $t('وضعیت مالی') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="card in statusCards"
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
                {{ formatPrice(card.value) }}
                <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
              </div>
              <div
                v-else
                class="text-base font-bold text-highlighted num"
              >
                {{ card.value.toLocaleString('fa-IR') }}
              </div>
              <p
                v-if="card.statusText"
                class="text-[11px] mt-2"
                :class="card.statusClass"
              >
                {{ card.statusText }}
              </p>
            </div>
          </div>
        </section>

        <div class="flex flex-wrap gap-2 mb-6">
          <UButton
            to="/seller/finance/transactions"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-arrows-exchange"
            class="cursor-pointer"
          >
            {{ $t('تراکنش‌ها') }}
          </UButton>
          <UButton
            to="/seller/finance/payments"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-credit-card"
            class="cursor-pointer"
          >
            {{ $t('پرداخت‌ها') }}
          </UButton>
          <UButton
            to="/seller/finance/settlements"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-building-bank"
            class="cursor-pointer"
          >
            {{ $t('تسویه‌ها') }}
          </UButton>
          <UButton
            to="/seller/refunds"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-receipt-refund"
            class="cursor-pointer"
          >
            {{ $t('بازپرداخت‌ها') }}
          </UButton>
          <UButton
            to="/seller/finance/reconciliation"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-scale"
            class="cursor-pointer"
          >
            {{ $t('مغایرت‌گیری') }}
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="xl:col-span-2 bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">
            {{ $t('روند فروش') }}
          </h3>
          <ClientOnly>
            <apexchart
              type="area"
              height="260"
              :options="salesChartOptions"
              :series="salesChartSeries"
            />
            <template #fallback>
              <USkeleton class="h-64 rounded-xl" />
            </template>
          </ClientOnly>
        </div>

        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">
            {{ $t('توزیع وضعیت پرداخت') }}
          </h3>
          <ClientOnly>
            <apexchart
              v-if="paymentStatusSeries.some(v => v > 0)"
              type="donut"
              height="260"
              :options="paymentStatusOptions"
              :series="paymentStatusSeries"
            />
            <template #fallback>
              <USkeleton class="h-64 rounded-xl" />
            </template>
          </ClientOnly>
          <p
            v-if="!paymentStatusSeries.some(v => v > 0)"
            class="text-sm text-muted text-center py-10"
          >
            {{ $t('پرداختی در این بازه نیست') }}
          </p>
        </div>

        <div class="xl:col-span-3 bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">
            {{ $t('تعداد بازپرداخت‌ها بر اساس وضعیت') }}
          </h3>
          <ClientOnly>
            <apexchart
              type="bar"
              height="240"
              :options="refundChartOptions"
              :series="refundChartSeries"
            />
            <template #fallback>
              <USkeleton class="h-56 rounded-xl" />
            </template>
          </ClientOnly>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { financePeriodOptions, isDateInRange } from '~/data/seller-finance'
import { sellerFinancePaymentStatusMeta } from '~/data/seller-finance-payments'

const { t } = useI18n()
const toast = useAppToast()

const {
  period,
  customStart,
  customEnd,
  setPeriod,
  range,
  kpis,
  sales,
  payments,
  refunds,
  loaded,
  loading,
  loadError,
  ensureLoaded,
} = useSellerFinance()

const changeHint = computed(() => {
  const pct = kpis.value.revenueChangePct
  if (pct == null) return t('نسبت به بازه قبل — بدون مبنای مقایسه')
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toLocaleString('fa-IR')}٪ ${t('نسبت به بازه قبل')}`
})

const revenueCards = computed(() => [
  { label: 'درآمد ناخالص', value: kpis.value.grossRevenue, hint: '' },
  { label: 'درآمد خالص', value: kpis.value.netRevenue, hint: changeHint.value },
  { label: 'امروز', value: kpis.value.todayRevenue, hint: '' },
  { label: 'این ماه', value: kpis.value.monthRevenue, hint: '' },
])

const orderCards = computed(() => [
  { label: 'پرداخت‌شده', value: kpis.value.paidOrders },
  { label: 'پرداخت‌نشده', value: kpis.value.unpaidOrders },
  { label: 'پرداخت ناموفق', value: kpis.value.failedPayments },
  { label: 'بازپرداخت کامل', value: kpis.value.refundedOrders },
  { label: 'بازپرداخت جزئی', value: kpis.value.partiallyRefundedOrders },
])

const paymentCards = computed(() => [
  { label: 'موفق', value: kpis.value.successfulPayments, isMoney: false },
  { label: 'در انتظار', value: kpis.value.pendingPayments, isMoney: false },
  { label: 'ناموفق', value: kpis.value.failedPaymentCount, isMoney: false },
  { label: 'حجم پرداخت', value: kpis.value.paymentVolume, isMoney: true },
  { label: 'میانگین تراکنش', value: kpis.value.avgTransactionValue, isMoney: true },
])

const refundCards = computed(() => [
  { label: 'مجموع بازپرداخت', value: kpis.value.totalRefunded, isMoney: true },
  { label: 'در انتظار', value: kpis.value.pendingRefunds, isMoney: false },
  { label: 'تکمیل‌شده', value: kpis.value.completedRefunds, isMoney: false },
  { label: 'ناموفق', value: kpis.value.failedRefunds, isMoney: false },
])

const statusCards = computed(() => [
  {
    label: 'مطالبات در انتظار',
    value: kpis.value.pendingReceivables,
    isMoney: true,
    statusText: kpis.value.pendingReceivables > 0 ? t('نیاز به پیگیری') : t('بدون مطالبه باز'),
    statusClass: kpis.value.pendingReceivables > 0 ? 'text-warning' : 'text-success',
  },
  {
    label: 'تسویه در انتظار',
    value: kpis.value.pendingSettlements,
    isMoney: true,
    statusText: kpis.value.pendingSettlements > 0 ? t('در صف تسویه') : t('تسویه معوق نیست'),
    statusClass: kpis.value.pendingSettlements > 0 ? 'text-warning' : 'text-success',
  },
  {
    label: 'مغایرت باز',
    value: kpis.value.openReconciliationIssues,
    isMoney: false,
    statusText: kpis.value.openReconciliationIssues > 0 ? t('نیاز به رسیدگی') : t('مغایرت باز نیست'),
    statusClass: kpis.value.openReconciliationIssues > 0 ? 'text-error' : 'text-success',
  },
])

const periodPayments = computed(() =>
  payments.value.filter(p => isDateInRange(p.createdAt, range.value.start, range.value.end)),
)

const paymentStatusLabels = computed(() => {
  const counts = new Map<string, number>()
  for (const p of periodPayments.value) {
    counts.set(p.status, (counts.get(p.status) || 0) + 1)
  }
  return [...counts.entries()].map(([status, count]) => ({
    status,
    label: sellerFinancePaymentStatusMeta[status as keyof typeof sellerFinancePaymentStatusMeta]?.label || status,
    count,
  }))
})

const paymentStatusSeries = computed(() => paymentStatusLabels.value.map(r => r.count))

const paymentStatusOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  labels: paymentStatusLabels.value.map(r => t(r.label)),
  colors: ['#2563EB', '#F59E0B', '#22C55E', '#F43F5E', '#64748B', '#0EA5E9', '#A855F7', '#14B8A6'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const salesChartSeries = computed(() => [{
  name: t('فروش'),
  data: sales.value.map(p => p.value),
}])

const salesChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  colors: ['#2563EB'],
  grid: { borderColor: 'rgba(148,163,184,0.25)', strokeDashArray: 4 },
  xaxis: {
    categories: sales.value.map(p => p.label),
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px' },
      formatter: (val: number) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(val),
    },
  },
  tooltip: {
    y: { formatter: (val: number) => formatPrice(val) },
  },
}))

const periodRefunds = computed(() =>
  refunds.value.filter(r => isDateInRange(r.createdAt, range.value.start, range.value.end)),
)

const refundBuckets = computed(() => {
  const pending = periodRefunds.value.filter(r => r.status === 'pending' || r.status === 'processing').length
  const completed = periodRefunds.value.filter(r => r.status === 'completed').length
  const failed = periodRefunds.value.filter(r => r.status === 'failed').length
  const cancelled = periodRefunds.value.filter(r => r.status === 'cancelled').length
  return [
    { label: t('در انتظار'), value: pending },
    { label: t('تکمیل‌شده'), value: completed },
    { label: t('ناموفق'), value: failed },
    { label: t('لغو شده'), value: cancelled },
  ]
})

const refundChartSeries = computed(() => [{
  name: t('بازپرداخت'),
  data: refundBuckets.value.map(b => b.value),
}])

const refundChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
  colors: ['#0EA5E9'],
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148,163,184,0.25)', strokeDashArray: 4 },
  xaxis: {
    categories: refundBuckets.value.map(b => b.label),
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px' },
      formatter: (val: number) => new Intl.NumberFormat('fa-IR').format(val),
    },
  },
}))

const boot = await ensureLoaded()
if (!boot.ok) {
  toast.error(t(boot.error || loadError.value || 'بارگذاری اطلاعات مالی ناموفق بود'))
}
else if (boot.error) {
  toast.error(t(String(boot.error)))
}
</script>
