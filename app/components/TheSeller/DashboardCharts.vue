<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <div class="xl:col-span-2 bg-default border border-muted rounded-2xl p-5">
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 class="font-bold text-highlighted">
            {{ $t('روند فروش') }}
          </h3>
          <p class="text-xs text-muted mt-1">
            {{ $t('مجموع') }}
            <span class="num font-medium text-toned">{{ formatPrice(salesTotal) }}</span>
          </p>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <UButton
            v-for="opt in rangeOptions"
            :key="opt.id"
            type="button"
            size="xs"
            :color="range === opt.id ? 'primary' : 'neutral'"
            :variant="range === opt.id ? 'soft' : 'ghost'"
            class="shrink-0 cursor-pointer"
            @click="$emit('update:range', opt.id)"
          >
            {{ $t(opt.label) }}
          </UButton>
        </div>
      </div>
      <ClientOnly>
        <apexchart
          type="area"
          height="260"
          :options="salesChartOptions"
          :series="salesChartSeries"
        />
        <template #fallback>
          <div class="h-64 flex items-end gap-2">
            <div
              v-for="point in sales"
              :key="point.label"
              class="flex-1 bg-primary/70 rounded-t-lg min-h-2"
              :style="{ height: `${barHeight(point.value, salesMax)}%` }"
            />
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('وضعیت سفارش‌ها') }}
      </h3>
      <ClientOnly>
        <apexchart
          type="donut"
          height="260"
          :options="statusChartOptions"
          :series="statusSeries"
        />
        <template #fallback>
          <div class="space-y-2">
            <div
              v-for="row in statusRows"
              :key="row.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-toned">{{ $t(row.label) }}</span>
              <span class="num font-medium">{{ row.value.toLocaleString('fa-IR') }}</span>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="xl:col-span-2 bg-default border border-muted rounded-2xl p-5">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('پرفروش‌ترین محصولات') }}
      </h3>
      <div
        v-if="!topProducts.length"
        class="text-sm text-muted py-8 text-center"
      >
        {{ $t('داده‌ای برای نمایش نیست') }}
      </div>
      <div
        v-else
        class="space-y-2"
      >
        <NuxtLink
          v-for="(product, index) in topProducts"
          :key="product.id"
          :to="`/seller/products/${product.id}`"
          class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-all  cursor-pointer"
        >
          <span class="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-bold num">
            {{ (index + 1).toLocaleString('fa-IR') }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-highlighted truncate">
              {{ product.label }}
            </div>
            <div class="text-[11px] text-muted num">
              {{ product.value.toLocaleString('fa-IR') }} {{ $t('فروش') }}
              <span v-if="product.meta"> · {{ product.meta }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('روند سفارش‌ها') }}
      </h3>
      <ClientOnly>
        <apexchart
          type="bar"
          height="240"
          :options="ordersChartOptions"
          :series="ordersChartSeries"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  sellerDashboardRangeOptions,
  type SellerDashboardNamedValue,
  type SellerDashboardRangeId,
  type SellerDashboardSeriesPoint,
} from '~/data/seller-dashboard'
import { sellerOrderStatusMeta, type SellerOrderStatus } from '~/data/seller'

const props = defineProps<{
  range: SellerDashboardRangeId
  sales: SellerDashboardSeriesPoint[]
  orders: SellerDashboardSeriesPoint[]
  statusDistribution: SellerDashboardNamedValue[]
  topProducts: SellerDashboardNamedValue[]
}>()

defineEmits<{
  'update:range': [value: SellerDashboardRangeId]
}>()

const { t } = useI18n()
const rangeOptions = sellerDashboardRangeOptions.filter(o => o.id !== 'custom')

const salesTotal = computed(() => props.sales.reduce((s, p) => s + p.value, 0))
const salesMax = computed(() => Math.max(...props.sales.map(p => p.value), 1))

function barHeight(value: number, max: number) {
  return Math.max(8, Math.round((value / max) * 100))
}

const statusRows = computed(() =>
  props.statusDistribution.map((row) => {
    const meta = sellerOrderStatusMeta[row.id as SellerOrderStatus]
    return {
      id: row.id,
      label: meta?.label || row.label,
      value: row.value,
    }
  }),
)

const statusSeries = computed(() => statusRows.value.map(r => r.value))

const chartColors = ['#2563EB', '#0EA5E9', '#22C55E', '#F59E0B', '#F43F5E', '#64748B']

const salesChartSeries = computed(() => [{
  name: t('فروش'),
  data: props.sales.map(p => p.value),
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
    categories: props.sales.map(p => p.label),
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

const statusChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  labels: statusRows.value.map(r => t(r.label)),
  colors: chartColors,
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const ordersChartSeries = computed(() => [{
  name: t('سفارش'),
  data: props.orders.map(p => p.value),
}])

const ordersChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
  colors: ['#0EA5E9'],
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148,163,184,0.25)', strokeDashArray: 4 },
  xaxis: {
    categories: props.orders.map(p => p.label),
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px' },
      formatter: (val: number) => new Intl.NumberFormat('fa-IR').format(val),
    },
  },
}))
</script>
