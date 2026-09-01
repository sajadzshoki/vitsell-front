<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('سفارش‌های فروشگاه')"
        :count-label="!pending ? `${filtered.length.toLocaleString('fa-IR')} ${$t('سفارش')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="can('orders.export') || can('orders.view')"
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
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
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
      :search-placeholder="$t('جستجوی سفارش، خریدار، تلفن یا SKU')"
      :has-active="hasAnyFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAll"
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
        </UButton>
        <USelect
          :model-value="sort || 'newest'"
          :items="sortItems"
          value-key="value"
          class="w-40"
          @update:model-value="sort = String($event ?? 'newest')"
        />
      </template>
    </TheSellerListToolbar>

    <div
      v-if="showAdvanced"
      class="mb-4 rounded-2xl border border-muted bg-muted/40 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <UFormField :label="$t('وضعیت پرداخت')">
        <USelect
          :model-value="filters.getString('payment') || 'all'"
          :items="paymentFilterItems"
          value-key="value"
          class="w-full"
          @update:model-value="setSelectFilter('payment', $event)"
        />
      </UFormField>
      <UFormField :label="$t('وضعیت ارسال')">
        <USelect
          :model-value="filters.getString('shipping') || 'all'"
          :items="shippingFilterItems"
          value-key="value"
          class="w-full"
          @update:model-value="setSelectFilter('shipping', $event)"
        />
      </UFormField>
      <UFormField :label="$t('روش پرداخت')">
        <USelect
          :model-value="filters.getString('paymentMethod') || 'all'"
          :items="paymentMethodItems"
          value-key="value"
          class="w-full"
          @update:model-value="setSelectFilter('paymentMethod', $event)"
        />
      </UFormField>
      <TheFormInput
        :model-value="String(filters.values.amountMin || '')"
        :label="$t('حداقل مبلغ')"
        dir="ltr"
        digits-only
        @update:model-value="filters.setFilter('amountMin', $event || null)"
      />
      <TheFormInput
        :model-value="String(filters.values.amountMax || '')"
        :label="$t('حداکثر مبلغ')"
        dir="ltr"
        digits-only
        @update:model-value="filters.setFilter('amountMax', $event || null)"
      />
      <div class="flex flex-col gap-2 justify-end">
        <UCheckbox
          :model-value="filters.values.hasDiscount === true"
          :label="$t('دارای تخفیف')"
          @update:model-value="filters.setFilter('hasDiscount', $event ? true : null)"
        />
        <UCheckbox
          :model-value="filters.values.hasRefund === true"
          :label="$t('دارای بازپرداخت')"
          @update:model-value="filters.setFilter('hasRefund', $event ? true : null)"
        />
        <UCheckbox
          :model-value="filters.values.hasReturn === true"
          :label="$t('دارای مرجوعی')"
          @update:model-value="filters.setFilter('hasReturn', $event ? true : null)"
        />
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
        :items="bulkItems"
        value-key="value"
        class="w-48"
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
      v-if="pending && !orders.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="filtered.length === 0"
      icon="i-tabler-shopping-bag"
      :message="emptyMessage"
    />

    <template v-else>
      <div class="flex items-center gap-2 text-xs text-muted mb-2">
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
      </div>

      <div class="space-y-3">
        <div
          v-for="order in pageItems"
          :key="order.id"
          class="relative"
        >
          <div class="absolute top-3 start-3 z-10">
            <UCheckbox
              :model-value="selectedIds.includes(order.id)"
              @update:model-value="toggleSelect(order.id, !!$event)"
            />
          </div>
          <div class="ps-8">
            <TheSellerOrderRow :order="order" />
          </div>
        </div>
      </div>

      <div
        v-if="showPagination"
        class="mt-6 flex flex-col sm:(flex-row items-center justify-between) gap-3"
      >
        <div class="text-xs text-muted num text-center sm:text-start">
          {{ $t('صفحه') }}
          {{ page.toLocaleString('fa-IR') }}
          {{ $t('از') }}
          {{ totalPages.toLocaleString('fa-IR') }}
        </div>
        <UPagination
          :page="page"
          :total="filtered.length"
          :items-per-page="pageSize"
          :sibling-count="1"
          show-edges
          color="neutral"
          active-color="primary"
          @update:page="page = $event"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  sellerOrderSortOptions,
  sellerOrdersPageSize,
  type SellerOrderSort,
  type SellerOrderStatus,
} from '~/data/seller'
import { sellerOrderFilterDefs } from '~/data/seller-order-commerce'
import { downloadSellerCsv } from '~/data/seller-export'

const { t } = useI18n()
const toast = useAppToast()
const { orders, pending, fetchOrders, setOrderStatus } = useSeller()
const { getCommerce } = useSellerOrderCommerce()
const { can } = useSellerPermissions()

const { search, status, sort, page, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultSort: 'newest',
})
const filters = useSellerFilters(computed(() => sellerOrderFilterDefs))

const showAdvanced = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)
const pageSize = sellerOrdersPageSize

const statusTabs = computed(() => [
  { id: 'all', label: t('همه') },
  { id: 'new', label: t('جدید'), count: countBy('new') },
  { id: 'packing', label: t('آماده‌سازی'), count: countBy('packing') },
  { id: 'shipped', label: t('ارسال شده'), count: countBy('shipped') },
  { id: 'delivered', label: t('تحویل شده'), count: countBy('delivered') },
  { id: 'returned', label: t('مرجوعی'), count: countBy('returned') },
  { id: 'cancelled', label: t('لغو شده'), count: countBy('cancelled') },
])

