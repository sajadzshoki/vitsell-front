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
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رویداد')}`"
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
      :has-active="hasActiveFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="onTypeChange"
      @clear="clearFilters"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-arrows-exchange"
      :message="movements.length === 0 ? $t('هنوز گردش موجودی ثبت نشده') : $t('رویدادی با این فیلتر پیدا نشد')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="movement in paged"
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
                {{ sellerStockMovementMeta[movement.type].label }}
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
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { sellerStockMovementMeta, type SellerStockMovementType } from '~/data/seller-inventory'

const { t } = useI18n()
const { can } = useSellerPermissions()
const { movements, ensureLoaded, getWarehouse } = useSellerInventory()
const { search, status: typeFilter, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  statusKey: 'type',
})

ensureLoaded()

const pageSize = 15

const typeTabs = computed(() => {
  const all = movements.value.length
  const tabs: { id: string, label: string, count?: number }[] = [
    { id: 'all', label: t('همه'), count: all },
  ]
  for (const [type, meta] of Object.entries(sellerStockMovementMeta) as [SellerStockMovementType, { label: string }][]) {
    const count = movements.value.filter(m => m.type === type).length
    if (count > 0) {
      tabs.push({ id: type, label: meta.label, count })
    }
  }
  return tabs
})

function onTypeChange(id: string) {
  typeFilter.value = id
}

function warehouseName(id: string) {
  return getWarehouse(id)?.name || id
}

function formatDateTime(iso: string) {
  return iso.slice(0, 16).replace('T', ' ')
}

const filtered = computed(() => {
  const q = search.value.trim()
  return movements.value.filter((movement) => {
    if (typeFilter.value !== 'all' && movement.type !== typeFilter.value) return false
    if (!q) return true
    return (
      movement.productTitle.includes(q)
      || movement.reason.includes(q)
      || movement.actorName.includes(q)
      || (movement.variantLabel?.includes(q) ?? false)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
</script>
