<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('بازپرداخت‌ها')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رکورد')}`"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="canView"
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
              v-if="canCreate"
              type="button"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
              @click="createOpen = true"
            >
              {{ $t('بازپرداخت جدید') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="canCreate"
        type="button"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer font-medium"
        @click="createOpen = true"
      >
        {{ $t('بازپرداخت جدید') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی شماره بازپرداخت یا سفارش')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-receipt-refund"
      :message="$t('بازپرداختی با این فیلتر پیدا نشد')"
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
                :color="sellerRefundStatusMeta[item.status].color"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerRefundStatusMeta[item.status].label) }}
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
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <div class="text-muted">{{ $t('مبلغ سفارش') }}</div>
                <div class="num mt-0.5">{{ formatPrice(item.orderTotal) }}</div>
              </div>
              <div>
                <div class="text-muted">{{ $t('بازپرداخت‌شده') }}</div>
                <div class="num mt-0.5">{{ formatPrice(item.alreadyRefunded) }}</div>
              </div>
              <div>
                <div class="text-muted">{{ $t('این بازپرداخت') }}</div>
                <div class="num mt-0.5 text-primary">{{ formatPrice(item.amount) }}</div>
              </div>
              <div>
                <div class="text-muted">{{ $t('باقی‌مانده') }}</div>
                <div class="num mt-0.5">{{ formatPrice(rowRemaining(item)) }}</div>
              </div>
            </div>
            <div class="text-[11px] text-muted num mt-2" dir="ltr">
              {{ item.createdAt.slice(0, 10) }}
              <span v-if="item.transactionId"> · {{ item.transactionId }}</span>
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
              @click="openStatusConfirm(item, action.status, action.label)"
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
      v-model:open="createOpen"
      :title="$t('بازپرداخت جدید')"
      :description="$t('مبلغ نباید از مانده قابل بازپرداخت بیشتر باشد.')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitCreate"
        >
          <UFormField :label="$t('سفارش')">
            <USelect
              v-model="createForm.orderId"
              :items="orderItems"
              value-key="value"
              class="w-full"
              :placeholder="$t('انتخاب سفارش')"
              @update:model-value="onOrderSelect"
            />
          </UFormField>
          <div
            v-if="selectedOrder"
            class="rounded-xl border border-muted bg-muted/40 p-3 text-xs grid grid-cols-2 gap-2"
          >
            <div>
              <span class="text-muted">{{ $t('مبلغ سفارش') }}:</span>
              <span class="num ms-1">{{ formatPrice(selectedOrder.total) }}</span>
            </div>
            <div>
              <span class="text-muted">{{ $t('قابل بازپرداخت') }}:</span>
              <span class="num ms-1 text-primary">{{ formatPrice(maxRefundable) }}</span>
            </div>
          </div>
          <TheFormInput
            v-model="createForm.amount"
            :label="$t('مبلغ بازپرداخت (تومان)')"
            dir="ltr"
            digits-only
            required
          />
          <TheFormInput
            v-model="createForm.reason"
            :label="$t('دلیل')"
            required
          />
          <TheFormInput
            v-model="createForm.itemsNote"
            :label="$t('اقلام (اختیاری)')"
            :placeholder="$t('مثلاً: هدفون — ۱ عدد')"
          />
        </form>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="createOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="primary"
            class="font-bold cursor-pointer"
            @click="submitCreate"
          >
            {{ $t('ثبت') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="statusConfirmOpen"
      :title="$t(statusConfirmTitle)"
      :description="statusConfirmDescription"
    >
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="statusConfirmOpen = false"
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
import { formatPrice } from '~/data/products'
import {
  sellerRefundStatusMeta,
  type SellerRefund,
  type SellerRefundStatus,
} from '~/data/seller-returns-refunds'

const PAGE_SIZE = 10

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { refunds, ensureLoaded, createRefund, setStatus, refundableRemaining: calcRemaining } = useSellerRefunds()
const { orders, fetchOrders } = useSeller()
const { appendLog } = useSellerAudit()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})
const auditActor = { id: 'admin', name: 'ادمین' }

ensureLoaded()
void fetchOrders()

const pageSize = PAGE_SIZE
const createOpen = ref(false)
const statusConfirmOpen = ref(false)
const pendingRefund = ref<SellerRefund | null>(null)
const pendingStatus = ref<SellerRefundStatus | null>(null)
const statusConfirmTitle = ref('')
const statusConfirmDescription = ref('')

const createForm = ref({
  orderId: '',
  amount: '',
  reason: '',
  itemsNote: '',
})

const canView = computed(() => can('refunds.view') || can('orders.refund'))
const canCreate = computed(() => can('refunds.create') || can('orders.refund'))
const canManage = computed(() => can('refunds.manage') || can('orders.refund'))

const statusTabs = computed(() => {
  const all = refunds.value
  return [
    { id: 'all', label: t('همه'), count: all.length },
    { id: 'pending', label: t('در انتظار'), count: all.filter(r => r.status === 'pending').length },
    { id: 'processing', label: t('در حال پردازش'), count: all.filter(r => r.status === 'processing').length },
    { id: 'completed', label: t('انجام‌شده'), count: all.filter(r => r.status === 'completed').length },
    { id: 'failed', label: t('ناموفق'), count: all.filter(r => r.status === 'failed').length },
  ]
})

const orderItems = computed(() =>
  orders.value.map(o => ({
    label: `${o.id} — ${o.customerName} (${formatPrice(o.total)})`,
    value: o.id,
  })),
)

const selectedOrder = computed(() =>
  orders.value.find(o => o.id === createForm.value.orderId) ?? null,
)

const maxRefundable = computed(() => {
  const order = selectedOrder.value
  if (!order) return 0
  const completedRefunded = refunds.value
    .filter(r => r.orderId === order.id && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = refunds.value
    .filter(r => r.orderId === order.id && (r.status === 'pending' || r.status === 'processing'))
    .reduce((sum, r) => sum + r.amount, 0)
  return calcRemaining(order.total, completedRefunded + pendingAmount)
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return refunds.value.filter((item) => {
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

type RefundAction = {
  status: SellerRefundStatus
  label: string
  color: 'primary' | 'success' | 'error' | 'warning'
}

function availableActions(item: SellerRefund): RefundAction[] {
  switch (item.status) {
    case 'pending':
      return [
        { status: 'processing', label: 'شروع پردازش', color: 'primary' },
        { status: 'completed', label: 'تکمیل', color: 'success' },
        { status: 'cancelled', label: 'لغو', color: 'error' },
      ]
    case 'processing':
      return [
        { status: 'completed', label: 'تکمیل', color: 'success' },
        { status: 'failed', label: 'ناموفق', color: 'error' },
      ]
    default:
      return []
  }
}

function onOrderSelect() {
  if (selectedOrder.value && !createForm.value.amount) {
    createForm.value.amount = String(maxRefundable.value || selectedOrder.value.total)
  }
}

function rowRemaining(item: SellerRefund) {
  const used = item.status === 'completed'
    ? item.alreadyRefunded
    : item.alreadyRefunded + item.amount
  return calcRemaining(item.orderTotal, used)
}

function submitCreate() {
  const order = selectedOrder.value
  if (!order) {
    toast.error(t('سفارش را انتخاب کنید'))
    return
  }
  const amount = Number(createForm.value.amount.replace(/\D/g, ''))
  const completedRefunded = refunds.value
    .filter(r => r.orderId === order.id && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = refunds.value
    .filter(r => r.orderId === order.id && (r.status === 'pending' || r.status === 'processing'))
    .reduce((sum, r) => sum + r.amount, 0)
  const alreadyRefunded = completedRefunded + pendingAmount
  const remaining = calcRemaining(order.total, alreadyRefunded)

  if (amount <= 0 || amount > remaining) {
    toast.error(t('مبلغ بازپرداخت نامعتبر است'))
    return
  }

  const result = createRefund({
    orderId: order.id,
    returnId: null,
    customerName: order.customerName,
    amount,
    orderTotal: order.total,
    alreadyRefunded: completedRefunded,
    reason: createForm.value.reason.trim(),
    transactionId: '',
    items: createForm.value.itemsNote.trim()
      ? [{ productId: '', productTitle: createForm.value.itemsNote.trim(), qty: 1, amount }]
      : [],
  })

  if (!result.ok) {
    toast.error(t(result.error))
    return
  }

  appendLog({
    actorId: auditActor.id,
    actorName: auditActor.name,
    action: 'create',
    entity: 'refund',
    entityId: result.refund?.id || order.id,
    summary: 'ثبت بازپرداخت',
    newValue: String(amount),
  })

  createOpen.value = false
  createForm.value = { orderId: '', amount: '', reason: '', itemsNote: '' }
  toast.success(t('بازپرداخت ثبت شد'))
}

function openStatusConfirm(item: SellerRefund, nextStatus: SellerRefundStatus, label: string) {
  pendingRefund.value = item
  pendingStatus.value = nextStatus
  statusConfirmTitle.value = label
  statusConfirmDescription.value = `وضعیت ${item.id} به «${t(sellerRefundStatusMeta[nextStatus].label)}» تغییر کند؟`
  statusConfirmOpen.value = true
}

function confirmStatusChange() {
  if (!pendingRefund.value || !pendingStatus.value) return
  const prevStatus = pendingRefund.value.status
  const nextStatus = pendingStatus.value
  const refundId = pendingRefund.value.id
  const txId = nextStatus === 'completed'
    ? `TX-${Date.now().toString().slice(-6)}`
    : undefined
  const result = setStatus(refundId, nextStatus, txId)
  statusConfirmOpen.value = false
  pendingRefund.value = null
  pendingStatus.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  appendLog({
    actorId: auditActor.id,
    actorName: auditActor.name,
    action: 'status_change',
    entity: 'refund',
    entityId: refundId,
    summary: `وضعیت بازپرداخت به «${sellerRefundStatusMeta[nextStatus].label}» تغییر کرد`,
    previousValue: prevStatus,
    newValue: nextStatus,
  })
  toast.success(t('وضعیت بازپرداخت به‌روزرسانی شد'))
}

function exportCsv() {
  downloadSellerCsv(
    'refunds-export',
    ['شناسه', 'سفارش', 'مشتری', 'وضعیت', 'مبلغ', 'مجموع سفارش', 'بازپرداخت‌شده', 'تاریخ'],
    filtered.value.map(r => [
      r.id,
      r.orderId,
      r.customerName,
      sellerRefundStatusMeta[r.status].label,
      r.amount,
      r.orderTotal,
      r.alreadyRefunded,
      r.createdAt.slice(0, 10),
    ]),
  )
}
</script>
