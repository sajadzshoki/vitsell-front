<template>
  <div class="bg-default border border-muted rounded-2xl">
    <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-muted">
      <h3 class="font-bold text-highlighted flex items-center gap-2">
        <UIcon name="i-tabler-filter" class="size-5 text-primary shrink-0" />
        {{ $t('فیلترها') }}
        <UBadge
          v-if="activeCount > 0"
          color="primary"
          variant="subtle"
          size="sm"
          class="num"
        >
          {{ activeCount.toLocaleString('fa-IR') }}
        </UBadge>
      </h3>
      <div class="flex items-center gap-1">
        <UButton
          v-if="activeCount > 0"
          color="error"
          variant="link"
          size="xs"
          class="font-medium"
          @click="reset"
        >
          {{ $t('حذف همه') }}
        </UButton>
        <UButton
          v-if="closable"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          icon="i-tabler-x"
          class="lg:hidden"
          :aria-label="$t('بستن')"
          @click="emit('close')"
        />
      </div>
    </div>

    <section class="px-4 py-3 border-b border-muted">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggle('delivery')"
      >
        <span class="inline-flex items-center gap-2">
          <UIcon name="i-tabler-truck-delivery" class="size-4 text-warning" />
          {{ $t('ارسال سریع') }}
        </span>
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.delivery }"
        />
      </button>
      <div
        v-show="open.delivery"
        class="mt-3"
      >
        <USwitch
          v-model="filters.fastDelivery"
          :label="$t('فقط کالاهای ارسال سریع')"
          color="primary"
        />
      </div>
    </section>

    <section class="px-4 py-3 border-b border-muted">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggle('availability')"
      >
        {{ $t('وضعیت کالا') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.availability }"
        />
      </button>
      <div
        v-show="open.availability"
        class="mt-3 flex flex-col gap-3"
      >
        <UCheckbox
          v-model="filters.onlyInStock"
          :label="$t('فقط موجودها')"
        />
        <UCheckbox
          v-model="filters.onlyDiscount"
          :label="$t('فقط کالاهای دارای تخفیف')"
        />
      </div>
    </section>

    <section class="px-4 py-3 border-b border-muted">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggle('price')"
      >
        {{ $t('محدوده قیمت') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.price }"
        />
      </button>
      <div
        v-show="open.price"
        class="mt-3 space-y-3"
      >
        <div class="grid grid-cols-2 gap-2">
          <UFormField :label="$t('از')">
            <UInput
              :model-value="formatGrouped(filters.minPrice)"
              type="text"
              inputmode="numeric"
              size="sm"
              class="num"
              dir="ltr"
              @update:model-value="onMinPriceInput"
            />
          </UFormField>
          <UFormField :label="$t('تا')">
            <UInput
              :model-value="formatGrouped(filters.maxPrice)"
              type="text"
              inputmode="numeric"
              size="sm"
              class="num"
              dir="ltr"
              @update:model-value="onMaxPriceInput"
            />
          </UFormField>
        </div>
        <USlider
          v-model="priceRange"
          size="lg"
          :min="0"
          :max="priceCeiling"
          :step="priceStep"
          :min-steps-between-thumbs="1"
        />
        <p class="text-center text-[11px] text-muted num">
          {{ formatPrice(priceCeiling) }}
          {{ $t('تومان') }}
          <span class="text-dimmed">{{ $t('(حداکثر در نتایج)') }}</span>
        </p>
      </div>
    </section>

    <section
      v-if="brands.length"
      class="px-4 py-3 border-b border-muted"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggle('brand')"
      >
        {{ $t('برند') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.brand }"
        />
      </button>
      <div
        v-show="open.brand"
        class="mt-3 max-h-52 overflow-y-auto space-y-2"
      >
        <UCheckbox
          v-for="brand in brands"
          :key="brand"
          :model-value="filters.brands.includes(brand)"
          :label="brand"
          @update:model-value="(checked) => setBrand(brand, checked === true)"
        />
      </div>
    </section>

    <section
      v-for="attr in attributes"
      :key="attr.id"
      class="px-4 py-3 border-b border-muted last:border-b-0"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggleAttrSection(attr.slug)"
      >
        {{ attr.name }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': openAttrs[attr.slug] }"
        />
      </button>
      <div
        v-show="openAttrs[attr.slug]"
        class="mt-3 max-h-52 overflow-y-auto space-y-2"
      >
        <label
          v-for="option in attr.values"
          :key="option.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <UCheckbox
            :model-value="isAttrSelected(attr.slug, option.value)"
            @update:model-value="(checked) => setAttr(attr.slug, option.value, checked === true)"
          />
          <span
            v-if="attr.type === 'color' && option.meta"
            class="size-3.5 rounded-full border border-muted shrink-0"
            :style="{ backgroundColor: option.meta }"
          />
          <span class="text-sm text-toned">{{ option.label }}</span>
        </label>
      </div>
    </section>

    <section class="px-4 py-3">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default cursor-pointer"
        @click="toggle('rating')"
      >
        {{ $t('حداقل امتیاز') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.rating }"
        />
      </button>
      <div
        v-show="open.rating"
        class="mt-3 flex flex-col gap-2"
      >
        <button
          v-for="rating in searchRatingOptions"
          :key="rating"
          type="button"
          class="flex items-center gap-2 text-start rounded-lg px-2 py-1.5 transition-all  cursor-pointer"
          :class="filters.minRating === rating
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-elevated'"
          @click="filters.minRating = rating"
        >
          <span
            class="size-4 rounded-full border grid place-items-center shrink-0"
            :class="filters.minRating === rating ? 'border-primary' : 'border-accented'"
          >
            <span
              v-if="filters.minRating === rating"
              class="size-2 rounded-full bg-primary"
            />
          </span>
          <span
            v-if="rating === 0"
            class="text-xs text-toned"
          >
            {{ $t('همه') }}
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1"
          >
            <UIcon
              v-for="star in 5"
              :key="star"
              name="i-tabler-star-filled"
              class="size-3.5"
              :class="star <= rating ? 'text-warning' : 'text-accented'"
            />
            <span class="text-[11px] text-muted">{{ $t('و بالاتر') }}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  cloneSearchFilters,
  countActiveFilters,
  SEARCH_PRICE_MAX,
  searchRatingOptions,
  type SearchFilterAttribute,
  type SearchFilters,
} from '~/data/search'

const props = withDefaults(defineProps<{
  brands: string[]
  attributes?: SearchFilterAttribute[]
  priceCeiling?: number
  closable?: boolean
  focus?: 'delivery' | 'availability' | 'price' | 'brand' | 'rating' | ''
}>(), {
  attributes: () => [],
  priceCeiling: SEARCH_PRICE_MAX,
  closable: false,
  focus: '',
})

const filters = defineModel<SearchFilters>({ required: true })
const emit = defineEmits<{
  close: []
}>()

const open = reactive({
  delivery: true,
  availability: true,
  price: false,
  brand: false,
  rating: false,
})

const openAttrs = reactive<Record<string, boolean>>({})

const activeCount = computed(() =>
  countActiveFilters(filters.value, props.priceCeiling),
)

const priceCeiling = computed(() => Math.max(1, props.priceCeiling || SEARCH_PRICE_MAX))

const priceStep = computed(() => {
  const max = priceCeiling.value
  if (max <= 5_000_000) return 100_000
  if (max <= 50_000_000) return 500_000
  return 1_000_000
})

function toEnDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

function parseGrouped(value: unknown) {
  const digits = toEnDigits(String(value ?? '')).replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits)
}

function formatGrouped(value: number) {
  const n = Math.max(0, Math.floor(Number(value) || 0))
  return n.toLocaleString('en-US')
}

function onMinPriceInput(value: string | number) {
  const next = Math.min(parseGrouped(value), priceCeiling.value)
  filters.value = {
    ...filters.value,
    minPrice: next,
    maxPrice: Math.max(filters.value.maxPrice, next),
  }
}

function onMaxPriceInput(value: string | number) {
  const next = Math.min(Math.max(parseGrouped(value), filters.value.minPrice), priceCeiling.value)
  filters.value = {
    ...filters.value,
    maxPrice: next || priceCeiling.value,
  }
}

const priceRange = computed({
  get: () => [
    Math.min(filters.value.minPrice, priceCeiling.value),
    Math.min(filters.value.maxPrice, priceCeiling.value),
  ] as number[],
  set: (value: number[]) => {
    filters.value = {
      ...filters.value,
      minPrice: value[0] ?? 0,
      maxPrice: value[1] ?? priceCeiling.value,
    }
  },
})

watch(
  () => props.attributes.map(a => a.slug).join(','),
  () => {
    for (const attr of props.attributes) {
      if (openAttrs[attr.slug] === undefined) openAttrs[attr.slug] = false
    }
  },
  { immediate: true },
)

function toggle(key: keyof typeof open) {
  open[key] = !open[key]
}

function toggleAttrSection(slug: string) {
  openAttrs[slug] = !openAttrs[slug]
}

function reset() {
  filters.value = {
    ...cloneSearchFilters(),
    maxPrice: priceCeiling.value,
  }
}

function setBrand(brand: string, on: boolean) {
  const next = new Set(filters.value.brands)
  if (on) next.add(brand)
  else next.delete(brand)
  filters.value = { ...filters.value, brands: Array.from(next) }
}

function isAttrSelected(slug: string, value: string) {
  return (filters.value.attrs?.[slug] || []).includes(value)
}

function setAttr(slug: string, value: string, on: boolean) {
  const current = new Set(filters.value.attrs?.[slug] || [])
  if (on) current.add(value)
  else current.delete(value)
  const attrs = { ...(filters.value.attrs || {}) }
  if (current.size) attrs[slug] = Array.from(current)
  else delete attrs[slug]
  filters.value = { ...filters.value, attrs }
}

watch(
  () => props.focus,
  (section) => {
    if (section && section in open) open[section as keyof typeof open] = true
  },
  { immediate: true },
)
</script>
