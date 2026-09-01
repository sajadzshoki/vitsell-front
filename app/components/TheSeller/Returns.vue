<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مرجوعی‌ها')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('درخواست')}`"
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
            @click="exportCsv"
          >
            {{ $t('خروجی') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
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

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-arrow-back-up"
      :message="$t('مرجوعی‌ای با این فیلتر پیدا نشد')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="item in paged"
        :key="item.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-highlighted num" dir="ltr">{{ item.id }}</span>
              <UBadge
                :color="sellerReturnStatusMeta[item.status].color"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerReturnStatusMeta[item.status].label) }}
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
        :total="filtered.length"
        :items-per-page="pageSize"
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

const PAGE_SIZE = 10

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { returns, ensureLoaded, setStatus } = useSellerReturns()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

ensureLoaded()

const pageSize = PAGE_SIZE
const confirmOpen = ref(false)
const pendingItem = ref<SellerReturn | null>(null)
const pendingStatus = ref<SellerReturnStatus | null>(null)
const pendingLabel = ref('')

const canManage = computed(() => can('returns.manage'))

const statusTabs = computed(() => {
  const all = returns.value
  return [
    { id: 'all', label: t('همه'), count: all.length },
    { id: 'requested', label: t('درخواست‌شده'), count: all.filter(r => r.status === 'requested').length },
    { id: 'approved', label: t('تأیید شده'), count: all.filter(r => r.status === 'approved').length },
    { id: 'received', label: t('دریافت‌شده'), count: all.filter(r => r.status === 'received').length },
    { id: 'completed', label: t('تکمیل‌شده'), count: all.filter(r => r.status === 'completed').length },
    { id: 'rejected', label: t('رد شده'), count: all.filter(r => r.status === 'rejected').length },
  ]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return returns.value.filter((item) => {
    if (status.value !== 'all' && item.status !== status.value) return false
    if (!q) return true
    return (
      item.id.toLowerCase().includes(q)
      || item.orderId.toLowerCase().includes(q)
      || item.customerName.toLowerCase().includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

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

function confirmStatusChange() {
  if (!pendingItem.value || !pendingStatus.value) return
  const result = setStatus(pendingItem.value.id, pendingStatus.value)
  confirmOpen.value = false
  pendingItem.value = null
  pendingStatus.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('وضعیت مرجوعی به‌روزرسانی شد'))
}

function exportCsv() {
  downloadSellerCsv(
    'returns-export',
    ['شناسه', 'سفارش', 'مشتری', 'وضعیت', 'دلیل', 'تاریخ'],
    filtered.value.map(r => [
      r.id,
      r.orderId,
      r.customerName,
      sellerReturnStatusMeta[r.status].label,
      r.reason,
      r.requestedAt.slice(0, 10),
    ]),
  )
}
</script>
