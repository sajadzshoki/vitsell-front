<template>
  <UModal
    v-model:open="open"
    :title="$t('نمودار قیمت فروش')"
    :description="product.title"
    :ui="{
      content: 'sm:max-w-3xl',
      description: 'text-xs text-muted line-clamp-2',
      body: 'space-y-4',
    }"
  >
    <template #body>
      <ClientOnly>
        <div class="w-full min-h-64">
          <apexchart
            type="line"
            height="320"
            :options="chartOptions"
            :series="series"
          />
        </div>
        <template #fallback>
          <div class="h-80 rounded-xl bg-muted animate-pulse" />
        </template>
      </ClientOnly>

      <div class="flex flex-wrap items-center gap-5 text-xs text-muted">
        <span class="inline-flex items-center gap-2">
          <span class="w-5 border-t-2 border-primary" />
          {{ $t('موجود') }}
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="w-5 border-t-2 border-dashed border-accented" />
          {{ $t('ناموجود') }}
        </span>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { getProductPriceHistory } from '~/data/product-price-history'
import type { Product } from '~/data/products'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const history = computed(() => getProductPriceHistory(props.product))

const categories = computed(() => history.value.map(p => p.label))

const series = computed(() => {
  const inStock: (number | null)[] = []
  const outStock: (number | null)[] = []

  for (let i = 0; i < history.value.length; i++) {
    const point = history.value[i]!
    const prev = history.value[i - 1]
    const next = history.value[i + 1]

    if (point.inStock) {
      inStock.push(point.price)
      const atEdge = (!!prev && !prev.inStock) || (!!next && !next.inStock)
      outStock.push(atEdge ? point.price : null)
    }
    else {
      outStock.push(point.price)
      const atEdge = !!prev?.inStock || !!next?.inStock
      inStock.push(atEdge ? point.price : null)
    }
  }

  return [
    { name: t('موجود'), data: inStock },
    { name: t('ناموجود'), data: outStock },
  ]
})

function themeColor(varName: string, fallback: string) {
  if (!import.meta.client) return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

const chartOptions = computed(() => {
  const primary = themeColor('--ui-primary', '#2563EB')
  const muted = themeColor('--ui-text-muted', '#9ca3af')
  const border = themeColor('--ui-border', '#e5e7eb')
  const text = themeColor('--ui-text-toned', '#6b7280')

  return {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
      animations: { enabled: true },
      background: 'transparent',
    },
    colors: [primary, muted],
    stroke: {
      width: [2.5, 2],
      curve: 'smooth',
      dashArray: [0, 6],
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    grid: {
      borderColor: border,
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: categories.value,
      tickAmount: 6,
      labels: {
        style: { colors: text, fontSize: '11px' },
        rotate: 0,
        hideOverlappingLabels: true,
      },
      axisBorder: { color: border },
      axisTicks: { color: border },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: text, fontSize: '11px' },
        formatter: (val: number) => formatPrice(Math.round(val)),
      },
      title: {
        text: t('تومان'),
        style: { color: text, fontSize: '11px', fontWeight: 500 },
      },
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      x: {
        formatter: (_: unknown, opts: { dataPointIndex: number }) => {
          const point = history.value[opts.dataPointIndex]
          return point?.label ?? ''
        },
      },
      y: {
        formatter: (val: number | null, opts: { dataPointIndex: number }) => {
          if (val == null) return ''
          const point = history.value[opts.dataPointIndex]
          const extra = point
            ? `<br/><span style="opacity:.75">${point.seller}</span>`
            : ''
          return `${formatPrice(Math.round(val))} ${t('تومان')}${extra}`
        },
      },
    },
  }
})
</script>
