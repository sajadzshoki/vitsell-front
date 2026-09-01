<template>
  <div
    v-if="loading"
    class="space-y-5"
  >
    <USkeleton class="h-48 rounded-2xl" />
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <USkeleton class="h-72 rounded-2xl lg:col-span-2" />
      <USkeleton class="h-72 rounded-2xl" />
    </div>
  </div>

  <div
    v-else-if="order"
    class="space-y-5"
  >
    <!-- Header / status workflow -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 class="text-xl font-bold text-highlighted flex items-center gap-2 flex-wrap">
            {{ $t('سفارش') }}
            <span
              class="num text-primary"
              dir="ltr"
            >{{ order.id }}</span>
          </h1>
          <div class="text-xs text-muted mt-1 num">
            {{ $t('ثبت‌شده در تاریخ') }} {{ order.date }}
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            <UBadge
              :color="statusMeta.color"
              variant="subtle"
              size="sm"
              class="font-medium"
            >
              {{ $t('سفارش') }}: {{ $t(statusMeta.label) }}
            </UBadge>
            <UBadge
              :color="paymentMeta.color"
              variant="subtle"
              size="sm"
            >
              {{ $t('پرداخت') }}: {{ $t(paymentMeta.label) }}
            </UBadge>
            <UBadge
              :color="shippingMeta.color"
              variant="subtle"
              size="sm"
            >
              {{ $t('ارسال') }}: {{ $t(shippingMeta.label) }}
            </UBadge>
            <UBadge
              v-if="commerce.returnStatus !== 'none'"
              color="warning"
              variant="subtle"
              size="sm"
            >
              {{ $t('مرجوعی') }}
            </UBadge>
            <UBadge
              v-if="commerce.refundStatus !== 'none'"
              color="info"
              variant="subtle"
              size="sm"
            >
              {{ $t('بازپرداخت') }}
            </UBadge>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <UButton
            v-if="can('orders.cancel') && canCancel"
            color="error"
            variant="soft"
            size="sm"
            icon="i-tabler-x"
            class="cursor-pointer"
            @click="openCancel"
          >
            {{ $t('لغو سفارش') }}
          </UButton>
          <UButton
            v-if="can('orders.refund') || can('refunds.create')"
            to="/seller/refunds"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-receipt-refund"
            class="cursor-pointer"
          >
            {{ $t('بازپرداخت') }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-tabler-printer"
            class="cursor-pointer"
            @click="printInvoice"
          >
            {{ $t('فاکتور') }}
          </UButton>
        </div>
      </div>

      <div
        v-if="showTracking"
        class="bg-muted rounded-2xl p-4 sm:p-5"
      >
        <div class="flex items-start justify-between gap-1 overflow-hidden">
          <div
            v-for="(step, index) in sellerOrderTrackingSteps"
            :key="step"
            class="flex flex-col items-center flex-1 relative min-w-0"
          >
            <div
              class="size-9 sm:size-10 rounded-full grid place-items-center text-xs sm:text-sm font-bold z-10 transition"
              :class="index <= statusMeta.step
                ? 'bg-success text-inverted shadow-lg shadow-success/25'
                : 'bg-default border-2 border-muted text-dimmed'"
            >
              <UIcon
                v-if="index < statusMeta.step"
                name="i-tabler-check"
                class="size-4"
              />
              <span
                v-else
                class="num"
              >{{ (index + 1).toLocaleString('fa-IR') }}</span>
            </div>
            <div
              class="text-[9px] sm:text-[11px] text-center mt-2 leading-tight px-0.5"
              :class="index <= statusMeta.step ? 'text-default font-medium' : 'text-dimmed'"
            >
              {{ $t(step) }}
            </div>
            <div
              v-if="index < sellerOrderTrackingSteps.length - 1"
              class="absolute top-4.5 sm:top-5 start-1/2 w-full h-0.5 z-0 pointer-events-none"
              :class="index < statusMeta.step ? 'bg-success' : 'bg-accented'"
            />
          </div>
        </div>
      </div>

      <div
        v-if="canUpdateOrder && showTracking && (nextAction || undoAction)"
        class="mt-5 flex items-center justify-between gap-2 flex-wrap"
      >
        <UButton
          v-if="undoAction"
          color="neutral"
          variant="outline"
          size="lg"
          icon="i-tabler-arrow-back-up"
          class="font-medium cursor-pointer"
          @click="openStatusConfirm('undo')"
        >
          {{ $t(undoAction) }}
        </UButton>
        <div
          v-else
          class="flex-1"
        />
        <UButton
          v-if="nextAction"
          color="primary"
          size="lg"
          class="font-medium ms-auto cursor-pointer"
          @click="openStatusConfirm('advance')"
        >
          {{ $t(nextAction) }}
        </UButton>
      </div>
    </div>

    <UModal
      v-model:open="confirmOpen"
      :title="$t(confirmTitle)"
      :description="$t(confirmDescription)"
    >
      <template #body>
        <div class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2">
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شماره سفارش') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ order.id }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('وضعیت فعلی') }}</span>
            <span class="text-default font-medium">{{ $t(statusMeta.label) }}</span>
          </div>
          <div
            v-if="pendingTargetLabel"
            class="flex items-center justify-between gap-3"
          >
            <span class="text-muted">
              {{ pendingMode === 'undo' ? $t('وضعیت قبلی') : $t('وضعیت بعدی') }}
            </span>
            <span
              class="font-medium"
              :class="pendingMode === 'undo' ? 'text-warning' : 'text-primary'"
            >{{ $t(pendingTargetLabel) }}</span>
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
            :color="pendingMode === 'undo' ? 'warning' : 'primary'"
            class="font-bold cursor-pointer"
            @click="confirmStatusChange"
          >
            {{ $t(confirmButtonLabel) }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="cancelOpen"
      :title="$t('لغو سفارش')"
      :description="$t('این عمل قابل بازگشت آسان نیست. ادامه می‌دهید؟')"
    >
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="cancelOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="cancelling"
            @click="confirmCancel"
          >
            {{ $t('لغو سفارش') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-3">
        <!-- Items -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">
            {{ $t('کالاهای سفارش') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="item in lineItems"
              :key="item.productId"
              class="flex gap-3 pb-4 border-b border-muted last:(border-b-0 pb-0)"
            >
              <NuxtLink
                :to="`/product/${item.product.id}`"
                class="size-20 rounded-xl bg-muted overflow-hidden shrink-0 cursor-pointer"
              >
                <img
                  v-if="item.product.image"
                  :src="item.product.image"
                  :alt="item.product.title"
                  class="size-full object-cover"
                >
                <div
                  v-else
                  class="size-full grid place-items-center"
                >
                  <TheIcon
                    icon-type="img"
                    name="noImage.png"
                    class="size-8 opacity-60"
                  />
                </div>
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] text-dimmed mb-1 uppercase">
                  {{ item.product.brand }}
                </div>
                <NuxtLink
                  :to="`/product/${item.product.id}`"
                  class="text-sm font-medium text-default hover:text-primary line-clamp-2 text-start block cursor-pointer"
                >
                  {{ item.product.title }}
                </NuxtLink>
                <div class="text-[11px] text-muted mt-1 num" dir="ltr">
                  SKU: {{ item.productId }}
                </div>
                <div class="text-[11px] text-muted mt-1 num">
                  {{ $t('تعداد') }}: {{ item.qty.toLocaleString('fa-IR') }}
                  ·
                  {{ $t('فی') }}: {{ formatPrice(item.price) }}
                </div>
              </div>
              <div class="text-end shrink-0">
                <div class="text-sm font-bold text-highlighted num">
                  {{ formatPrice(item.price * item.qty) }}
                </div>
                <div class="text-[10px] text-muted">
                  {{ $t('تومان') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">
            {{ $t('خط زمانی سفارش') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="ev in commerce.timeline"
              :key="ev.id"
              class="flex gap-3"
            >
              <div class="size-2 rounded-full bg-primary mt-2 shrink-0" />
              <div class="min-w-0">
                <div class="text-sm font-medium text-highlighted">
                  {{ $t(ev.event) }}
                </div>
                <div class="text-[11px] text-muted mt-0.5">
                  <span class="num">{{ formatEventDate(ev.at) }}</span>
                  · {{ ev.actor }}
                  <span v-if="ev.detail"> · {{ ev.detail }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Internal notes -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-1">
            {{ $t('یادداشت داخلی') }}
          </h3>
          <p class="text-[11px] text-warning mb-3">
            {{ $t('فقط برای ادمین — برای مشتری نمایش داده نمی‌شود') }}
          </p>
          <div
            v-if="commerce.internalNotes.length"
            class="space-y-2 mb-4"
          >
            <div
              v-for="note in commerce.internalNotes"
              :key="note.id"
              class="rounded-xl border border-muted bg-muted/40 p-3 text-xs"
            >
              <div class="text-toned leading-6">
                {{ note.text }}
              </div>
              <div class="text-[10px] text-muted mt-1">
                {{ note.author }} · <span class="num">{{ formatEventDate(note.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="canUpdateOrder"
            class="flex flex-col sm:(flex-row items-end) gap-2"
          >
            <TheFormInput
              v-model="noteDraft"
              :placeholder="$t('یادداشت داخلی بنویسید')"
              class="flex-1 w-full"
            />
            <UButton
              color="primary"
              size="md"
              class="cursor-pointer shrink-0"
              :disabled="!noteDraft.trim()"
              @click="addNote"
            >
              {{ $t('افزودن') }}
            </UButton>
          </div>
        </div>
      </div>

      <aside class="space-y-3">
        <!-- Customer -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('اطلاعات خریدار') }}
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('نام') }}</span>
              <span class="text-default font-medium">{{ order.customerName }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('شماره تماس') }}</span>
              <a
                :href="`tel:${order.customerPhone}`"
                class="num text-primary font-medium cursor-pointer"
                dir="ltr"
              >{{ order.customerPhone }}</a>
            </div>
            <div
              v-if="commerce.customerEmail"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('ایمیل') }}</span>
              <span
                class="num text-default"
                dir="ltr"
              >{{ commerce.customerEmail }}</span>
            </div>
            <UButton
              v-if="matchedCustomer && can('customers.view')"
              :to="`/seller/customers/${matchedCustomer.id}`"
              color="primary"
              variant="soft"
              size="xs"
              block
              class="cursor-pointer mt-2"
            >
              {{ $t('پروفایل مشتری') }}
            </UButton>
          </div>
        </div>

        <!-- Address -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('آدرس تحویل') }}
          </h3>
          <div class="text-xs text-toned leading-6">
            <div class="font-medium text-default mb-1">
              {{ order.customerName }} —
              <span
                class="num"
                dir="ltr"
              >{{ order.customerPhone }}</span>
            </div>
            <div>
              {{ $t(order.address.province) }}، {{ $t(order.address.city) }}، {{ order.address.address }}
            </div>
            <div class="text-muted mt-1 num">
              {{ $t('کدپستی') }}: {{ order.address.postalCode }}
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('پرداخت') }}
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش') }}</span>
              <span class="text-default">{{ $t(order.paymentMethod) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('وضعیت') }}</span>
              <span class="text-default">{{ $t(paymentMeta.label) }}</span>
            </div>
            <div
              v-if="commerce.transactionId"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('تراکنش') }}</span>
              <span
                class="num text-default"
                dir="ltr"
              >{{ commerce.transactionId }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('تاریخ') }}</span>
              <span class="num text-default">{{ commerce.paymentDate || order.date }}</span>
            </div>
            <div class="flex flex-col gap-2 pt-2">
              <NuxtLink
                :to="`/seller/finance/payments/pay-${order.id}`"
                class="text-xs text-primary hover:underline cursor-pointer"
              >
                {{ $t('مشاهده پرداخت مالی') }}
              </NuxtLink>
              <NuxtLink
                :to="`/seller/finance/transactions?q=${encodeURIComponent(order.id)}`"
                class="text-xs text-primary hover:underline cursor-pointer"
              >
                {{ $t('مشاهده تراکنش‌های مرتبط') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Shipping -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('ارسال') }}
          </h3>
          <div class="space-y-2 text-xs mb-3">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش') }}</span>
              <span class="text-default">{{ $t(order.shippingMethod) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('وضعیت') }}</span>
              <span class="text-default">{{ $t(shippingMeta.label) }}</span>
            </div>
          </div>
          <TheFormInput
            v-if="can('shipping.manage') || canUpdateOrder"
            v-model="trackingDraft"
            :label="$t('کد پیگیری')"
            dir="ltr"
            class="mb-2"
          />
          <UButton
            v-if="can('shipping.manage') || canUpdateOrder"
            color="primary"
            variant="soft"
            size="sm"
            block
            class="cursor-pointer"
            @click="saveTracking"
          >
            {{ $t('ذخیره کد پیگیری') }}
          </UButton>
        </div>

        <!-- Totals -->
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('خلاصه مالی') }}
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('جمع کالاها') }}</span>
              <span class="num text-default">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('تخفیف') }}</span>
              <span class="num text-default">{{ formatPrice(commerce.discountAmount) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('هزینه ارسال') }}</span>
              <span class="num text-default">
                {{ commerce.shippingCost > 0 ? formatPrice(commerce.shippingCost) : $t('رایگان') }}
              </span>
            </div>
            <div
              v-if="commerce.taxAmount"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('مالیات') }}</span>
              <span class="num text-default">{{ formatPrice(commerce.taxAmount) }}</span>
            </div>
            <div class="flex justify-between gap-3 font-bold pt-2 border-t border-muted">
              <span class="text-default">{{ $t('مبلغ نهایی') }}</span>
              <span class="num text-highlighted">{{ formatPrice(order.total) }} {{ $t('تومان') }}</span>
            </div>
            <div
              v-if="commerce.refundedAmount"
              class="flex justify-between gap-3 text-info"
            >
              <span>{{ $t('بازپرداخت‌شده') }}</span>
              <span class="num">{{ formatPrice(commerce.refundedAmount) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div
    v-else
    class="py-16 text-center bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl"
  >
    <UIcon
      name="i-tabler-package-off"
      class="size-16 text-dimmed mx-auto mb-4"
    />
    <h1 class="text-xl font-bold text-highlighted mb-4">
      {{ $t('سفارش یافت نشد') }}
    </h1>
    <UButton
      to="/seller/orders"
      color="primary"
      size="lg"
      class="font-bold cursor-pointer"
    >
      {{ $t('بازگشت به سفارش‌ها') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import {
  sellerOrderActionLabel,
  sellerOrderAdvanceConfirm,
  sellerOrderNextStatus,
  sellerOrderPrevStatus,
  sellerOrderStatusMeta,
  sellerOrderTrackingSteps,
  sellerOrderUndoConfirm,
  sellerOrderUndoLabel,
  type SellerOrder,
} from '~/data/seller'
import {
  emptyOrderCommerce,
  sellerPaymentStatusMeta,
  sellerShippingStatusMeta,
} from '~/data/seller-order-commerce'
import { formatPrice } from '~/data/products'
import { customerFullName } from '~/data/seller-customers'

const props = defineProps<{
  orderId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const { fetchOrder, advanceOrder, revertOrder, setOrderStatus, resolveProduct } = useSeller()
const { getCommerce, saveCommerce, addInternalNote, appendTimeline } = useSellerOrderCommerce()
const { customers, ensureLoaded: ensureCustomers } = useSellerCustomers()
const { can } = useSellerPermissions()
const canUpdateOrder = computed(() => can('orders.update'))

ensureCustomers()

const order = ref<SellerOrder | null>(null)
const loading = ref(true)
const noteDraft = ref('')
const trackingDraft = ref('')
const cancelOpen = ref(false)
const cancelling = ref(false)

const commerce = computed(() =>
  order.value ? getCommerce(order.value) : emptyOrderCommerce({
    id: '',
    date: '',
    dateKey: '',
    status: 'new',
    customerName: '',
    customerPhone: '',
    city: '',
    address: { province: '', city: '', address: '', postalCode: '' },
    items: [],
    total: 0,
    shippingMethod: '',
    paymentMethod: '',
  }),
)

const paymentMeta = computed(() =>
  sellerPaymentStatusMeta[commerce.value?.paymentStatus ?? 'pending'],
)
const shippingMeta = computed(() =>
  sellerShippingStatusMeta[commerce.value?.shippingStatus ?? 'unfulfilled'],
)

const matchedCustomer = computed(() => {
  if (!order.value) return null
  return customers.value.find(c =>
    c.phone === order.value!.customerPhone
    || customerFullName(c) === order.value!.customerName,
  ) ?? null
})

async function loadOrder() {
  loading.value = true
  try {
    const { ok, order: fetched } = await fetchOrder(props.orderId, { force: true })
    order.value = ok ? fetched : null
    if (order.value) {
      trackingDraft.value = getCommerce(order.value).trackingCode
    }
  }
  finally {
    loading.value = false
  }
}

watch(
  () => props.orderId,
  () => {
    void loadOrder()
  },
  { immediate: true },
)

const statusMeta = computed(() =>
  order.value ? sellerOrderStatusMeta[order.value.status] : sellerOrderStatusMeta.new,
)

const nextAction = computed(() =>
  order.value ? sellerOrderActionLabel[order.value.status] : undefined,
)

const undoAction = computed(() =>
  order.value ? sellerOrderUndoLabel[order.value.status] : undefined,
)

const showTracking = computed(() => {
  const status = order.value?.status
  return status !== 'cancelled' && status !== 'returned'
})

const canCancel = computed(() => {
  const s = order.value?.status
  return s === 'new' || s === 'packing' || s === 'shipped'
})

const lineItems = computed(() =>
  (order.value?.items ?? []).map(item => ({
    ...item,
    product: resolveProduct(item.productId),
  })),
)

const subtotal = computed(() =>
  lineItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

type StatusConfirmMode = 'advance' | 'undo'
const confirmOpen = ref(false)
const pendingMode = ref<StatusConfirmMode>('advance')

const confirmTitle = computed(() =>
  pendingMode.value === 'undo' ? 'بازگشت وضعیت سفارش' : 'تأیید تغییر وضعیت',
)

const confirmDescription = computed(() => {
  const status = order.value?.status
  if (!status) return ''
  if (pendingMode.value === 'undo') {
    return sellerOrderUndoConfirm[status] ?? 'آیا از بازگشت به مرحله قبل مطمئن هستید؟'
  }
  return sellerOrderAdvanceConfirm[status] ?? 'آیا از تغییر وضعیت این سفارش مطمئن هستید؟'
})

const confirmButtonLabel = computed(() => {
  if (pendingMode.value === 'undo') return undoAction.value ?? 'بازگشت'
  return nextAction.value ?? 'تأیید'
})

const pendingTargetLabel = computed(() => {
  const status = order.value?.status
  if (!status) return undefined
  const target = pendingMode.value === 'undo'
    ? sellerOrderPrevStatus[status]
    : sellerOrderNextStatus[status]
  return target ? sellerOrderStatusMeta[target].label : undefined
})

function openStatusConfirm(mode: StatusConfirmMode) {
  pendingMode.value = mode
  confirmOpen.value = true
}

function openCancel() {
  cancelOpen.value = true
}

async function confirmStatusChange() {
  if (!order.value) return
  const id = order.value.id
  const ok = pendingMode.value === 'undo'
    ? await revertOrder(id)
    : await advanceOrder(id)

  confirmOpen.value = false
  if (!ok) {
    toast.error(t('تغییر وضعیت انجام نشد'))
    return
  }

  const refreshed = await fetchOrder(id, { force: true })
  if (refreshed.ok) {
    order.value = refreshed.order
    appendTimeline(
      id,
      pendingMode.value === 'undo' ? 'بازگشت وضعیت' : 'تغییر وضعیت',
      'ادمین',
      refreshed.order.status,
    )
  }
  toast.success(
    pendingMode.value === 'undo'
      ? t('وضعیت به مرحله قبل برگشت')
      : t('وضعیت سفارش به‌روزرسانی شد'),
  )
}

async function confirmCancel() {
  if (!order.value) return
  cancelling.value = true
  try {
    const ok = await setOrderStatus(order.value.id, 'cancelled')
    cancelOpen.value = false
    if (!ok) {
      toast.error(t('لغو سفارش ناموفق بود'))
      return
    }
    appendTimeline(order.value.id, 'لغو سفارش', 'ادمین')
    const refreshed = await fetchOrder(order.value.id, { force: true })
    if (refreshed.ok) order.value = refreshed.order
    toast.success(t('سفارش لغو شد'))
  }
  finally {
    cancelling.value = false
  }
}

function addNote() {
  if (!order.value || !noteDraft.value.trim()) return
  addInternalNote(order.value.id, noteDraft.value, 'ادمین')
  noteDraft.value = ''
  toast.success(t('یادداشت ذخیره شد'))
}

function saveTracking() {
  if (!order.value) return
  saveCommerce(order.value.id, {
    ...getCommerce(order.value),
    trackingCode: trackingDraft.value.trim(),
  })
  appendTimeline(order.value.id, 'ثبت کد پیگیری', 'ادمین', trackingDraft.value.trim())
  toast.success(t('کد پیگیری ذخیره شد'))
}

function printInvoice() {
  window.print()
}

function formatEventDate(value: string) {
  if (!value) return ''
  if (value.includes('T')) {
    try {
      return new Date(value).toLocaleString('fa-IR')
    }
    catch {
      return value
    }
  }
  return value
}
</script>
