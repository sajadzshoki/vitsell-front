<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('سفارش‌های فروشگاه')"
        :count-label="!loading ? `${ordersMeta.total.toLocaleString('fa-IR')} ${$t('سفارش')}` : undefined"
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
            :loading="exporting"
            @click="exportCsv"
          >
            {{ $t('خروجی Excel') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="can('orders.export') || can('orders.view')"
      class="lg:hidden mb-4"
    >
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-download"
        class="cursor-pointer"
        :loading="exporting"
        @click="exportCsv"
      >
        {{ $t('خروجی Excel (CSV)') }}
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
      <TheFormInput
        :model-value="String(filters.values.dateFrom || '')"
        :label="$t('از تاریخ')"
        type="date"
        dir="ltr"
        @update:model-value="filters.setFilter('dateFrom', $event || null)"
      />
      <TheFormInput
        :model-value="String(filters.values.dateTo || '')"
        :label="$t('تا تاریخ')"
        type="date"
        dir="ltr"
        @update:model-value="filters.setFilter('dateTo', $event || null)"
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
      v-if="(loading || pending) && !orders.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!orders.length"
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
          v-for="order in orders"
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
            <TheSellerOrderRow
              :order="order"
              :can-delete="can('orders.delete')"
              @delete="openDelete"
            />
          </div>
        </div>
      </div>

      <TheSellerPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="ordersMeta.total"
      />
    </template>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف سفارش')"
      :description="$t('این سفارش از پنل حذف می‌شود و قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شماره') }}</span>
            <span
              class="font-medium text-highlighted num"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('خریدار') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.customerName }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="deleting"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  sellerOrderSortOptions,
  sellerOrdersPageSize,
  type SellerOrder,
  type SellerOrderStatus,
} from '~/data/seller'
import { sellerOrderFilterDefs } from '~/data/seller-order-commerce'
import { downloadSellerCsv } from '~/data/seller-export'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  orders,
  ordersMeta,
  pending,
  fetchOrders,
  fetchOrdersExport,
  setOrderStatus,
  deleteOrder,
} = useSeller()
const { can } = useSellerPermissions()

const { search, status, sort, page, pageSize, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultSort: 'newest',
  defaultPageSize: sellerOrdersPageSize,
})
const filters = useSellerFilters(computed(() => sellerOrderFilterDefs))

const showAdvanced = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)
const loading = ref(true)
const exporting = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const pendingDelete = ref<SellerOrder | null>(null)

const statusTabs = computed(() => {
  const c = ordersMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: c.all },
    { id: 'new', label: t('جدید'), count: c.new },
    { id: 'packing', label: t('آماده‌سازی'), count: c.packing },
    { id: 'shipped', label: t('ارسال شده'), count: c.shipped },
    { id: 'delivered', label: t('تحویل شده'), count: c.delivered },
    { id: 'returned', label: t('مرجوعی'), count: c.returned },
    { id: 'cancelled', label: t('لغو شده'), count: c.cancelled },
  ]
})

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
  ...ordersMeta.value.paymentMethodOptions.map(m => ({
    value: m,
    label: m,
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

const hasAnyFilters = computed(() =>
  Boolean(search.value)
  || (status.value && status.value !== 'all')
  || filters.activeCount.value > 0
  || (sort.value && sort.value !== 'newest'),
)

const allPageSelected = computed(() =>
  orders.value.length > 0 && orders.value.every(o => selectedIds.value.includes(o.id)),
)
const somePageSelected = computed(() =>
  orders.value.some(o => selectedIds.value.includes(o.id)),
)

const emptyMessage = computed(() => {
  if (hasAnyFilters.value) return t('سفارشی با این فیلتر پیدا نشد')
  return t('هنوز سفارشی برای فروشگاه ثبت نشده')
})

function currentQuery() {
  return {
    q: search.value || undefined,
    status: status.value || undefined,
    sort: sort.value || 'newest',
    payment: filters.getString('payment') || undefined,
    shipping: filters.getString('shipping') || undefined,
    paymentMethod: filters.getString('paymentMethod') || undefined,
    amountMin: filters.values.amountMin ? Number(filters.values.amountMin) : undefined,
    amountMax: filters.values.amountMax ? Number(filters.values.amountMax) : undefined,
    dateFrom: filters.values.dateFrom ? String(filters.values.dateFrom) : undefined,
    dateTo: filters.values.dateTo ? String(filters.values.dateTo) : undefined,
    hasDiscount: filters.values.hasDiscount === true ? true : undefined,
    hasRefund: filters.values.hasRefund === true ? true : undefined,
    hasReturn: filters.values.hasReturn === true ? true : undefined,
    page: page.value,
    pageSize: pageSize.value,
  }
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadOrders() {
  loading.value = true
  try {
    const { ok, error } = await fetchOrders({
      force: true,
      query: currentQuery(),
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری سفارش‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function openDelete(order: SellerOrder) {
  pendingDelete.value = order
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteOrder(pendingDelete.value.id)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    selectedIds.value = selectedIds.value.filter(id => id !== pendingDelete.value!.id)
    deleteOpen.value = false
    pendingDelete.value = null
    toast.success(t('سفارش حذف شد'))
    await loadOrders()
  }
  finally {
    deleting.value = false
  }
}

function toggleSelectPage(on: boolean) {
  const ids = orders.value.map(o => o.id)
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
    await loadOrders()
  }
  finally {
    bulkRunning.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { ok, items, error } = await fetchOrdersExport(currentQuery())
    if (!ok) {
      toast.error(apiErrorMessage(error, t('خروجی سفارش‌ها ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `orders-${Date.now()}`,
      [
        'id',
        'customer',
        'phone',
        'city',
        'status',
        'total',
        'paymentMethod',
        'shippingMethod',
        'date',
        'dateKey',
        'itemsCount',
        'note',
      ],
      items.map(o => [
        o.id,
        o.customerName,
        o.customerPhone,
        o.city,
        o.status,
        o.total,
        o.paymentMethod,
        o.shippingMethod,
        o.date,
        o.dateKey,
        o.items.length,
        o.note || '',
      ]),
    )
    toast.success(t('فایل خروجی Excel آماده شد'))
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => [route.query, filters.values],
  () => {
    void loadOrders()
  },
  { deep: true },
)

onMounted(() => {
  void loadOrders()
})
</script>
