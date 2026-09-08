<template>
  <main class="max-w-7xl mx-auto">
    <div
      v-if="items.length < 2"
      class="py-6 md:py-10"
    >
      <div class="max-w-2xl mx-auto mb-8 md:mb-10">
        <div class="bg-default border border-muted rounded-3xl p-8 md:p-10 text-center">
          <UIcon
            name="i-tabler-arrows-diff"
            class="size-16 text-dimmed mx-auto mb-5"
          />
          <h1 class="text-xl font-bold text-highlighted mb-2">
            {{
              items.length === 1
                ? $t('یک محصول دیگر برای مقایسه اضافه کنید')
                : $t('برای مقایسه حداقل ۲ محصول انتخاب کنید')
            }}
          </h1>
          <p class="text-sm text-muted leading-7 mb-6 max-w-sm mx-auto">
            {{ $t('از محصولات پیشنهادی زیر همین صفحه انتخاب کنید یا در فروشگاه روی آیکون مقایسه بزنید.') }}
          </p>

          <div
            v-if="items.length === 1 && items[0]"
            class="max-w-xs mx-auto mb-6 text-start"
          >
            <TheProductCard :product="items[0]" />
          </div>

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

      <TheCompareSuggestions
        :title="$t('محصولات پیشنهادی برای مقایسه')"
        :subtitle="$t('با زدن آیکون مقایسه روی کارت، محصول به لیست اضافه می‌شود')"
        :products="suggestions"
        :pending="suggestionsPending"
        :view-all-to="suggestionsViewAllTo"
      />
    </div>

    <template v-else>
      <div class="hidden md:flex items-center justify-between flex-wrap gap-3 mb-5">
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

      <div class="md:hidden flex justify-end mb-3">
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
        class="grid gap-4 lg:grid-cols-2 mb-4"
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

      <div class="bg-default border border-muted rounded-2xl px-4 py-3 flex items-center justify-between mb-4">
        <div>
          <span class="text-xs font-bold text-highlighted">{{ $t('فقط تفاوت‌ها را نمایش بده') }}</span>
          <p class="text-[11px] text-dimmed mt-0.5">
            {{ $t('مشخصات یکسان کم‌رنگ نمایش داده می‌شوند') }}
          </p>
        </div>
        <USwitch v-model="diffOnly" />
      </div>

      <h2 class="text-sm font-bold text-highlighted mb-3">
        {{ $t('خلاصه مقایسه') }}
      </h2>
      <div
        class="overflow-x-auto no-scrollbar mb-4 pb-1"
        :class="items.length <= 3 ? '' : '-mx-1 px-1'"
      >
        <div
          class="grid gap-3 sm:gap-4 items-stretch"
          :style="summaryGridStyle"
        >
          <div
            v-for="(product, index) in items"
            :key="`summary-${product.id}`"
            class="bg-default border-2 rounded-2xl p-3 relative flex flex-col h-full min-w-0"
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
              class="block w-full aspect-square max-h-36 rounded-xl bg-muted overflow-hidden mb-2.5"
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
              class="block text-start text-[13px] leading-6 text-highlighted line-clamp-2 min-h-12 hover:text-primary transition-all  mb-2"
            >
              {{ product.title }}
            </NuxtLink>
            <div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
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
            <div class="mb-3 min-h-11">
              <span
                v-if="product.oldPrice"
                class="text-[11px] text-dimmed line-through num block"
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
              class="mt-auto font-medium hover:text-primary hover:border-primary"
              @click="addToCart(product.id)"
            >
              {{ $t('افزودن به سبد خرید') }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl">
        <div class="px-4 py-3.5 border-b border-muted flex items-center justify-between gap-2 rounded-t-2xl">
          <h2 class="text-sm font-bold text-highlighted">
            {{ $t('مقایسه مشخصات فنی') }}
          </h2>
          <span class="text-[11px] text-dimmed shrink-0">{{ $t('بر اساس دسته‌بندی محصولات') }}</span>
        </div>

        <div
          class="lg:hidden sticky top-12 md:top-36 z-20 bg-default/95 backdrop-blur border-b border-muted"
        >
          <div
            ref="headerRef"
            class="overflow-x-auto no-scrollbar px-2 py-2"
            @scroll="onHeaderScroll"
          >
            <div
              class="grid gap-2"
              :style="tableGridStyle"
            >
              <div class="sticky inset-e-0 z-10 bg-default px-2 py-2 text-[11px] text-dimmed flex items-center">
                {{ $t('کالا') }}
              </div>
              <div
                v-for="(product, index) in items"
                :key="`header-${product.id}`"
                class="flex items-center gap-2 min-w-0 rounded-lg border-2 p-1.5"
                :style="{ borderColor: productColor(index) }"
              >
                <TheIcon
                  :name="product.image || 'noImage.png'"
                  icon-type="img"
                  class="!size-9 rounded-lg object-cover bg-muted shrink-0"
                />
                <div class="min-w-0 flex-1">
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

        <div
          ref="tableRef"
          class="overflow-x-auto rounded-b-2xl"
          @scroll="onTableScroll"
        >
          <div>
            <template
              v-for="section in sections"
              :key="section.title"
            >
              <div
                class="grid border-b border-muted"
                :style="tableGridStyle"
              >
                <div
                  class="px-3 sm:px-4 py-2 bg-muted text-[11px] font-bold text-muted"
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
                :style="tableGridStyle"
              >
                <div
                  class="sticky inset-e-0 z-10 px-3 sm:px-4 py-3 text-[11px] text-muted border-s border-muted"
                  :class="rowIndex % 2 === 1 ? 'bg-muted' : 'bg-default'"
                >
                  {{ key }}
                </div>
                <div
                  v-for="product in items"
                  :key="`${product.id}-${key}`"
                  class="px-3 sm:px-4 py-3 text-xs leading-6 break-words min-w-0"
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

      <TheCompareSuggestions
        :title="$t('محصولات مشابه')"
        :subtitle="$t('می‌توانید محصول دیگری را هم به مقایسه اضافه کنید')"
        :products="suggestions"
        :pending="suggestionsPending"
        :view-all-to="suggestionsViewAllTo"
      />

      <div class="mt-6 flex items-center justify-center gap-3 flex-wrap">
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
import { formatPrice, type Product } from '~/data/products'
import { toSearchRoute } from '~/data/categories'

const { t } = useI18n()
const router = useRouter()
const compareStore = useCompareStore()
const { toggleCompare } = useCompareActions()
const { addToCart } = useShop()
const { fetchProducts } = useProducts()

useMobileBackwardTitle(() => t('مقایسه محصولات'))

const diffOnly = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const tableRef = ref<HTMLElement | null>(null)
const syncing = ref(false)
const suggestions = ref<Product[]>([])
const suggestionsPending = ref(false)

const items = computed(() => compareStore.products)

const primaryCategory = computed(() => items.value[0]?.category ?? '')

const suggestionsViewAllTo = computed(() => {
  if (!primaryCategory.value) return '/search'
  return toSearchRoute({ category: primaryCategory.value })
})

watch(
  primaryCategory,
  (category) => {
    if (category) void compareStore.fetchTemplates(category)
  },
  { immediate: true },
)

watch(
  () => [primaryCategory.value, compareStore.ids.join(',')].join('|'),
  () => {
    void loadSuggestions()
  },
  { immediate: true },
)

async function loadSuggestions() {
  suggestionsPending.value = true
  try {
    const exclude = new Set(compareStore.ids)
    const { result } = await fetchProducts({
      ...(primaryCategory.value ? { category: primaryCategory.value } : {}),
      sort: 'bestrated',
      page: 1,
      pageSize: 12,
    })
    suggestions.value = (result?.items ?? [])
      .filter(product => !exclude.has(product.id))
      .slice(0, 6)
  }
  finally {
    suggestionsPending.value = false
  }
}

const sections = computed(() => {
  const fromApi = compareStore.templates.sections as { title: string, rows: string[] }[]
  if (fromApi?.length) {
    const base = [...fromApi]
    if (base[0] && !base[0].rows.includes('برند')) {
      base[0] = { ...base[0], rows: ['برند', ...base[0].rows] }
    }
    return base
  }
  const base = compareSectionsFor(items.value.map(item => item.category))
  if (base.length && !base[0]!.rows.includes('برند')) {
    base[0] = { ...base[0]!, rows: ['برند', ...base[0]!.rows] }
  }
  return base
})

const criteria = computed(() => {
  const fromApi = compareStore.templates.radarCriteria
  if (fromApi?.length) return fromApi.slice(0, 6)
  return radarCriteriaFor(items.value.map(item => item.category))
})

const summaryGridStyle = computed(() => {
  const n = items.value.length
  /** Fixed card width when few products so they don't stretch full-bleed. */
  const card = '14rem'
  if (n <= 3) {
    return {
      gridTemplateColumns: `repeat(${n}, ${card})`,
      justifyContent: 'center',
      width: '100%',
    }
  }
  return {
    gridTemplateColumns: `repeat(${n}, minmax(11rem, 1fr))`,
    minWidth: `${n * 11}rem`,
  }
})

const tableGridStyle = computed(() => {
  const n = items.value.length
  const label = 100
  const col = n <= 3 ? 180 : 160
  if (n <= 3) {
    return {
      gridTemplateColumns: `${label}px repeat(${n}, ${col}px)`,
      width: 'max-content',
      marginInline: 'auto',
    }
  }
  return {
    gridTemplateColumns: `${label}px repeat(${n}, minmax(${col}px, 1fr))`,
    minWidth: `${label + col * n}px`,
  }
})

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
