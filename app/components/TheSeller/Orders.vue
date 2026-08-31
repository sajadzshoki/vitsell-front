<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('سفارش‌های فروشگاه') }}
      </h2>
      <div class="text-xs text-muted num">
        {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('سفارش') }}
      </div>
    </div>

    <div class="flex flex-col gap-3 mb-4">
      <div class="flex flex-col sm:(flex-row items-center) gap-3">
        <TheFormInput
          v-model="query"
          icon="i-tabler-search"
          :placeholder="$t('جستجوی سفارش، خریدار یا شماره')"
          class="flex-1 w-full"
        />
        <USelect
          v-model="sort"
          :items="sortItems"
          value-key="value"
          icon="i-tabler-arrows-sort"
          class="w-full sm:w-48 shrink-0"
        />
      </div>

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
        <UButton
          v-for="tab in statusTabs"
          :key="tab.id"
          :color="statusFilter === tab.id ? 'primary' : 'neutral'"
          :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="onStatusChange(tab.id)"
        >
          {{ $t(tab.label) }}
          <span
            v-if="tab.id !== 'all'"
            class="num ms-1"
          >
            {{ countBy(tab.id).toLocaleString('fa-IR') }}
          </span>
        </UButton>
      </div>
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

    <div
      v-else-if="filtered.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-shopping-bag"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted">
        {{ emptyMessage }}
      </p>
    </div>
    <template v-else>
      <div class="space-y-3">
        <TheSellerOrderRow
          v-for="order in pageItems"
          :key="order.id"
          :order="order"
        />
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

const { t } = useI18n()
const toast = useAppToast()
const { orders, pending, fetchOrders } = useSeller()

const query = ref('')
const sort = ref<SellerOrderSort>('newest')
const statusFilter = ref<'all' | SellerOrderStatus>('all')
const page = ref(1)
const pageSize = sellerOrdersPageSize

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'new' as const, label: 'جدید' },
  { id: 'packing' as const, label: 'آماده‌سازی' },
  { id: 'shipped' as const, label: 'ارسال شده' },
  { id: 'delivered' as const, label: 'تحویل شده' },
  { id: 'returned' as const, label: 'مرجوعی' },
  { id: 'cancelled' as const, label: 'لغو شده' },
]

const sortItems = computed(() =>
  sellerOrderSortOptions.map(option => ({
    label: t(option.label),
    value: option.id,
  })),
)

function countBy(status: SellerOrderStatus) {
  return orders.value.filter(order => order.status === status).length
}

function onStatusChange(id: typeof statusFilter.value) {
  statusFilter.value = id
  page.value = 1
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()

  let list = orders.value.filter((order) => {
    if (statusFilter.value !== 'all' && order.status !== statusFilter.value) {
      return false
    }
    if (!q) return true
    return (
      order.id.toLowerCase().includes(q)
      || order.customerName.toLowerCase().includes(q)
      || order.customerPhone.includes(q)
      || order.city.toLowerCase().includes(q)
    )
  })

  list = [...list].sort((a, b) => {
    switch (sort.value) {
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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
)

const showPagination = computed(() => filtered.value.length > pageSize)

const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const emptyMessage = computed(() => {
  if (query.value.trim()) return t('سفارشی با این جستجو پیدا نشد')
  if (statusFilter.value !== 'all') return t('سفارشی در این وضعیت نیست')
  return t('هنوز سفارشی برای فروشگاه ثبت نشده')
})

watch([query, sort], () => {
  page.value = 1
})

watch(filtered, () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value
  }
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
