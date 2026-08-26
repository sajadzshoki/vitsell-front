<template>
  <main class="max-w-7xl mx-auto py-4">
    <div
      v-if="items.length < 2"
      class="max-w-2xl mx-auto px-3 sm:px-4 py-16"
    >
      <div class="bg-default border border-muted rounded-3xl p-10 text-center">
        <UIcon
          name="i-tabler-arrows-diff"
          class="size-16 text-dimmed mx-auto mb-5"
        />
        <h1 class="text-xl font-bold text-highlighted mb-2">
          {{ $t('برای مقایسه حداقل ۲ محصول انتخاب کنید') }}
        </h1>
        <p class="text-sm text-muted leading-7 mb-6 max-w-sm mx-auto">
          {{ $t('روی آیکون مقایسه در کارت محصولات کلیک کنید تا تا ۴ کالا را کنار هم مقایسه کنید.') }}
        </p>
        <UButton
          color="primary"
          size="xl"
          class="font-bold shadow-lg shadow-primary/25"
          to="/"
        >
          {{ $t('بازگشت به فروشگاه') }}
        </UButton>
      </div>
    </div>

    <template v-else>
      <div class="px-3 sm:px-4 flex items-center justify-between flex-wrap gap-3 mb-5">
        <div class="flex items-center gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="md"
            square
            icon="i-tabler-chevron-right"
            :aria-label="$t('بازگشت')"
            @click="router.back()"
          />
          <div>
            <h1 class="text-xl font-bold text-highlighted">
              {{ $t('مقایسه محصولات') }}
            </h1>
            <p class="text-xs text-dimmed num mt-0.5">
              {{ items.length.toLocaleString('fa-IR') }} {{ $t('محصول انتخاب شده') }}
            </p>
          </div>
        </div>

        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-x"
          class="text-xs font-medium"
          @click="clearAndGoHome"
        >
          {{ $t('پاک کردن همه') }}
        </UButton>
      </div>

      <div
        v-if="criteria.length >= 3"
        class="px-3 sm:px-4 grid gap-4 lg:grid-cols-2 mb-4"
      >
        <div class="bg-default border border-muted rounded-2xl p-4">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-highlighted">
              {{ $t('مقایسه سریع') }}
            </h2>
            <span class="text-[10px] text-dimmed">{{ $t('نمودار راداری') }}</span>
          </div>
          <TheCompareRadarChart
            :criteria="criteria"
            :series="radarSeries"
          />
        </div>

        <div class="bg-default border border-muted rounded-2xl p-4">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-sm font-bold text-highlighted">
              {{ $t('نکات کلیدی مقایسه') }}
            </h2>
            <span class="text-[10px] text-dimmed">{{ $t('ترجیحات مشخص') }}</span>
          </div>
          <div>
            <div
              v-for="row in highlightRows"
              :key="row.criterion"
              class="flex items-center justify-between gap-3 py-2.5 border-b border-muted last:border-0"
            >
              <span class="text-[11px] text-muted shrink-0">{{ row.label }}</span>
              <div
                v-if="row.winner"
                class="flex items-center gap-2 min-w-0"
              >
                <span class="text-[11px] font-bold text-highlighted truncate">
                  {{ getProductShortName(row.winner) }}
                </span>
                <span class="text-[10px] font-bold text-inverted bg-inverted rounded-md px-1.5 py-0.5 num shrink-0">
                  {{ row.score.toLocaleString('fa-IR') }}
                </span>
              </div>
              <span
                v-else-if="row.score > 0"
                class="text-[11px] text-muted shrink-0"
              >
                {{ $t('مساوی') }}
              </span>
              <span
                v-else
                class="text-[11px] text-dimmed shrink-0"
              >
                —
              </span>
            </div>
          </div>
          <p class="text-[10px] text-dimmed mt-3 leading-5">
            {{ $t('امتیازها بر اساس داده‌های فنی و بازخوردها به‌صورت تخمینی محاسبه شده‌اند و فقط برای راهنمایی هستند.') }}
          </p>
        </div>
      </div>

      <div class="mx-3 sm:mx-4 bg-default border border-muted rounded-2xl px-4 py-3 flex items-center justify-between mb-4">
        <div>
          <span class="text-xs font-bold text-highlighted">{{ $t('فقط تفاوت‌ها را نمایش بده') }}</span>
          <p class="text-[11px] text-dimmed mt-0.5">
            {{ $t('مشخصات یکسان کم‌رنگ نمایش داده می‌شوند') }}
          </p>
        </div>
        <USwitch v-model="diffOnly" />
      </div>

      <div class="lg:hidden sticky top-36 z-20 -mx-0 px-3 sm:px-4 bg-muted/95 backdrop-blur border-b border-muted py-2 mb-3">
        <div
          ref="headerRef"
          class="overflow-x-auto no-scrollbar"
          @scroll="onHeaderScroll"
        >
          <div
            class="grid gap-3"
            :style="gridStyle"
          >
            <div class="sticky inset-e-0 bg-muted px-4 py-2 text-[11px] text-dimmed">
              {{ $t('کالا') }}
            </div>
            <div
              v-for="(product, index) in items"
              :key="`header-${product.id}`"
              class="flex items-center gap-2 min-w-0 rounded-lg border-2 p-1"
              :style="{ borderColor: productColor(index) }"
            >
              <TheIcon
                :name="product.image || 'noImage.png'"
                icon-type="img"
                class="!size-10 rounded-lg object-cover bg-muted shrink-0"
              />
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-highlighted truncate">
                  {{ product.title }}
                </div>
                <div class="text-[11px] font-extrabold text-highlighted num">
                  {{ formatPrice(product.price) }}
                  <span class="text-[9px] font-normal text-dimmed">{{ $t('تومان') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 class="px-3 sm:px-4 text-sm font-bold text-highlighted mb-3">
        {{ $t('خلاصه مقایسه') }}
      </h2>
      <div class="overflow-x-auto no-scrollbar px-3 sm:px-4 mb-4 pb-1">
        <div
          class="grid gap-3 sm:gap-4"
          :style="gridStyle"
        >
          <div class="hidden sm:block" />
          <div
            v-for="(product, index) in items"
            :key="`summary-${product.id}`"
            class="bg-default border-2 rounded-2xl p-3 relative"
            :style="{ borderColor: productColor(index) }"
          >
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="xs"
              square
              icon="i-tabler-x"
              class="absolute top-2 inset-s-2 z-10"
              :aria-label="$t('حذف از مقایسه')"
              @click="toggleCompare(product.id)"
            />
            <NuxtLink
              :to="{ name: 'product-id', params: { id: product.id } }"
              class="block w-full h-32 rounded-xl bg-muted overflow-hidden mb-2.5"
            >
              <TheIcon
                :name="product.image || 'noImage.png'"
                icon-type="img"
                class="!size-full object-cover"
              />
            </NuxtLink>
            <div class="text-[10px] text-dimmed tracking-wider mb-1 uppercase">
              {{ product.brand }}
            </div>
            <NuxtLink
              :to="{ name: 'product-id', params: { id: product.id } }"
              class="block text-start text-[13px] leading-6 text-highlighted line-clamp-2 min-h-12 hover:text-primary transition mb-2"
            >
              {{ product.title }}
            </NuxtLink>
            <div class="flex items-center gap-1.5 mb-2.5">
              <div class="flex items-center gap-0.5 bg-warning/10 text-warning rounded-md px-1.5 py-0.5">
                <UIcon name="i-tabler-star-filled" class="size-3" />
                <span class="text-[11px] font-semibold num">
                  {{ product.rating.toLocaleString('fa-IR') }}
                </span>
              </div>
              <span
                class="text-[10px] flex items-center gap-1"
                :class="product.inStock === false ? 'text-dimmed' : 'text-success'"
              >
                <UIcon
                  :name="product.inStock === false ? 'i-tabler-x' : 'i-tabler-check'"
                  class="size-3"
                />
                {{ product.inStock === false ? $t('ناموجود') : $t('موجود در انبار') }}
              </span>
            </div>
            <div class="mb-3">
              <span
                v-if="product.oldPrice"
                class="text-[11px] text-dimmed line-through num"
              >
                {{ formatPrice(product.oldPrice) }}
              </span>
              <div class="flex items-baseline gap-1">
                <span class="text-base font-extrabold text-highlighted num">
                  {{ formatPrice(product.price) }}
                </span>
                <span class="text-[10px] text-muted">{{ $t('تومان') }}</span>
              </div>
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              block
              class="font-medium hover:text-primary hover:border-primary"
              @click="addToCart(product.id)"
            >
              {{ $t('افزودن به سبد خرید') }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="mx-3 sm:mx-4 bg-default border border-muted rounded-2xl overflow-hidden">
        <div class="px-4 py-3.5 border-b border-muted flex items-center justify-between">
          <h2 class="text-sm font-bold text-highlighted">
            {{ $t('مقایسه مشخصات فنی') }}
          </h2>
          <span class="text-[11px] text-dimmed">{{ $t('بر اساس دسته‌بندی محصولات') }}</span>
        </div>
        <div
          ref="tableRef"
          class="overflow-x-auto"
          @scroll="onTableScroll"
        >
          <div>
            <template
              v-for="section in sections"
              :key="section.title"
            >
              <div
                class="grid border-b border-muted"
                :style="gridStyle"
              >
                <div
                  class="px-4 py-2 bg-muted text-[11px] font-bold text-muted"
                  :style="{ gridColumn: '1 / -1' }"
                >
                  {{ section.title }}
                </div>
              </div>
              <div
                v-for="(key, rowIndex) in section.rows"
                :key="`${section.title}-${key}`"
                class="grid border-b border-muted transition-opacity duration-300"
                :class="{ 'opacity-40': diffOnly && isIdentical(key) }"
                :style="gridStyle"
              >
                <div
                  class="sticky inset-e-0 z-10 px-4 py-3 text-[11px] text-muted border-s border-muted"
                  :class="rowIndex % 2 === 1 ? 'bg-muted' : 'bg-default'"
                >
                  {{ key }}
                </div>
                <div
                  v-for="product in items"
                  :key="`${product.id}-${key}`"
                  class="px-4 py-3 text-xs leading-6"
                  :class="[
                    rowIndex % 2 === 1 ? 'bg-muted' : 'bg-default',
                    isIdentical(key) ? 'text-muted' : 'text-highlighted font-medium',
                  ]"
                >
                  {{ compareSpecValue(product, key) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-center gap-3 flex-wrap px-3 sm:px-4">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          to="/"
        >
          {{ $t('ادامه خرید') }}
        </UButton>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import {
  compareSectionsFor,
  compareSpecValue,
  getProductScores,
  getProductShortName,
  highlightLabel,
  radarChartColors,
  radarCriteriaFor,
} from '~/data/compare'
import { formatPrice } from '~/data/products'

const { t } = useI18n()
const router = useRouter()
const compareStore = useCompareStore()
const { toggleCompare } = useCompareActions()
const { addToCart } = useShop()

const diffOnly = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const tableRef = ref<HTMLElement | null>(null)
const syncing = ref(false)

const items = computed(() => compareStore.products)

const sections = computed(() => {
  const base = compareSectionsFor(items.value.map(item => item.category))
  if (base.length && !base[0]!.rows.includes('برند')) {
    base[0] = { ...base[0]!, rows: ['برند', ...base[0]!.rows] }
  }
  return base
})

const criteria = computed(() => radarCriteriaFor(items.value.map(item => item.category)))

const gridStyle = computed(() => ({
  gridTemplateColumns: `140px repeat(${items.value.length}, minmax(240px, 1fr))`,
  minWidth: `${140 + 240 * items.value.length}px`,
}))

function productColor(index: number) {
  return radarChartColors[index % radarChartColors.length]!
}

const radarSeries = computed(() =>
  items.value.map((product, index) => ({
    name: getProductShortName(product),
    color: productColor(index),
    values: criteria.value.map(criterion => getProductScores(product)[criterion] ?? 50),
  })),
)

const highlightRows = computed(() =>
  criteria.value.slice(0, 5).map((criterion) => {
    const scored = items.value
      .map(product => ({ product, value: getProductScores(product)[criterion] ?? 0 }))
      .sort((a, b) => b.value - a.value)
    const top = scored[0]
    const tie = scored.length > 1 && scored[1]!.value === top!.value && top!.value > 0

    return {
      criterion,
      label: highlightLabel(criterion),
      winner: tie || !top || top.value <= 0 ? null : top.product,
      score: top?.value ?? 0,
    }
  }),
)

function isIdentical(key: string) {
  if (items.value.length < 2) return true
  const first = compareSpecValue(items.value[0]!, key)
  return items.value.every(product => compareSpecValue(product, key) === first)
}

function onHeaderScroll() {
  syncScroll('h')
}

function onTableScroll() {
  syncScroll('t')
}

function syncScroll(from: 'h' | 't') {
  if (syncing.value) return
  const fromEl = from === 'h' ? headerRef.value : tableRef.value
  const toEl = from === 'h' ? tableRef.value : headerRef.value
  if (!fromEl || !toEl) return

  syncing.value = true
  toEl.scrollLeft = fromEl.scrollLeft
  requestAnimationFrame(() => {
    syncing.value = false
  })
}

function clearAndGoHome() {
  compareStore.clearCompare()
  router.push('/')
}

useSeoMeta({
  title: () => t('مقایسه محصولات'),
})
</script>
