<template>
  <div class="w-full px-3 py-4 sm:px-4 lg:px-6">
    <header class="mb-4 flex flex-col gap-4 sm:mb-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm text-muted">
            {{ $t('دسته‌بندی') }}
          </p>
          <h1 class="truncate text-xl font-700 text-highlighted md:text-2xl">
            {{ categoryTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-2 lg:hidden">
          <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-tabler-adjustments-horizontal"
              :label="$t('فیلترها')"
              @click="filtersOpen = true"
          />
          <UBadge
              v-if="activeFilterCount"
              color="primary"
              variant="solid"
              size="xs"
              :label="activeFilterCount.toLocaleString('fa-IR')"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">
          {{ totalProducts.toLocaleString('fa-IR') }} {{ $t('محصول') }}
        </p>
        <USelect
            v-model="sortBy"
            :items="sortOptions"
            size="sm"
            class="w-44"
            :placeholder="$t('مرتب‌سازی')"
        />
      </div>
    </header>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="hidden lg:block lg:sticky lg:top-16 lg:self-start">
        <UCard>
          <TheCategoryFilters
              v-model:price-min="priceMin"
              v-model:price-max="priceMax"
              v-model:selected-brands="selectedBrands"
              v-model:min-rating="minRating"
              v-model:only-available="onlyAvailable"
          />
        </UCard>
      </aside>

      <section class="min-w-0">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          <TheProductCard
              v-for="n in 40"
              :key="n"
              :n="n"
          />
        </div>
      </section>
    </div>

    <USlideover
        v-model:open="filtersOpen"
        side="right"
        :title="$t('فیلترها')"
    >
      <template #body>
        <TheCategoryFilters
            v-model:price-min="priceMin"
            v-model:price-max="priceMax"
            v-model:selected-brands="selectedBrands"
            v-model:min-rating="minRating"
            v-model:only-available="onlyAvailable"
        />
      </template>
      <template #footer>
        <UButton
            block
            size="md"
            :label="$t('مشاهده محصولات')"
            @click="filtersOpen = false"
        />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const totalProducts = 40
const filtersOpen = ref(false)

const sortBy = ref('bestseller')
const priceMin = ref('')
const priceMax = ref('')
const selectedBrands = ref<string[]>([])
const minRating = ref<number | null>(null)
const onlyAvailable = ref(false)

const categoryTitles: Record<string, string> = {
  mobile: 'موبایل و تبلت',
  laptop: 'لپ‌تاپ و کامپیوتر',
  audio: 'صوتی و تصویری',
  accessory: 'لوازم جانبی',
}

const categoryTitle = computed(() => {
  const id = String(route.params.id ?? '')
  const title = categoryTitles[id]
  return title ? t(title) : `${t('دسته')} ${id || t('محصولات')}`
})

const sortOptions = computed(() => [
  { label: t('پرفروش‌ترین'), value: 'bestseller' },
  { label: t('جدیدترین'), value: 'newest' },
  { label: t('ارزان‌ترین'), value: 'cheapest' },
  { label: t('گران‌ترین'), value: 'expensive' },
  { label: t('بیشترین تخفیف'), value: 'discount' },
])

const activeFilterCount = computed(() => {
  let count = 0
  if (priceMin.value) count++
  if (priceMax.value) count++
  count += selectedBrands.value.length
  if (minRating.value !== null) count++
  if (onlyAvailable.value) count++
  return count
})
</script>