const sortItems = computed(() =>
  sellerOrderSortOptions.map(option => ({
    label: t(option.label),
    value: option.id,
  })),
)

const paymentFilterItems = computed(() =>
  (sellerOrderFilterDefs.find(d => d.key === 'payment')?.options ?? []).map(o => ({
    value: o.value,
    label: t(o.label),
  })),
)

const shippingFilterItems = computed(() =>
  (sellerOrderFilterDefs.find(d => d.key === 'shipping')?.options ?? []).map(o => ({
    value: o.value,
    label: t(o.label),
  })),
)

const paymentMethodItems = computed(() => [
  { value: 'all', label: t('همه') },
  ...[...new Set(orders.value.map(o => o.paymentMethod).filter(Boolean))].map(m => ({
    value: m,
    label: t(m),
  })),
])

function setSelectFilter(key: string, event: unknown) {
  const value = String(event ?? '')
  void filters.setFilter(key, !value || value === 'all' ? null : value)
}

const bulkItems = computed(() => {
  const items: { value: string, label: string }[] = []
  if (can('orders.update')) {
    items.push(
      { value: 'packing', label: t('شروع آماده‌سازی') },
      { value: 'shipped', label: t('علامت ارسال') },
    )
  }
  if (can('orders.cancel')) {
    items.push({ value: 'cancelled', label: t('لغو سفارش‌ها') })
  }
  return items
})

function countBy(id: SellerOrderStatus) {
  return orders.value.filter(order => order.status === id).length
}

const hasAnyFilters = computed(() =>
  Boolean(search.value)
  || (status.value && status.value !== 'all')
  || filters.activeCount.value > 0
  || (sort.value && sort.value !== 'newest'),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const payment = filters.getString('payment')
  const shipping = filters.getString('shipping')
  const paymentMethod = filters.getString('paymentMethod')
  const amountMin = Number(filters.values.amountMin || 0) || 0
  const amountMax = Number(filters.values.amountMax || 0) || 0
  const hasDiscount = filters.values.hasDiscount === true
  const hasRefund = filters.values.hasRefund === true
  const hasReturn = filters.values.hasReturn === true

  let list = orders.value.filter((order) => {
    if (status.value !== 'all' && order.status !== status.value) return false
    const commerce = getCommerce(order)
    if (payment && commerce.paymentStatus !== payment) return false
    if (shipping && commerce.shippingStatus !== shipping) return false
    if (paymentMethod && order.paymentMethod !== paymentMethod) return false
    if (amountMin && order.total < amountMin) return false
    if (amountMax && order.total > amountMax) return false
    if (hasDiscount && !(commerce.discountAmount > 0)) return false
    if (hasRefund && commerce.refundStatus === 'none') return false
    if (hasReturn && commerce.returnStatus === 'none' && order.status !== 'returned') return false
    if (!q) return true
    const skuHit = order.items.some(i => i.productId.toLowerCase().includes(q))
    return (
      order.id.toLowerCase().includes(q)
      || order.customerName.toLowerCase().includes(q)
      || order.customerPhone.includes(q)
      || order.city.toLowerCase().includes(q)
      || commerce.customerEmail.toLowerCase().includes(q)
      || skuHit
    )
  })

  const sortKey = (sort.value || 'newest') as SellerOrderSort
  list = [...list].sort((a, b) => {
    switch (sortKey) {
      case 'oldest':
        return a.dateKey.localeCompare(b.dateKey)
      case 'amount_desc':
        return b.total - a.total
      case 'amount_asc':
        return a.total - b.total
      case 'newest':
      default:
        return b.dateKey.localeCompare(a.dateKey)
    }
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const showPagination = computed(() => filtered.value.length > pageSize)
const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const allPageSelected = computed(() =>
  pageItems.value.length > 0 && pageItems.value.every(o => selectedIds.value.includes(o.id)),
)
const somePageSelected = computed(() =>
  pageItems.value.some(o => selectedIds.value.includes(o.id)),
)

const emptyMessage = computed(() => {
  if (search.value.trim() || hasAnyFilters.value) return t('سفارشی با این فیلتر پیدا نشد')
  return t('هنوز سفارشی برای فروشگاه ثبت نشده')
})

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = pageItems.value.map(o => o.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

async function clearAll() {
  selectedIds.value = []
  await clearFilters()
  await filters.clear()
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    const target = bulkAction.value as SellerOrderStatus
    for (const id of selectedIds.value) {
      const order = orders.value.find(o => o.id === id)
      if (!order) continue
      if (target === 'cancelled') {
        if (order.status === 'delivered' || order.status === 'cancelled') continue
        await setOrderStatus(id, 'cancelled')
      }
      else if (target === 'packing' && order.status === 'new') {
        await setOrderStatus(id, 'packing')
      }
      else if (target === 'shipped' && order.status === 'packing') {
        await setOrderStatus(id, 'shipped')
      }
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
  downloadSellerCsv(
    `orders-${Date.now()}`,
    ['id', 'customer', 'phone', 'status', 'total', 'paymentMethod', 'shippingMethod', 'date'],
    filtered.value.map(o => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.status,
      o.total,
      o.paymentMethod,
      o.shippingMethod,
      o.date,
    ]),
  )
  toast.success(t('فایل خروجی آماده شد'))
}

watch(filtered, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

const { ok, error } = await fetchOrders({ force: true })
if (!ok) {
  toast.error(
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
      || error?.data?.message
      || error?.message
      || t('بارگذاری سفارش‌ها ناموفق بود'),
  )
}
</script>
