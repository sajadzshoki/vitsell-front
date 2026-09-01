<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('محصولات فروشگاه')"
        :count-label="!loading ? `${filtered.length.toLocaleString('fa-IR')} ${$t('کالا')}` : undefined"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('products.view')"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-download"
              class="cursor-pointer"
              @click="exportCsv"
            >
              {{ $t('خروجی') }}
            </UButton>
            <UButton
              v-if="can('products.create')"
              to="/seller/products/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
            >
              {{ $t('افزودن محصول') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('products.create')"
        to="/seller/products/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer font-medium"
      >
        {{ $t('افزودن محصول') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-download"
        class="cursor-pointer"
        @click="exportCsv"
      >
        {{ $t('خروجی CSV') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی محصول')"
      :has-active="hasAnyFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="onStatusChange"
      @clear="clearAllFilters"
    >
      <template #extra>
        <UButton
          type="button"
          color="neutral"
          :variant="showAdvanced ? 'soft' : 'ghost'"
          size="sm"
          icon="i-tabler-filter"
          class="cursor-pointer"
          @click="showAdvanced = !showAdvanced"
        >
          {{ $t('فیلتر پیشرفته') }}
          <span
            v-if="advancedActiveCount"
            class="num ms-1"
          >{{ advancedActiveCount.toLocaleString('fa-IR') }}</span>
        </UButton>
        <USelect
          :model-value="sort || 'newest'"
          :items="sortItems"
          value-key="value"
          class="w-40"
          @update:model-value="sort = String($event ?? '')"
        />
      </template>
    </TheSellerListToolbar>

    <div
      v-if="showAdvanced"
      class="relative z-20 mb-4 overflow-visible rounded-2xl border border-muted bg-muted/40 p-4"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UFormField :label="$t('دسته‌بندی')">
          <USelectMenu
            v-model="draft.category"
            :items="categoryFilterItems"
            value-key="value"
            :search-input="{ placeholder: $t('جستجوی دسته...') }"
            :placeholder="$t('همه')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="$t('برند')">
          <USelectMenu
            v-model="draft.brand"
            :items="brandFilterItems"
            value-key="value"
            :search-input="{ placeholder: $t('جستجوی برند...') }"
            :placeholder="$t('همه')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="$t('وضعیت موجودی')">
          <USelect
            v-model="draft.stock"
            :items="stockFilterItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <TheFormInput
          v-model="draft.priceMin"
          :label="$t('حداقل قیمت')"
          dir="ltr"
          digits-only
        />
        <TheFormInput
          v-model="draft.priceMax"
          :label="$t('حداکثر قیمت')"
          dir="ltr"
          digits-only
        />
        <TheIRDatePicker
          v-model="draft.dateFrom"
          :header="$t('از تاریخ')"
          :placeholder="$t('انتخاب تاریخ')"
        />
        <TheIRDatePicker
          v-model="draft.dateTo"
          :header="$t('تا تاریخ')"
          :placeholder="$t('انتخاب تاریخ')"
        />
        <div class="flex flex-col gap-2 justify-end sm:col-span-2 lg:col-span-1">
          <UCheckbox
            v-model="draft.hasDiscount"
            :label="$t('دارای تخفیف')"
          />
          <UCheckbox
            v-model="draft.hasVariants"
            :label="$t('دارای واریانت')"
          />
          <UCheckbox
            v-model="draft.featured"
            :label="$t('ویژه')"
          />
          <UCheckbox
            v-model="draft.published"
            :label="$t('منتشر شده')"
          />
        </div>
      </div>
      <div class="mt-4 flex items-center justify-end gap-2 flex-wrap">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          class="cursor-pointer"
          @click="resetDraftFilters"
        >
          {{ $t('بازنشانی') }}
        </UButton>
        <UButton
          type="button"
          color="primary"
          size="sm"
          class="cursor-pointer font-medium"
          :loading="applyingFilters"
          @click="applyAdvancedFilters"
        >
          {{ $t('اعمال فیلتر') }}
        </UButton>
      </div>
    </div>

    <div
      v-if="selectedIds.length"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <USelect
        v-model="bulkAction"
        :items="bulkActionItems"
        value-key="value"
        class="w-44"
        :placeholder="$t('اقدام گروهی')"
      />
      <UButton
        type="button"
        color="primary"
        size="xs"
        class="cursor-pointer"
        :disabled="!bulkAction || bulkRunning"
        :loading="bulkRunning"
        @click="runBulk"
      >
        {{ $t('اجرا') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو انتخاب') }}
      </UButton>
    </div>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 5"
        :key="n"
        class="h-28 rounded-2xl"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="filtered.length === 0"
      icon="i-tabler-package"
      :message="listings.length === 0 ? $t('هنوز محصولی ثبت نشده') : $t('محصولی با این فیلتر پیدا نشد')"
    >
      <template
        v-if="listings.length === 0 && can('products.create')"
        #actions
      >
        <UButton
          to="/seller/products/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین محصول') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div class="flex items-center gap-2 text-xs text-muted">
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
        <span class="num">
          {{ $t('صفحه') }} {{ page.toLocaleString('fa-IR') }} / {{ totalPages.toLocaleString('fa-IR') }}
        </span>
      </div>

      <div
        v-for="listing in paged"
        :key="listing.productId"
        class="relative"
      >
        <div class="absolute top-3 start-3 z-10">
          <UCheckbox
            :model-value="selectedIds.includes(listing.productId)"
            @update:model-value="toggleSelect(listing.productId, !!$event)"
          />
        </div>
        <div class="ps-8">
          <TheSellerProductRow :listing="listing" />
        </div>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 pt-2"
      >
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-chevron-right"
          class="cursor-pointer"
          :disabled="page <= 1"
          @click="page = page - 1"
        />
        <span class="text-xs text-muted num">
          {{ page.toLocaleString('fa-IR') }} / {{ totalPages.toLocaleString('fa-IR') }}
        </span>
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-chevron-left"
          class="cursor-pointer"
          :disabled="page >= totalPages"
          @click="page = page + 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sellerLowStockThreshold, type SellerListing, type SellerProductStatus } from '~/data/seller'
import { sellerProductFilterDefs } from '~/data/seller-filters'

const PAGE_SIZE = 10

const { t } = useI18n()
const toast = useAppToast()
const {
  listings,
  resolveProduct,
  fetchListings,
  setListingStatus,
} = useSeller()
const { can } = useSellerPermissions()
const { getCommerce, saveCommerce } = useSellerProductCommerce()
const { brands, ensureLoaded: ensureBrands } = useSellerBrands()
const { categories, ensureLoaded: ensureCategories } = useSellerCategories()

const { search, status, sort, page, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
  defaultSort: 'newest',
})

const filterDefs = computed(() => sellerProductFilterDefs)
const filters = useSellerFilters(filterDefs)

const loading = ref(true)
const showAdvanced = ref(false)
const applyingFilters = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)

type AdvancedDraft = {
  category: string
  brand: string
  stock: string
  priceMin: string
  priceMax: string
  dateFrom: string | null
  dateTo: string | null
  hasDiscount: boolean
  hasVariants: boolean
  featured: boolean
  published: boolean
}

function emptyDraft(): AdvancedDraft {
  return {
    category: 'all',
    brand: 'all',
    stock: 'all',
    priceMin: '',
    priceMax: '',
    dateFrom: null,
    dateTo: null,
    hasDiscount: false,
    hasVariants: false,
    featured: false,
    published: false,
  }
}

const draft = ref<AdvancedDraft>(emptyDraft())

function syncDraftFromFilters() {
  draft.value = {
    category: filters.getString('category') || 'all',
    brand: filters.getString('brand') || 'all',
    stock: filters.getString('stock') || 'all',
    priceMin: String(filters.values.value.priceMin || ''),
    priceMax: String(filters.values.value.priceMax || ''),
    dateFrom: String(filters.values.value.dateFrom || '') || null,
    dateTo: String(filters.values.value.dateTo || '') || null,
    hasDiscount: filters.values.value.hasDiscount === true,
    hasVariants: filters.values.value.hasVariants === true,
    featured: filters.values.value.featured === true,
    published: filters.values.value.published === true,
  }
}

watch(showAdvanced, (open) => {
  if (open) syncDraftFromFilters()
})

async function applyAdvancedFilters() {
  applyingFilters.value = true
  try {
    await filters.setValues({
      category: draft.value.category === 'all' ? null : draft.value.category,
      brand: draft.value.brand === 'all' ? null : draft.value.brand,
      stock: draft.value.stock === 'all' ? null : draft.value.stock,
      priceMin: draft.value.priceMin || null,
      priceMax: draft.value.priceMax || null,
      dateFrom: draft.value.dateFrom || null,
      dateTo: draft.value.dateTo || null,
      hasDiscount: draft.value.hasDiscount || null,
      hasVariants: draft.value.hasVariants || null,
      featured: draft.value.featured || null,
      published: draft.value.published || null,
    })
    page.value = 1
  }
  finally {
    applyingFilters.value = false
  }
}

function resetDraftFilters() {
  draft.value = emptyDraft()
}

ensureBrands()
void ensureCategories()

const statusTabs = computed(() => [
  { id: 'all', label: t('همه') },
  { id: 'active', label: t('فعال'), count: countBy('active') },
  { id: 'pending', label: t('در انتظار'), count: countBy('pending') },
  { id: 'inactive', label: t('غیرفعال'), count: countBy('inactive') },
  { id: 'out_of_stock', label: t('ناموجود'), count: countBy('out_of_stock') },
])

const sortItems = computed(() => [
  { value: 'newest', label: t('جدیدترین') },
  { value: 'price_asc', label: t('ارزان‌ترین') },
  { value: 'price_desc', label: t('گران‌ترین') },
  { value: 'stock_asc', label: t('کم‌موجودی') },
  { value: 'title', label: t('عنوان') },
])

const categoryFilterItems = computed(() => [
  { value: 'all', label: t('همه') },
  ...categories.value.map(c => ({ value: c.id, label: c.name })),
])

const brandFilterItems = computed(() => {
  const fromListings = new Set(listings.value.map(l => resolveProduct(l.productId).brand).filter(Boolean))
  const fromBrands = brands.value.map(b => b.name)
  const names = [...new Set([...fromBrands, ...fromListings])].sort((a, b) => a.localeCompare(b, 'en'))
  return [{ value: 'all', label: t('همه') }, ...names.map(n => ({ value: n, label: n }))]
})

const stockFilterItems = computed(() => [
  { value: 'all', label: t('همه') },
  { value: 'in_stock', label: t('موجود') },
  { value: 'low_stock', label: t('کم‌موجود') },
  { value: 'out_of_stock', label: t('ناموجود') },
])

const bulkActionItems = computed(() => {
  const items: { value: string, label: string }[] = []
  if (can('products.update')) {
    items.push(
      { value: 'activate', label: t('فعال‌سازی') },
      { value: 'deactivate', label: t('غیرفعال‌سازی') },
      { value: 'publish', label: t('انتشار') },
      { value: 'unpublish', label: t('لغو انتشار') },
      { value: 'feature', label: t('علامت ویژه') },
      { value: 'unfeature', label: t('حذف ویژه') },
    )
  }
  if (can('products.delete')) {
    items.push({ value: 'delete', label: t('حذف (غیرفعال)') })
  }
  return items
})

const advancedActiveCount = computed(() => {
  const values = filters.values.value
  let count = 0
  for (const def of filterDefs.value) {
    if (def.key === 'q' || def.key === 'status') continue
    if (def.type === 'dateRange' || def.type === 'numberRange') {
      const keys = def.type === 'dateRange'
        ? [def.fromKey ?? `${def.key}From`, def.toKey ?? `${def.key}To`]
        : [def.minKey ?? `${def.key}Min`, def.maxKey ?? `${def.key}Max`]
      if (keys.some(k => {
        const v = values[k]
        return v != null && v !== '' && !(Array.isArray(v) && !v.length)
      })) count += 1
      continue
    }
    const v = values[def.key]
    if (v != null && v !== '' && v !== false && !(Array.isArray(v) && !v.length)) count += 1
  }
  return count
})

const hasAnyFilters = computed(() =>
  Boolean(search.value)
  || (status.value && status.value !== 'all')
  || advancedActiveCount.value > 0
  || (sort.value && sort.value !== 'newest')
  || page.value > 1,
)

function onStatusChange(id: string) {
  status.value = id
}

function countBy(id: SellerProductStatus) {
  return listings.value.filter(item => item.status === id).length
}

function stockBucket(listing: SellerListing) {
  const commerce = getCommerce(listing.productId)
  const threshold = commerce.lowStockThreshold || sellerLowStockThreshold
  if (listing.status === 'out_of_stock' || listing.stock <= 0) return 'out_of_stock'
  if (listing.stock <= threshold) return 'low_stock'
  return 'in_stock'
}

const filtered = computed(() => {
  const q = search.value.trim()
  const category = filters.getString('category')
  const brand = filters.getString('brand')
  const stock = filters.getString('stock')
  const fv = filters.values.value
  const priceMin = Number(fv.priceMin || 0) || 0
  const priceMax = Number(fv.priceMax || 0) || 0
  const dateFrom = String(fv.dateFrom || '')
  const dateTo = String(fv.dateTo || '')
  const hasDiscount = fv.hasDiscount === true
  const hasVariants = fv.hasVariants === true
  const featured = fv.featured === true
  const published = fv.published === true

  let rows = listings.value.filter((listing) => {
    if (status.value !== 'all' && listing.status !== status.value) return false
    const product = resolveProduct(listing.productId)
    const commerce = getCommerce(listing.productId)

    if (q) {
      const hit = product.title.includes(q)
        || product.brand.includes(q)
        || listing.productId.includes(q)
        || commerce.sku.includes(q)
      if (!hit) return false
    }
    if (category && product.category !== category) return false
    if (brand && product.brand !== brand) return false
    if (stock && stockBucket(listing) !== stock) return false
    if (priceMin && product.price < priceMin) return false
    if (priceMax && product.price > priceMax) return false
    if (hasDiscount && !(product.oldPrice && product.oldPrice > product.price)) return false
    if (hasVariants && !commerce.variants.length) return false
    if (featured && !commerce.featured) return false
    if (published && !commerce.published) return false
    // date range reserved for when listing.createdAt exists on API
    if (dateFrom || dateTo) {
      void dateFrom
      void dateTo
    }
    return true
  })

  const sortKey = sort.value || 'newest'
  rows = [...rows].sort((a, b) => {
    const pa = resolveProduct(a.productId)
    const pb = resolveProduct(b.productId)
    if (sortKey === 'price_asc') return pa.price - pb.price
    if (sortKey === 'price_desc') return pb.price - pa.price
    if (sortKey === 'stock_asc') return a.stock - b.stock
    if (sortKey === 'title') return pa.title.localeCompare(pb.title, 'fa')
    return a.productId.localeCompare(b.productId)
  })

  return rows
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const paged = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

const allPageSelected = computed(() =>
  paged.value.length > 0 && paged.value.every(l => selectedIds.value.includes(l.productId)),
)

const somePageSelected = computed(() =>
  paged.value.some(l => selectedIds.value.includes(l.productId)),
)

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = paged.value.map(l => l.productId)
  if (on) {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  }
  else {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  }
}

async function clearAllFilters() {
  selectedIds.value = []
  draft.value = emptyDraft()
  await clearFilters()
  await filters.clear()
  sort.value = 'newest'
  await patchQuery({ sort: undefined })
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    const ids = [...selectedIds.value]
    for (const id of ids) {
      if (bulkAction.value === 'activate') await setListingStatus(id, 'active')
      else if (bulkAction.value === 'deactivate' || bulkAction.value === 'delete') {
        await setListingStatus(id, 'inactive')
      }
      else if (bulkAction.value === 'publish') {
        saveCommerce(id, { published: true })
        await setListingStatus(id, 'active')
      }
      else if (bulkAction.value === 'unpublish') {
        saveCommerce(id, { published: false })
        await setListingStatus(id, 'inactive')
      }
      else if (bulkAction.value === 'feature') saveCommerce(id, { featured: true })
      else if (bulkAction.value === 'unfeature') saveCommerce(id, { featured: false })
    }
    toast.success(t('اقدام گروهی انجام شد'))
    selectedIds.value = []
    bulkAction.value = ''
  }
  finally {
    bulkRunning.value = false
  }
}

function exportCsv() {
  const lines = [
    ['id', 'title', 'brand', 'category', 'price', 'stock', 'status'].join(','),
    ...filtered.value.map((listing) => {
      const p = resolveProduct(listing.productId)
      return [
        listing.productId,
        `"${p.title.replace(/"/g, '""')}"`,
        p.brand,
        p.category,
        p.price,
        listing.stock,
        listing.status,
      ].join(',')
    }),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `products-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(t('فایل خروجی آماده شد'))
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || error?.message || fallback
}

async function loadProducts() {
  loading.value = true
  try {
    const { ok, error } = await fetchListings({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری محصولات ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>
