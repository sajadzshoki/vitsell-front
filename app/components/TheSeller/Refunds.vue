<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('بازپرداخت‌ها')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('رکورد')}` : undefined"
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
              :loading="exporting"
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
              @click="openCreate"
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
        @click="openCreate"
      >
        {{ $t('بازپرداخت جدید') }}
      </UButton>
      <UButton
        v-if="canView"
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
      :search-placeholder="$t('جستجوی شماره بازپرداخت یا سفارش')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="(loading || pending) && !refunds.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!refunds.length"
      icon="i-tabler-receipt-refund"
      :message="hasActiveFilters ? $t('بازپرداختی با این فیلتر پیدا نشد') : $t('هنوز بازپرداختی ثبت نشده')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="item in refunds"
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
            <div
              v-if="item.reason"
              class="text-xs text-toned mt-2"
            >
              {{ item.reason }}
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

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="listMeta.total"
    />

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
              :loading="ordersLoading"
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
              <span
                v-if="refundMetaLoading"
                class="ms-1 text-muted"
              >…</span>
              <span
                v-else
                class="num ms-1 text-primary"
              >{{ formatPrice(maxRefundable) }}</span>
            </div>
          </div>
          <TheFormInput
            v-model="createForm.amount"
            :label="$t('مبلغ بازپرداخت (تومان)')"
            dir="ltr"
            thousand-sep
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
            :loading="creating"
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
import { formatPrice } from '~/data/products'
import {
  sellerRefundStatusMeta,
  type SellerRefund,
  type SellerRefundStatus,
} from '~/data/seller-returns-refunds'


const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const {
  refunds,
  listMeta,
  pending,
  fetchList,
  createRefund,
  setStatus,
  getOrderRefundable,
  refundableRemaining: calcRemaining,
} = useSellerRefunds()
const { orders, fetchOrders } = useSeller()
const { appendLog } = useSellerAudit()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})
const auditActor = { id: 'admin', name: 'ادمین' }

const loading = ref(true)
const exporting = ref(false)
const creating = ref(false)
const saving = ref(false)
const ordersLoading = ref(false)
const refundMetaLoading = ref(false)
const createOpen = ref(false)
const statusConfirmOpen = ref(false)
const pendingRefund = ref<SellerRefund | null>(null)
const pendingStatus = ref<SellerRefundStatus | null>(null)
const statusConfirmTitle = ref('')
const statusConfirmDescription = ref('')
const maxRefundable = ref(0)

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
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'pending', label: t('در انتظار'), count: Number(c.pending) || 0 },
    { id: 'processing', label: t('در حال پردازش'), count: Number(c.processing) || 0 },
    { id: 'completed', label: t('انجام‌شده'), count: Number(c.completed) || 0 },
    { id: 'failed', label: t('ناموفق'), count: Number(c.failed) || 0 },
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

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function rowRemaining(item: SellerRefund) {
  const used = item.status === 'completed'
    ? item.alreadyRefunded
    : item.alreadyRefunded + item.amount
  return calcRemaining(item.orderTotal, used)
}

async function loadRefunds() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری بازپرداخت‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function openCreate() {
  createOpen.value = true
  if (!orders.value.length) {
    ordersLoading.value = true
    try {
      await fetchOrders({ force: true, query: { all: true, pageSize: 200 } })
    }
    finally {
      ordersLoading.value = false
    }
  }
}

async function onOrderSelect() {
  const order = selectedOrder.value
  maxRefundable.value = 0
  if (!order) return
  refundMetaLoading.value = true
  try {
    const meta = await getOrderRefundable(order.id, order.total)
    maxRefundable.value = meta.remaining
    if (!createForm.value.amount) {
      createForm.value.amount = String(meta.remaining || order.total)
    }
  }
  finally {
    refundMetaLoading.value = false
  }
}

async function submitCreate() {
  const order = selectedOrder.value
  if (!order) {
    toast.error(t('سفارش را انتخاب کنید'))
    return
  }
  const amount = Number(createForm.value.amount.replace(/\D/g, ''))
  const reason = createForm.value.reason.trim()
  if (!reason) {
    toast.error(t('دلیل را وارد کنید'))
    return
  }
  if (amount <= 0 || amount > maxRefundable.value) {
    toast.error(t('مبلغ بازپرداخت نامعتبر است'))
    return
  }

  creating.value = true
  try {
    const result = await createRefund({
      orderId: order.id,
      returnId: null,
      amount,
      reason,
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
    maxRefundable.value = 0
    toast.success(t('بازپرداخت ثبت شد'))
    await loadRefunds()
  }
  finally {
    creating.value = false
  }
}

function openStatusConfirm(item: SellerRefund, nextStatus: SellerRefundStatus, label: string) {
  pendingRefund.value = item
  pendingStatus.value = nextStatus
  statusConfirmTitle.value = label
  statusConfirmDescription.value = `وضعیت ${item.id} به «${t(sellerRefundStatusMeta[nextStatus].label)}» تغییر کند؟`
  statusConfirmOpen.value = true
}

async function confirmStatusChange() {
  if (!pendingRefund.value || !pendingStatus.value) return
  const prevStatus = pendingRefund.value.status
  const nextStatus = pendingStatus.value
  const refundId = pendingRefund.value.id
  saving.value = true
  try {
    const result = await setStatus(refundId, nextStatus)
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
    await loadRefunds()
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
      toast.error(apiErrorMessage(error, t('خروجی بازپرداخت‌ها ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `refunds-${Date.now()}`,
      ['شناسه', 'سفارش', 'مشتری', 'وضعیت', 'مبلغ', 'مجموع سفارش', 'بازپرداخت‌شده', 'دلیل', 'تراکنش', 'تاریخ'],
      refunds.value.map(r => [
        r.id,
        r.orderId,
        r.customerName,
        sellerRefundStatusMeta[r.status].label,
        r.amount,
        r.orderTotal,
        r.alreadyRefunded,
        r.reason,
        r.transactionId,
        r.createdAt.slice(0, 10),
      ]),
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadRefunds()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadRefunds()
  },
  { deep: true },
)

onMounted(() => {
  void loadRefunds()
})
</script>
