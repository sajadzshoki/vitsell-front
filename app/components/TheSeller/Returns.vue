<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مرجوعی‌ها')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('درخواست')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="can('returns.view')"
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
      v-if="can('returns.view')"
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
      :search-placeholder="$t('جستجوی شماره مرجوعی، سفارش یا مشتری')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="(loading || pending) && !returns.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!returns.length"
      icon="i-tabler-arrow-back-up"
      :message="hasActiveFilters ? $t('مرجوعی‌ای با این فیلتر پیدا نشد') : $t('هنوز مرجوعی ثبت نشده')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="item in returns"
        :key="item.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-highlighted num" dir="ltr">{{ item.id }}</span>
              <UBadge
                :color="sellerReturnStatusMeta[item.status]?.color || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerReturnStatusMeta[item.status]?.label || item.status) }}
              </UBadge>
            </div>
            <div class="text-[11px] text-muted mt-1">
              {{ item.customerName }}
              · {{ $t('سفارش') }}
              <NuxtLink
                :to="`/seller/orders/${item.orderId}`"
                class="num text-primary hover:underline cursor-pointer"
                dir="ltr"
              >
                {{ item.orderId }}
              </NuxtLink>
            </div>
            <div class="text-xs text-toned mt-2">
              {{ item.reason }}
            </div>
            <div
              v-if="item.adminNote"
              class="text-[11px] text-muted mt-1"
            >
              {{ $t('یادداشت ادمین') }}: {{ item.adminNote }}
            </div>
            <div class="text-[11px] text-muted num mt-1" dir="ltr">
              {{ item.requestedAt.slice(0, 10) }}
              · {{ item.items.length.toLocaleString('fa-IR') }} {{ $t('قلم') }}
            </div>
          </div>
          <div
            v-if="canManage && availableActions(item).length"
            class="flex items-center gap-2 flex-wrap"
          >
            <UButton
              v-for="action in availableActions(item)"
              :key="action.status"
              type="button"
              :color="action.color"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="openConfirm(item, action.status, action.label)"
            >
              {{ $t(action.label) }}
            </UButton>
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
        :total="listMeta.total"
        :items-per-page="listMeta.pageSize || pageSize"
      />
    </div>

    <UModal
      v-model:open="confirmOpen"
      :title="$t(confirmTitle)"
      :description="confirmDescription"
    >
      <template #body>
        <div
          v-if="pendingItem"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شماره مرجوعی') }}</span>
            <span class="num font-medium text-highlighted" dir="ltr">{{ pendingItem.id }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('مشتری') }}</span>
            <span class="font-medium">{{ pendingItem.customerName }}</span>
          </div>
        </div>
      </template>
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
            color="primary"
            class="font-bold cursor-pointer"
            :loading="saving"
            @click="confirmStatusChange"
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
  sellerReturnStatusMeta,
  type SellerReturn,
  type SellerReturnStatus,
} from '~/data/seller-returns-refunds'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const { returns, listMeta, pending, fetchList, setStatus } = useSellerReturns()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const exporting = ref(false)
const saving = ref(false)
const confirmOpen = ref(false)
const pendingItem = ref<SellerReturn | null>(null)
const pendingStatus = ref<SellerReturnStatus | null>(null)
const pendingLabel = ref('')

const canManage = computed(() => can('returns.manage'))

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'requested', label: t('درخواست‌شده'), count: Number(c.requested) || 0 },
    { id: 'approved', label: t('تأیید شده'), count: Number(c.approved) || 0 },
    { id: 'received', label: t('دریافت‌شده'), count: Number(c.received) || 0 },
    { id: 'completed', label: t('تکمیل‌شده'), count: Number(c.completed) || 0 },
    { id: 'rejected', label: t('رد شده'), count: Number(c.rejected) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

const confirmTitle = computed(() => pendingLabel.value || 'تغییر وضعیت مرجوعی')

const confirmDescription = computed(() =>
  pendingItem.value
    ? `وضعیت ${pendingItem.value.id} به «${t(sellerReturnStatusMeta[pendingStatus.value ?? 'requested'].label)}» تغییر کند؟`
    : '',
)

type ReturnAction = {
  status: SellerReturnStatus
  label: string
  color: 'primary' | 'success' | 'error' | 'warning'
}

function availableActions(item: SellerReturn): ReturnAction[] {
  switch (item.status) {
    case 'requested':
      return [
        { status: 'approved', label: 'تأیید', color: 'success' },
        { status: 'rejected', label: 'رد', color: 'error' },
      ]
    case 'approved':
      return [{ status: 'received', label: 'دریافت کالا', color: 'primary' }]
    case 'received':
    case 'processing':
      return [{ status: 'completed', label: 'تکمیل', color: 'success' }]
    default:
      return []
  }
}

function openConfirm(item: SellerReturn, nextStatus: SellerReturnStatus, label: string) {
  pendingItem.value = item
  pendingStatus.value = nextStatus
  pendingLabel.value = label
  confirmOpen.value = true
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadReturns() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری مرجوعی‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function confirmStatusChange() {
  if (!pendingItem.value || !pendingStatus.value) return
  saving.value = true
  try {
    const result = await setStatus(pendingItem.value.id, pendingStatus.value)
    confirmOpen.value = false
    pendingItem.value = null
    pendingStatus.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('وضعیت مرجوعی به‌روزرسانی شد'))
    await loadReturns()
  }
  finally {
    saving.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      all: true,
      pageSize: 200,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('خروجی مرجوعی‌ها ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `returns-${Date.now()}`,
      ['شناسه', 'سفارش', 'مشتری', 'وضعیت', 'دلیل', 'یادداشت', 'تاریخ', 'اقلام'],
      returns.value.map(r => [
        r.id,
        r.orderId,
        r.customerName,
        sellerReturnStatusMeta[r.status]?.label || r.status,
        r.reason,
        r.adminNote,
        r.requestedAt.slice(0, 10),
        r.items.length,
      ]),
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadReturns()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadReturns()
  },
  { deep: true },
)

onMounted(() => {
  void loadReturns()
})
</script>
