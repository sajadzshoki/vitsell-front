<template>
  <div class="lg:hidden mb-4 space-y-3 bg-default/75 -mx-3 px-3 -mt-4  backdrop-blur-md sticky top-18 py-2 z-5">
    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
      <UDropdownMenu :items="sortMenuItems">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-tabler-arrows-sort"
          class="shrink-0"
        >
          {{ $t(currentSortLabel) }}
        </UButton>
      </UDropdownMenu>

      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-tabler-filter"
        class="shrink-0"
        @click="openFilters('')"
      >
        {{ $t('فیلتر') }}
        <UBadge
          v-if="activeCount > 0"
          color="primary"
          variant="subtle"
          size="sm"
          class="num ms-1"
        >
          {{ activeCount.toLocaleString('fa-IR') }}
        </UBadge>
      </UButton>

      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        class="shrink-0"
        @click="openFilters('price')"
      >
        {{ $t('محدوده قیمت') }}
      </UButton>

      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        class="shrink-0"
        @click="openFilters('brand')"
      >
        {{ $t('برند') }}
      </UButton>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
      <UButton
        size="sm"
        :color="filters.fastDelivery ? 'primary' : 'neutral'"
        :variant="filters.fastDelivery ? 'soft' : 'outline'"
        icon="i-tabler-truck-delivery"
        class="shrink-0"
        @click="filters.fastDelivery = !filters.fastDelivery"
      >
        {{ $t('ارسال سریع') }}
      </UButton>
      <UButton
        size="sm"
        :color="filters.onlyDiscount ? 'primary' : 'neutral'"
        :variant="filters.onlyDiscount ? 'soft' : 'outline'"
        class="shrink-0"
        @click="filters.onlyDiscount = !filters.onlyDiscount"
      >
        {{ $t('تخفیف‌دار') }}
      </UButton>
      <UButton
        size="sm"
        :color="filters.onlyInStock ? 'primary' : 'neutral'"
        :variant="filters.onlyInStock ? 'soft' : 'outline'"
        class="shrink-0"
        @click="filters.onlyInStock = !filters.onlyInStock"
      >
        {{ $t('فقط موجود') }}
      </UButton>
    </div>

    <div class="flex items-center justify-between gap-3">
      <p
        v-if="total > 0"
        class="text-xs text-muted num"
      >
        {{ total.toLocaleString('fa-IR') }} {{ $t('کالا پیدا شده') }}
      </p>
      <div class="flex items-center gap-1">
        <UButton
          type="button"
          color="neutral"
          :variant="layout === 'grid' ? 'soft' : 'ghost'"
          size="sm"
          square
          icon="i-tabler-layout-grid"
          :aria-label="$t('نمایش ستونی')"
          @click="layout = 'grid'"
        />
        <UButton
          type="button"
          color="neutral"
          :variant="layout === 'list' ? 'soft' : 'ghost'"
          size="sm"
          square
          icon="i-tabler-list-details"
          :aria-label="$t('نمایش افقی')"
          @click="layout = 'list'"
        />
      </div>
    </div>

    <UModal
      v-model:open="modalOpen"
      fullscreen
      :title="$t('فیلترها')"
    >
      <template #body>
        <TheSearchFilters
          v-model="filters"
          :brands="brands"
          :attributes="attributes"
          :price-ceiling="priceCeiling"
          closable
          :focus="focusSection"
          @close="modalOpen = false"
        />
      </template>
      <template #footer>
        <UButton
          color="primary"
          block
          class="font-bold"
          @click="modalOpen = false"
        >
          {{ $t('نمایش') }}
          <template v-if="total > 0">
            {{ total.toLocaleString('fa-IR') }}
            {{ $t('کالا') }}
          </template>
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  searchSortOptions,
  type SearchFilterAttribute,
  type SearchFilters,
  type SearchLayout,
  type SearchSort,
} from '~/data/search'

const props = defineProps<{
  brands: string[]
  attributes?: SearchFilterAttribute[]
  priceCeiling?: number
  total: number
  activeCount: number
}>()

const filters = defineModel<SearchFilters>('filters', { required: true })
const sort = defineModel<SearchSort>('sort', { required: true })
const layout = defineModel<SearchLayout>('layout', { required: true })

const modalOpen = ref(false)
const focusSection = ref<'' | 'price' | 'brand'>('')

const attributes = computed(() => props.attributes ?? [])
const priceCeiling = computed(() => props.priceCeiling)

const currentSortLabel = computed(() =>
  searchSortOptions.find(option => option.id === sort.value)?.label ?? 'مرتبط‌ترین',
)

const sortMenuItems = computed(() =>
  searchSortOptions.map(option => ({
    label: option.label,
    checked: sort.value === option.id,
    onSelect: () => {
      sort.value = option.id
    },
  })),
)

function openFilters(section: '' | 'price' | 'brand') {
  focusSection.value = section
  modalOpen.value = true
}
</script>
