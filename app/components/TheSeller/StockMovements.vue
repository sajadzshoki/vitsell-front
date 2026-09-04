<template>
  <TheSellerForbidden
    v-if="!can('inventory.view')"
    :message="$t('برای مشاهده گردش موجودی مجوز inventory.view لازم است')"
  />

  <div
    v-else
    class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
  >
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('گردش موجودی')"
        :description="$t('تاریخچه تغییرات موجودی محصولات در انبارها')"
        :count-label="!loading ? `${movementsMeta.total.toLocaleString('fa-IR')} ${$t('رویداد')}` : undefined"
      >
        <template #actions>
          <UButton
            to="/seller/inventory"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-packages"
            class="cursor-pointer"
          >
            {{ $t('مدیریت موجودی') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/inventory"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به موجودی') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="typeFilter"
      :tabs="typeTabs"
      :search-placeholder="$t('جستجوی محصول، دلیل یا عامل')"
      :has-active="hasActiveFiltersCombined"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="onTypeChange"
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

    <div
      v-if="loading && !movements.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!movements.length"
      icon="i-tabler-arrows-exchange"
      :message="hasActiveFiltersCombined ? $t('رویدادی با این فیلتر پیدا نشد') : $t('هنوز گردش موجودی ثبت نشده')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="movement in movements"
        :key="movement.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ sellerStockMovementMeta[movement.type]?.label || movement.type }}
              </UBadge>
              <span class="text-sm font-medium text-highlighted">
                {{ movement.productTitle }}
              </span>
              <span
                v-if="movement.variantLabel"
                class="text-xs text-muted"
              >
                · {{ movement.variantLabel }}
              </span>
            </div>
            <div class="text-[11px] text-muted mt-2 flex flex-wrap gap-x-2 gap-y-1">
              <span>{{ $t('انبار') }}: {{ warehouseName(movement.warehouseId) }}</span>
              <span>·</span>
              <span class="num">{{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity.toLocaleString('fa-IR') }}</span>
              <span>·</span>
              <span class="num">{{ movement.before.toLocaleString('fa-IR') }} → {{ movement.after.toLocaleString('fa-IR') }}</span>
            </div>
            <div
              v-if="movement.reason"
              class="text-xs text-toned mt-2"
            >
              {{ movement.reason }}
            </div>
            <div class="text-[11px] text-muted mt-2">
              {{ movement.actorName }}
            </div>
          </div>
          <div
            class="text-[11px] text-muted num shrink-0"
            dir="ltr"
          >
            {{ formatDateTime(movement.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="movementsMeta.total"
        :items-per-page="movementsMeta.pageSize || pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { sellerStockMovementMeta, type SellerStockMovementType } from '~/data/seller-inventory'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const {
  movements,
  movementsMeta,
  warehouses,
  ensureWarehouses,
  fetchMovements,
  getWarehouse,
} = useSellerInventory()
const { search, status: typeFilter, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
  statusKey: 'type',
})

const loading = ref(true)
const pageSize = 15

ensureWarehouses()

const warehouseFilter = computed({
  get: () => String(route.query.warehouse ?? 'all') || 'all',
  set: (value: string) => {
    void patchQuery({ warehouse: !value || value === 'all' ? undefined : value, page: undefined })
  },
})

const hasExtraFilters = computed(() =>
  Boolean(warehouseFilter.value && warehouseFilter.value !== 'all'),
)

const hasActiveFiltersCombined = computed(() =>
  hasActiveFilters.value || hasExtraFilters.value,
)

const warehouseItems = computed(() => [
  { value: 'all', label: t('همه انبارها') },
  ...warehouses.value.map(w => ({ value: w.id, label: w.name })),
])

const typeTabs = computed(() => {
  const counts = movementsMeta.value.typeCounts || { all: 0 }
  const tabs: { id: string, label: string, count?: number }[] = [
    { id: 'all', label: t('همه'), count: Number(counts.all) || 0 },
  ]
  for (const [type, meta] of Object.entries(sellerStockMovementMeta) as [SellerStockMovementType, { label: string }][]) {
    const count = Number(counts[type]) || 0
    if (count > 0) {
      tabs.push({ id: type, label: meta.label, count })
    }
  }
  return tabs
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((movementsMeta.value.total || 0) / (movementsMeta.value.pageSize || pageSize))),
)

function onTypeChange(id: string) {
  typeFilter.value = id
}

async function clearAllFilters() {
  await clearFilters()
  await patchQuery({ warehouse: undefined })
}

function warehouseName(id: string) {
  return getWarehouse(id)?.name || id
}

function formatDateTime(iso: string) {
  return iso.slice(0, 16).replace('T', ' ')
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadMovements() {
  loading.value = true
  try {
    const { ok, error } = await fetchMovements({
      q: search.value || undefined,
      type: typeFilter.value || undefined,
      warehouseId: warehouseFilter.value !== 'all' ? warehouseFilter.value : undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری گردش موجودی ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadMovements()
  },
  { deep: true },
)

onMounted(() => {
  void loadMovements()
})
</script>
