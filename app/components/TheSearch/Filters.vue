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
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default"
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
      <div v-show="open.delivery" class="mt-3">
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
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default"
        @click="toggle('availability')"
      >
        {{ $t('وضعیت کالا') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.availability }"
        />
      </button>
      <div v-show="open.availability" class="mt-3 flex flex-col gap-3">
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
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default"
        @click="toggle('price')"
      >
        {{ $t('محدوده قیمت') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.price }"
        />
      </button>
      <div v-show="open.price" class="mt-3 space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <UFormField :label="$t('از')">
            <UInput
              v-model.number="filters.minPrice"
              type="number"
              size="sm"
              class="num"
            />
          </UFormField>
          <UFormField :label="$t('تا')">
            <UInput
              v-model.number="filters.maxPrice"
              type="number"
              size="sm"
              class="num"
            />
          </UFormField>
        </div>
        <USlider
          v-model="priceRange"
          size="lg"
          :min="0"
          :max="SEARCH_PRICE_MAX"
          :step="500_000"
          :min-steps-between-thumbs="1"
        />
        <p class="text-center text-[11px] text-muted">
          {{ $t('تومان') }}
        </p>
      </div>
    </section>

    <section class="px-4 py-3 border-b border-muted">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default"
        @click="toggle('brand')"
      >
        {{ $t('برند') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.brand }"
        />
      </button>
      <div v-show="open.brand" class="mt-3 max-h-52 overflow-y-auto space-y-2">
        <UCheckbox
          v-for="brand in brands"
          :key="brand"
          :model-value="filters.brands.includes(brand)"
          :label="brand"
          @update:model-value="toggleBrand(brand)"
        />
      </div>
    </section>

    <section class="px-4 py-3">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 text-sm font-bold text-default"
        @click="toggle('rating')"
      >
        {{ $t('حداقل امتیاز') }}
        <UIcon
          name="i-tabler-chevron-down"
          class="size-4 text-dimmed transition"
          :class="{ 'rotate-180': open.rating }"
        />
      </button>
      <div v-show="open.rating" class="mt-3 flex flex-col gap-2">
        <button
          v-for="rating in searchRatingOptions"
          :key="rating"
          type="button"
          class="flex items-center gap-2 text-start rounded-lg px-2 py-1.5 transition"
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
          <span v-if="rating === 0" class="text-xs text-toned">
            {{ $t('همه') }}
          </span>
          <span v-else class="inline-flex items-center gap-1">
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
import {
  cloneSearchFilters,
  countActiveFilters,
  SEARCH_PRICE_MAX,
  searchRatingOptions,
  type SearchFilters,
} from '~/data/search'

const props = withDefaults(defineProps<{
  brands: string[]
  closable?: boolean
  focus?: 'delivery' | 'availability' | 'price' | 'brand' | 'rating' | ''
}>(), {
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

const activeCount = computed(() => countActiveFilters(filters.value))

const priceRange = computed({
  get: () => [filters.value.minPrice, filters.value.maxPrice] as number[],
  set: (value: number[]) => {
    filters.value = {
      ...filters.value,
      minPrice: value[0] ?? 0,
      maxPrice: value[1] ?? SEARCH_PRICE_MAX,
    }
  },
})

function toggle(key: keyof typeof open) {
  open[key] = !open[key]
}

function reset() {
  filters.value = cloneSearchFilters()
}

function toggleBrand(brand: string) {
  const next = new Set(filters.value.brands)
  if (next.has(brand)) next.delete(brand)
  else next.add(brand)
  filters.value = { ...filters.value, brands: Array.from(next) }
}

watch(
  () => props.focus,
  (section) => {
    if (section && section in open) open[section] = true
  },
  { immediate: true },
)
</script>
