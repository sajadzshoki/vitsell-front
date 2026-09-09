<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مشتریان فروشگاه')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('نفر')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="canExport"
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-download"
            class="cursor-pointer"
            :loading="exporting"
            @click="exportCsv"
          >
            {{ $t('خروجی') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div
      v-if="canExport"
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
        {{ $t('خروجی CSV') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام، ایمیل یا تلفن')"
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
      class="mb-4 rounded-2xl border border-muted bg-muted/40 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <div class="flex items-end">
        <UCheckbox
          :model-value="hasOrdersFilter"
          :label="$t('دارای سفارش')"
          @update:model-value="setHasOrders(!!$event)"
        />
      </div>
      <TheFormInput
        :model-value="spendMin"
        :label="$t('حداقل خرید (تومان)')"
        dir="ltr"
        digits-only
        @update:model-value="setSpendMin($event)"
      />
      <TheFormInput
        :model-value="spendMax"
        :label="$t('حداکثر خرید (تومان)')"
        dir="ltr"
        digits-only
        @update:model-value="setSpendMax($event)"
      />
    </div>

    <div
      v-if="selectedIds.length && canBulk"
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
        :disabled="!bulkAction"
        :loading="bulkSaving"
        @click="openBulkConfirm"
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
      v-if="(loading || pending) && !customers.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!customers.length"
      icon="i-tabler-users"
      :message="hasAnyFilters ? $t('مشتری‌ای با این فیلتر پیدا نشد') : $t('هنوز مشتری‌ای ثبت نشده')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-if="canBulk"
        class="flex items-center gap-2 text-xs text-muted"
      >
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
      </div>

      <div
        v-for="customer in customers"
        :key="customer.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(customer.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(customer.id, !!$event)"
          />
          <div class="flex-1 min-w-0 flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="font-medium text-highlighted">
                {{ customerFullName(customer) }}
              </div>
              <div class="text-[11px] text-muted mt-1 num" dir="ltr">
                {{ customer.email || '—' }}
                <span v-if="customer.phone"> · {{ customer.phone }}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <UBadge
                  :color="sellerCustomerStatusMeta[customer.status].color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerCustomerStatusMeta[customer.status].label) }}
                </UBadge>
                <span class="text-[11px] text-muted num">
                  {{ customer.orderCount.toLocaleString('fa-IR') }} {{ $t('سفارش') }}
                  · {{ formatPrice(customer.totalSpent) }} {{ $t('تومان') }}
                </span>
              </div>
            </div>
            <UButton
              :to="`/seller/customers/${customer.id}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-eye"
              class="cursor-pointer shrink-0"
            >
              {{ $t('جزئیات') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="listMeta.total"
    />

    <UModal
      v-model:open="confirmOpen"
      :title="$t(confirmTitle)"
      :description="$t(confirmDescription)"
    >
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="confirmOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            :color="bulkAction === 'block' ? 'error' : 'primary'"
            class="font-bold cursor-pointer"
            :loading="bulkSaving"
            @click="runBulk"
          >
            {{ $t('تأیید') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import {
  customerFullName,
  sellerCustomerStatusMeta,
  type SellerCustomer,
  type SellerCustomerStatus,
} from '~/data/seller-customers'
import { formatPrice } from '~/data/products'


const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const { customers, listMeta, pending, fetchList, bulkSetStatus } = useSellerCustomers()
const { search, status, sort, page, pageSize, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
  defaultSort: 'newest',
  defaultPageSize: 10,
})

const loading = ref(true)
const exporting = ref(false)
const bulkSaving = ref(false)
const showAdvanced = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const confirmOpen = ref(false)

const hasOrdersFilter = computed(() => route.query.hasOrders === '1')
const spendMin = computed(() => String(route.query.spendMin ?? ''))
const spendMax = computed(() => String(route.query.spendMax ?? ''))

const canExport = computed(() => can('customers.export') || can('customers.view'))
const canBulk = computed(() => can('customers.update') || can('customers.block'))

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'active', label: t('فعال'), count: Number(c.active) || 0 },
    { id: 'inactive', label: t('غیرفعال'), count: Number(c.inactive) || 0 },
    { id: 'blocked', label: t('مسدود'), count: Number(c.blocked) || 0 },
  ]
})

const sortItems = computed(() => [
  { label: t('جدیدترین'), value: 'newest' },
  { label: t('قدیمی‌ترین'), value: 'oldest' },
  { label: t('بیشترین خرید'), value: 'spending_desc' },
  { label: t('کمترین خرید'), value: 'spending_asc' },
  { label: t('نام'), value: 'name' },
])

const bulkActionItems = computed(() => {
  const items: { label: string, value: string }[] = []
  if (can('customers.update')) {
    items.push({ label: t('فعال‌سازی'), value: 'activate' })
    items.push({ label: t('غیرفعال‌سازی'), value: 'deactivate' })
  }
  if (can('customers.block')) {
    items.push({ label: t('مسدودسازی'), value: 'block' })
  }
  return items
})

const hasAnyFilters = computed(() =>
  Boolean(
    search.value
    || (status.value && status.value !== 'all')
    || (sort.value && sort.value !== 'newest')
    || hasOrdersFilter.value
    || spendMin.value
    || spendMax.value,
  ),
)


const allPageSelected = computed(() =>
  customers.value.length > 0 && customers.value.every(c => selectedIds.value.includes(c.id)),
)

const somePageSelected = computed(() =>
  customers.value.some(c => selectedIds.value.includes(c.id)),
)

const confirmTitle = computed(() => {
  if (bulkAction.value === 'activate') return 'فعال‌سازی گروهی'
  if (bulkAction.value === 'deactivate') return 'غیرفعال‌سازی گروهی'
  if (bulkAction.value === 'block') return 'مسدودسازی گروهی'
  return 'تأیید عملیات'
})

const confirmDescription = computed(() => {
  const count = selectedIds.value.length.toLocaleString('fa-IR')
  if (bulkAction.value === 'activate') return `آیا ${count} مشتری فعال شوند؟`
  if (bulkAction.value === 'deactivate') return `آیا ${count} مشتری غیرفعال شوند؟`
  if (bulkAction.value === 'block') return `آیا ${count} مشتری مسدود شوند؟`
  return 'این عملیات روی مشتریان انتخاب‌شده اعمال می‌شود.'
})

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function onStatusChange(value: string) {
  status.value = value
}

async function clearAllFilters() {
  await clearFilters()
  await patchQuery({ hasOrders: undefined, spendMin: undefined, spendMax: undefined })
  showAdvanced.value = false
}

async function setHasOrders(value: boolean) {
  await patchQuery({ hasOrders: value ? '1' : undefined, page: undefined })
}

async function setSpendMin(value: string | number) {
  const raw = String(value ?? '').replace(/\D/g, '')
  await patchQuery({ spendMin: raw || undefined, page: undefined })
}

async function setSpendMax(value: string | number) {
  const raw = String(value ?? '').replace(/\D/g, '')
  await patchQuery({ spendMax: raw || undefined, page: undefined })
}

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(checked: boolean) {
  const pageIds = customers.value.map(c => c.id)
  if (checked) {
    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  }
  else {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  }
}

function openBulkConfirm() {
  if (!bulkAction.value || !selectedIds.value.length) return
  confirmOpen.value = true
}

async function loadCustomers() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      hasOrders: hasOrdersFilter.value || undefined,
      spendMin: spendMin.value || undefined,
      spendMax: spendMax.value || undefined,
      sort: sort.value || 'newest',
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری مشتریان ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function runBulk() {
  const action = bulkAction.value
  const targetStatus: SellerCustomerStatus | null =
    action === 'activate' ? 'active'
      : action === 'deactivate' ? 'inactive'
        : action === 'block' ? 'blocked'
          : null

  if (!targetStatus) return

  bulkSaving.value = true
  try {
    const result = await bulkSetStatus(selectedIds.value, targetStatus)
    confirmOpen.value = false
    selectedIds.value = []
    bulkAction.value = ''
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('مشتریان به‌روزرسانی شدند'))
    await loadCustomers()
  }
  finally {
    bulkSaving.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      hasOrders: hasOrdersFilter.value || undefined,
      spendMin: spendMin.value || undefined,
      spendMax: spendMax.value || undefined,
      sort: sort.value || 'newest',
      all: true,
      pageSize: 200,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('خروجی مشتریان ناموفق بود')))
      return
    }
    const rows = customers.value.map((c: SellerCustomer) => [
      c.id,
      customerFullName(c),
      c.email,
      c.phone,
      sellerCustomerStatusMeta[c.status].label,
      c.orderCount,
      c.totalSpent,
      c.registeredAt.slice(0, 10),
    ])
    downloadSellerCsv(
      `customers-${Date.now()}`,
      ['شناسه', 'نام', 'ایمیل', 'تلفن', 'وضعیت', 'تعداد سفارش', 'مجموع خرید', 'تاریخ ثبت'],
      rows,
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadCustomers()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadCustomers()
  },
  { deep: true },
)

onMounted(() => {
  void loadCustomers()
})
</script>
