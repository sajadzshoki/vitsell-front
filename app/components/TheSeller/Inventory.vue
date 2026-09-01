<template>
  <TheSellerForbidden
    v-if="!can('inventory.view')"
    :message="$t('برای مشاهده موجودی مجوز inventory.view لازم است')"
  />

  <div
    v-else
    class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
  >
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مدیریت موجودی')"
        :description="$t('موجودی محصولات و واریانت‌ها در انبارها')"
        :count-label="!loading ? `${filtered.length.toLocaleString('fa-IR')} ${$t('ردیف')}` : undefined"
      >
        <template #actions>
          <UButton
            to="/seller/inventory/movements"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-arrows-exchange"
            class="cursor-pointer"
          >
            {{ $t('گردش موجودی') }}
          </UButton>
          <UButton
            to="/seller/warehouses"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-building-warehouse"
            class="cursor-pointer"
          >
            {{ $t('انبارها') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 flex flex-col gap-2">
      <UButton
        to="/seller/inventory/movements"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-arrows-exchange"
        class="cursor-pointer"
      >
        {{ $t('گردش موجودی') }}
      </UButton>
      <UButton
        to="/seller/warehouses"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-building-warehouse"
        class="cursor-pointer"
      >
        {{ $t('انبارها') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی محصول، SKU یا واریانت')"
      :has-active="hasActiveFiltersCombined"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="onStatusChange"
      @clear="clearAllFilters"
    >
      <template #extra>
        <USelect
          :model-value="warehouseFilter"
          :items="warehouseItems"
          value-key="value"
          class="w-full sm:w-44 shrink-0"
          @update:model-value="warehouseFilter = $event"
        />
      </template>
    </TheSellerListToolbar>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <USelect
        :model-value="categoryFilter"
        :items="categoryItems"
        value-key="value"
        class="w-full sm:flex-1"
        @update:model-value="categoryFilter = $event"
      />
      <USelect
        :model-value="brandFilter"
        :items="brandItems"
        value-key="value"
        class="w-full sm:flex-1"
        @update:model-value="brandFilter = $event"
      />
    </div>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 5"
        :key="n"
        class="h-20 rounded-2xl"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="filtered.length === 0"
      icon="i-tabler-packages"
      :message="inventoryRows.length === 0 ? $t('ردیف موجودی ثبت نشده') : $t('ردیفی با این فیلتر پیدا نشد')"
    />

    <template v-else>
      <div class="hidden lg:block overflow-x-auto">
        <div class="min-w-[960px]">
          <div class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_repeat(4,minmax(0,0.75fr))] gap-3 px-4 py-2 text-[11px] text-muted font-medium border-b border-muted mb-2">
            <span>{{ $t('محصول') }}</span>
            <span>{{ $t('SKU') }}</span>
            <span>{{ $t('انبار') }}</span>
            <span>{{ $t('وضعیت') }}</span>
            <span class="text-center">{{ $t('موجودی') }}</span>
            <span class="text-center">{{ $t('رزرو') }}</span>
            <span class="text-center">{{ $t('قابل فروش') }}</span>
            <span class="text-center">{{ $t('آستانه') }}</span>
          </div>
          <div
            v-for="row in paged"
            :key="row.id"
            class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_repeat(4,minmax(0,0.75fr))] gap-3 items-center bg-muted border border-muted rounded-2xl px-4 py-3 mb-2"
          >
            <div class="min-w-0">
              <div class="text-sm font-medium text-highlighted truncate">
                {{ row.productTitle }}
              </div>
              <div
                v-if="row.variantLabel"
                class="text-[11px] text-muted truncate"
              >
                {{ row.variantLabel }}
              </div>
            </div>
            <span class="text-xs text-toned num truncate" dir="ltr">{{ row.sku }}</span>
            <span class="text-xs text-toned truncate">{{ warehouseName(row.warehouseId) }}</span>
            <div>
              <UBadge
                :color="statusColor(row.status)"
                variant="subtle"
                size="xs"
              >
                {{ statusLabel(row.status) }}
              </UBadge>
            </div>
            <div class="text-center text-sm num">{{ row.stock.toLocaleString('fa-IR') }}</div>
            <div class="text-center text-sm num text-muted">{{ row.reserved.toLocaleString('fa-IR') }}</div>
            <div class="text-center text-sm num">{{ row.available.toLocaleString('fa-IR') }}</div>
            <div class="text-center text-xs num text-muted">{{ row.lowStockThreshold.toLocaleString('fa-IR') }}</div>
            <div
              v-if="can('inventory.update')"
              class="col-span-full flex items-center justify-end gap-2 pt-1 border-t border-muted/60 mt-1"
            >
              <TheFormInput
                :model-value="draftStock(row.id, row.stock)"
                type="number"
                :placeholder="$t('موجودی جدید')"
                class="w-32"
                dir="ltr"
                @update:model-value="setDraftStock(row.id, Number($event))"
              />
              <UButton
                type="button"
                color="primary"
                size="xs"
                icon="i-tabler-device-floppy"
                class="cursor-pointer"
                :loading="savingId === row.id"
                :disabled="draftStock(row.id, row.stock) === row.stock"
                @click="saveStock(row)"
              >
                {{ $t('ذخیره') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:hidden space-y-3">
        <div
          v-for="row in paged"
          :key="row.id"
          class="bg-muted border border-muted rounded-2xl p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-medium text-highlighted">
                {{ row.productTitle }}
              </div>
              <div
                v-if="row.variantLabel"
                class="text-[11px] text-muted mt-0.5"
              >
                {{ row.variantLabel }}
              </div>
              <div class="text-[11px] text-muted mt-1 num" dir="ltr">
                {{ row.sku }}
              </div>
            </div>
            <UBadge
              :color="statusColor(row.status)"
              variant="subtle"
              size="xs"
            >
              {{ statusLabel(row.status) }}
            </UBadge>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-default rounded-xl p-2">
              <div class="text-muted">{{ $t('انبار') }}</div>
              <div class="text-toned mt-0.5">{{ warehouseName(row.warehouseId) }}</div>
            </div>
            <div class="bg-default rounded-xl p-2">
              <div class="text-muted">{{ $t('آستانه کمبود') }}</div>
              <div class="text-toned num mt-0.5">{{ row.lowStockThreshold.toLocaleString('fa-IR') }}</div>
            </div>
            <div class="bg-default rounded-xl p-2">
              <div class="text-muted">{{ $t('موجودی') }}</div>
              <div class="text-toned num mt-0.5">{{ row.stock.toLocaleString('fa-IR') }}</div>
            </div>
            <div class="bg-default rounded-xl p-2">
              <div class="text-muted">{{ $t('قابل فروش') }}</div>
              <div class="text-toned num mt-0.5">{{ row.available.toLocaleString('fa-IR') }}</div>
            </div>
          </div>
          <div
            v-if="can('inventory.update')"
            class="flex items-center gap-2"
          >
            <TheFormInput
              :model-value="draftStock(row.id, row.stock)"
              type="number"
              :placeholder="$t('موجودی جدید')"
              class="flex-1"
              dir="ltr"
              @update:model-value="setDraftStock(row.id, Number($event))"
            />
            <UButton
              type="button"
              color="primary"
              size="sm"
              icon="i-tabler-device-floppy"
              class="cursor-pointer shrink-0"
              :loading="savingId === row.id"
              :disabled="draftStock(row.id, row.stock) === row.stock"
              @click="saveStock(row)"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminFullName } from '~/data/seller-admins'
import type { SellerInventoryRow } from '~/data/seller-inventory'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { fetchListings, resolveProduct, updateListingStock } = useSeller()
const { getCommerce, setVariants } = useSellerProductCommerce()
const {
  inventoryRows,
  warehouses,
  ensureLoaded,
  ensureWarehouses,
  getWarehouse,
  appendMovement,
} = useSellerInventory()
const { currentAdminUser, ensureLoaded: ensureAdmins } = useSellerAdmins()
const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

const route = useRoute()
const loading = ref(true)
const savingId = ref<string | null>(null)
const stockDrafts = ref<Record<string, number>>({})
const pageSize = 15

ensureLoaded()
ensureWarehouses()
ensureAdmins()

const warehouseFilter = computed({
  get: () => String(route.query.warehouse ?? 'all') || 'all',
  set: (value: string) => {
    void patchQuery({ warehouse: !value || value === 'all' ? undefined : value, page: undefined })
  },
})

const categoryFilter = computed({
  get: () => String(route.query.category ?? 'all') || 'all',
  set: (value: string) => {
    void patchQuery({ category: !value || value === 'all' ? undefined : value, page: undefined })
  },
})

const brandFilter = computed({
  get: () => String(route.query.brand ?? 'all') || 'all',
  set: (value: string) => {
    void patchQuery({ brand: !value || value === 'all' ? undefined : value, page: undefined })
  },
})

const statusTabs = computed(() => [
  { id: 'all', label: t('همه'), count: inventoryRows.value.length },
  { id: 'in_stock', label: t('موجود'), count: countByStatus('in_stock') },
  { id: 'low_stock', label: t('کمبود'), count: countByStatus('low_stock') },
  { id: 'out_of_stock', label: t('ناموجود'), count: countByStatus('out_of_stock') },
])

const warehouseItems = computed(() => [
  { value: 'all', label: t('همه انبارها') },
  ...warehouses.value.map(w => ({ value: w.id, label: w.name })),
])

const categoryItems = computed(() => {
  const map = new Map<string, string>()
  for (const row of inventoryRows.value) {
    const product = resolveProduct(row.productId)
    if (product.category) {
      map.set(product.category, product.categoryLabel || product.category)
    }
  }
  return [
    { value: 'all', label: t('همه دسته‌ها') },
    ...[...map.entries()].map(([value, label]) => ({ value, label })),
  ]
})

const brandItems = computed(() => {
  const set = new Set<string>()
  for (const row of inventoryRows.value) {
    const product = resolveProduct(row.productId)
    if (product.brand) set.add(product.brand)
  }
  return [
    { value: 'all', label: t('همه برندها') },
    ...[...set].sort().map(value => ({ value, label: value })),
  ]
})

const hasExtraFilters = computed(() =>
  Boolean(
    (warehouseFilter.value && warehouseFilter.value !== 'all')
    || (categoryFilter.value && categoryFilter.value !== 'all')
    || (brandFilter.value && brandFilter.value !== 'all'),
  ),
)

const hasActiveFiltersCombined = computed(() =>
  hasActiveFilters.value || hasExtraFilters.value,
)

function onStatusChange(id: string) {
  status.value = id
}

async function clearAllFilters() {
  await clearFilters()
  await patchQuery({ warehouse: undefined, category: undefined, brand: undefined })
}

function countByStatus(id: SellerInventoryRow['status']) {
  return inventoryRows.value.filter(row => row.status === id).length
}

function warehouseName(id: string) {
  return getWarehouse(id)?.name || id
}

function statusColor(status: SellerInventoryRow['status']) {
  if (status === 'in_stock') return 'success'
  if (status === 'low_stock') return 'warning'
  return 'error'
}

function statusLabel(status: SellerInventoryRow['status']) {
  if (status === 'in_stock') return t('موجود')
  if (status === 'low_stock') return t('کمبود')
  return t('ناموجود')
}

function draftStock(id: string, fallback: number) {
  return stockDrafts.value[id] ?? fallback
}

function setDraftStock(id: string, value: number) {
  if (!Number.isFinite(value)) return
  stockDrafts.value = { ...stockDrafts.value, [id]: Math.max(0, Math.floor(value)) }
}

function actorName() {
  const admin = currentAdminUser()
  return admin ? adminFullName(admin) : t('مدیر')
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return inventoryRows.value.filter((row) => {
    if (status.value !== 'all' && row.status !== status.value) return false
    if (warehouseFilter.value && warehouseFilter.value !== 'all' && row.warehouseId !== warehouseFilter.value) return false
    const product = resolveProduct(row.productId)
    if (categoryFilter.value && categoryFilter.value !== 'all' && product.category !== categoryFilter.value) return false
    if (brandFilter.value && brandFilter.value !== 'all' && product.brand !== brandFilter.value) return false
    if (!q) return true
    return (
      row.productTitle.toLowerCase().includes(q)
      || row.sku.toLowerCase().includes(q)
      || (row.variantLabel?.toLowerCase().includes(q) ?? false)
      || product.brand.toLowerCase().includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

async function saveStock(row: SellerInventoryRow) {
  if (!can('inventory.update')) return
  const newStock = draftStock(row.id, row.stock)
  const before = row.stock
  if (newStock === before) return

  savingId.value = row.id
  try {
    if (row.variantId) {
      const commerce = getCommerce(row.productId)
      const variants = commerce.variants.map(variant =>
        variant.id === row.variantId ? { ...variant, stock: newStock } : variant,
      )
      setVariants(row.productId, variants)
    }
    else {
      const ok = await updateListingStock(row.productId, newStock)
      if (!ok) {
        toast.error(t('به‌روزرسانی موجودی ناموفق بود'))
        return
      }
    }

    appendMovement({
      productId: row.productId,
      productTitle: row.productTitle,
      variantId: row.variantId,
      variantLabel: row.variantLabel,
      warehouseId: row.warehouseId,
      type: 'adjust',
      quantity: newStock - before,
      before,
      after: newStock,
      reason: t('تنظیم دستی موجودی'),
      actorName: actorName(),
    })

    delete stockDrafts.value[row.id]
    toast.success(t('موجودی به‌روز شد'))
  }
  finally {
    savingId.value = null
  }
}

function apiErrorMessage(error: unknown, fallback: string) {
  const err = error as { data?: { errors?: { message?: string }[], message?: string }, message?: string }
  const fromFields = err?.data?.errors?.map(e => e.message).filter(Boolean).join(' ، ')
  return fromFields || err?.data?.message || err?.message || fallback
}

async function loadInventory() {
  loading.value = true
  try {
    const { ok, error } = await fetchListings({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری موجودی ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInventory()
})
</script>
