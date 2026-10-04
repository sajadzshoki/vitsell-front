<template>
  <div
    v-if="loading"
    class="space-y-5"
  >
    <USkeleton class="h-40 rounded-2xl" />
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <USkeleton class="lg:col-span-2 h-64 rounded-2xl" />
      <div class="space-y-3">
        <USkeleton class="h-36 rounded-2xl" />
        <USkeleton class="h-48 rounded-2xl" />
      </div>
    </div>
  </div>

  <div
    v-else-if="order"
    class="space-y-5"
  >
    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <div class="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 class="text-xl font-bold text-highlighted flex items-center gap-2 flex-wrap">
            {{ $t('سفارش') }}
            <span class="num text-primary" dir="ltr">{{ order.id }}</span>
          </h1>
          <div class="text-xs text-muted mt-1 num">
            {{ $t('ثبت‌شده در تاریخ') }} {{ order.date }}
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <UButton
            v-if="canReturn"
            color="primary"
            variant="soft"
            icon="i-tabler-arrow-back-up"
            class="cursor-pointer"
            @click="returnOpen = true"
          >
            {{ $t('مرجوع کردن') }}
          </UButton>
          <UBadge
            :color="statusMeta.color"
            variant="subtle"
            size="md"
            class="font-bold"
          >
            <UIcon :name="statusMeta.icon" class="size-4 shrink-0" />
            {{ $t(statusMeta.label) }}
          </UBadge>
        </div>
      </div>

      <div
        v-if="order.status !== 'cancelled' && order.status !== 'returned'"
        class="bg-muted rounded-2xl p-4 sm:p-5"
      >
        <div class="flex items-start justify-between gap-1 overflow-hidden">
          <div
            v-for="(step, index) in orderTrackingSteps"
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
              <span v-else class="num">{{ (index + 1).toLocaleString('fa-IR') }}</span>
            </div>
            <div
              class="text-[9px] sm:text-[11px] text-center mt-2 leading-tight px-0.5"
              :class="index <= statusMeta.step ? 'text-default font-medium' : 'text-dimmed'"
            >
              {{ $t(step) }}
            </div>
            <div
              v-if="index < orderTrackingSteps.length - 1"
              class="absolute top-4.5 sm:top-5 start-1/2 w-full h-0.5 z-0 pointer-events-none"
              :class="index < statusMeta.step ? 'bg-success' : 'bg-muted'"
            />
          </div>
        </div>
      </div>

      <div
        v-if="orderReturns.length"
        class="mt-5 space-y-2"
      >
        <h2 class="text-sm font-bold text-highlighted">{{ $t('درخواست‌های مرجوعی') }}</h2>
        <div
          v-for="request in orderReturns"
          :key="request.id"
          class="rounded-xl border border-muted bg-muted/40 p-3"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="num text-xs text-muted" dir="ltr">{{ request.id }}</span>
            <UBadge
              :color="returnStatusMeta(request.status).color"
              variant="subtle"
              size="xs"
            >
              {{ $t(returnStatusMeta(request.status).label) }}
            </UBadge>
          </div>
          <p class="text-sm text-default mt-2">{{ request.reason }}</p>
          <ul class="mt-2 space-y-1">
            <li
              v-for="(line, index) in request.items"
              :key="`${request.id}-${line.productId}-${index}`"
              class="text-xs text-toned"
            >
              {{ line.productTitle }}
              <span v-if="line.variantLabel"> · {{ line.variantLabel }}</span>
              · {{ line.qty.toLocaleString('fa-IR') }} {{ $t('عدد') }}
            </li>
          </ul>
          <p
            v-if="request.adminNote"
            class="text-xs text-muted mt-2"
          >
            {{ $t('پاسخ فروشنده') }}: {{ request.adminNote }}
          </p>
          <div
            v-if="request.photos.length"
            class="flex gap-2 mt-2"
          >
            <img
              v-for="url in request.photos"
              :key="url"
              :src="mediaSrc(url)"
              alt=""
              class="size-14 rounded-lg object-cover border border-muted"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-3">
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">{{ $t('کالاهای سفارش') }}</h3>
          <div class="space-y-4">
            <div
              v-for="item in lineItems"
              :key="`${item.productId}-${item.variantId || ''}`"
              class="flex gap-3 pb-4 border-b border-muted last:(border-b-0 pb-0)"
            >
              <NuxtLink
                v-if="item.product"
                :to="`/product/${item.product.id}`"
                class="size-20 rounded-xl bg-muted overflow-hidden shrink-0"
              >
                <img
                  :src="item.product.image"
                  :alt="item.product.title"
                  class="size-full object-cover hover:scale-105 transition"
                >
              </NuxtLink>
              <div
                v-else
                class="size-20 rounded-xl bg-muted overflow-hidden shrink-0 grid place-items-center"
              >
                <TheIcon
                  icon-type="img"
                  name="noImage.png"
                  class="size-8 opacity-60"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  v-if="item.product"
                  class="text-[10px] text-dimmed mb-1 uppercase"
                >
                  {{ item.product.brand }}
                </div>
                <NuxtLink
                  v-if="item.product"
                  :to="`/product/${item.product.id}`"
                  class="text-sm font-medium text-default hover:text-primary line-clamp-2 text-start block"
                >
                  {{ item.product.title }}
                </NuxtLink>
                <p
                  v-else
                  class="text-sm font-medium text-muted"
                >
                  {{ $t('محصول') }}
                  <span class="num" dir="ltr">{{ item.productId }}</span>
                </p>
                <div class="text-[11px] text-muted mt-1 num">
                  {{ $t('تعداد') }}: {{ item.qty.toLocaleString('fa-IR') }}
                </div>
              </div>
              <div class="text-end shrink-0">
                <div class="text-sm font-bold text-highlighted num">
                  {{ formatPrice(item.price * item.qty) }}
                </div>
                <div class="text-[10px] text-muted">{{ $t('تومان') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-3">
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">{{ $t('آدرس تحویل') }}</h3>
          <div class="text-xs text-toned leading-6">
            <div class="font-medium text-default mb-1">
              {{ order.address.fullName }} —
              <span class="num" dir="ltr">{{ order.address.phone }}</span>
            </div>
            <div>{{ order.address.province }}، {{ order.address.city }}، {{ order.address.address }}</div>
            <div class="text-muted mt-1 num">
              {{ $t('کدپستی') }}: {{ order.address.postalCode }}
            </div>
          </div>
        </div>

        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">{{ $t('اطلاعات پرداخت') }}</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش ارسال') }}</span>
              <span class="text-default">{{ order.shippingMethod }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش پرداخت') }}</span>
              <span class="text-default">{{ order.paymentMethod }}</span>
            </div>
            <div
              v-if="order.carrier"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('حامل') }}</span>
              <span class="text-default">{{ order.carrier }}</span>
            </div>
            <div
              v-if="order.trackingCode"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('کد پیگیری') }}</span>
              <span class="num text-default" dir="ltr">{{ order.trackingCode }}</span>
            </div>
            <div
              v-for="row in order.deliveryCodes || []"
              :key="row.id"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">
                {{ $t('کد تحویل') }}
                <template v-if="(order.deliveryCodes || []).length > 1">({{ row.id }})</template>
              </span>
              <span
                class="num text-highlighted font-bold"
                dir="ltr"
              >{{ row.code }}</span>
            </div>
          </div>
          <div class="border-t border-muted mt-3 pt-3 space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('جمع کالاها') }}</span>
              <span class="num text-default">{{ formatPrice(subtotal) }}</span>
            </div>
            <div
              v-if="discountAmount > 0"
              class="flex justify-between gap-3"
            >
              <span class="text-muted">{{ $t('تخفیف') }}</span>
              <span class="num text-default">{{ formatPrice(discountAmount) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('هزینه ارسال') }}</span>
              <span
                class="num"
                :class="shippingCost > 0 ? 'text-default' : 'text-success'"
              >{{ shippingCost > 0 ? formatPrice(shippingCost) : $t('رایگان') }}</span>
            </div>
            <div class="flex justify-between gap-3 font-bold pt-2 border-t border-muted">
              <span class="text-default">{{ $t('مبلغ نهایی') }}</span>
              <span class="num text-highlighted">{{ formatPrice(payableTotal) }} {{ $t('تومان') }}</span>
            </div>
          </div>
        </div>

        <UButton
          type="button"
          color="neutral"
          variant="soft"
          block
          size="lg"
          icon="i-tabler-download"
          class="cursor-pointer"
          @click="downloadInvoice"
        >
          {{ $t('دانلود فاکتور') }}
        </UButton>
      </aside>
    </div>

    <div
      id="customer-order-invoice"
      class="hidden print:block bg-white text-black p-8"
      data-print-target="customer-invoice"
    >
      <div class="flex items-start justify-between gap-4 mb-6 border-b border-gray-300 pb-4">
        <div>
          <h1 class="text-xl font-bold">
            {{ $t('فاکتور فروش') }}
          </h1>
          <div class="text-sm mt-1 num" dir="ltr">
            {{ order.id }}
          </div>
          <div class="text-xs mt-1">
            {{ $t('تاریخ') }}: {{ order.date }}
          </div>
        </div>
        <div class="text-sm text-end">
          <div>{{ order.address.fullName }}</div>
          <div class="num" dir="ltr">{{ order.address.phone }}</div>
        </div>
      </div>
      <table class="w-full text-sm mb-6">
        <thead>
          <tr class="border-b border-gray-300 text-start">
            <th class="py-2 text-start">{{ $t('کالا') }}</th>
            <th class="py-2 text-start">{{ $t('تعداد') }}</th>
            <th class="py-2 text-start">{{ $t('فی') }}</th>
            <th class="py-2 text-start">{{ $t('جمع') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in lineItems"
            :key="`${item.productId}-${item.variantId || ''}`"
            class="border-b border-gray-200"
          >
            <td class="py-2">
              {{ item.product?.title || item.productId }}
              <span v-if="item.variantLabel"> · {{ item.variantLabel }}</span>
            </td>
            <td class="py-2 num">{{ item.qty.toLocaleString('fa-IR') }}</td>
            <td class="py-2 num">{{ formatPrice(item.price) }}</td>
            <td class="py-2 num">{{ formatPrice(item.price * item.qty) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="text-sm space-y-1 max-w-xs ms-auto">
        <div class="flex justify-between gap-6">
          <span>{{ $t('جمع کالاها') }}</span>
          <span class="num">{{ formatPrice(subtotal) }}</span>
        </div>
        <div
          v-if="discountAmount > 0"
          class="flex justify-between gap-6"
        >
          <span>{{ $t('تخفیف') }}</span>
          <span class="num">{{ formatPrice(discountAmount) }}</span>
        </div>
        <div class="flex justify-between gap-6">
          <span>{{ $t('هزینه ارسال') }}</span>
          <span>{{ shippingCost > 0 ? formatPrice(shippingCost) : $t('رایگان') }}</span>
        </div>
        <div class="flex justify-between gap-6 font-bold pt-2 border-t border-gray-300">
          <span>{{ $t('مبلغ نهایی') }}</span>
          <span class="num">{{ formatPrice(payableTotal) }} {{ $t('تومان') }}</span>
        </div>
      </div>
      <div class="mt-6 text-xs space-y-1">
        <div>
          {{ $t('آدرس') }}: {{ order.address.province }}، {{ order.address.city }}، {{ order.address.address }}
        </div>
        <div class="num">
          {{ $t('کدپستی') }}: {{ order.address.postalCode }}
        </div>
        <div>{{ $t('پرداخت') }}: {{ order.paymentMethod }} · {{ $t('ارسال') }}: {{ order.shippingMethod }}</div>
        <div v-if="order.trackingCode">
          {{ $t('کد پیگیری') }}: <span class="num" dir="ltr">{{ order.trackingCode }}</span>
        </div>
        <div
          v-for="row in order.deliveryCodes || []"
          :key="`print-${row.id}`"
        >
          {{ $t('کد تحویل') }}
          <template v-if="(order.deliveryCodes || []).length > 1">({{ row.id }})</template>:
          <span class="num" dir="ltr">{{ row.code }}</span>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="py-16 text-center"
  >
    <UIcon name="i-tabler-package-off" class="size-16 text-dimmed mx-auto mb-4" />
    <h1 class="text-xl font-bold text-highlighted mb-4">{{ $t('سفارش یافت نشد') }}</h1>
    <UButton
      to="/account/orders"
      color="primary"
      size="lg"
      class="font-bold"
    >
      {{ $t('بازگشت به سفارش‌ها') }}
    </UButton>
  </div>

  <TheOrderReturnModal
    v-model:open="returnOpen"
    :order-id="orderId"
    :lines="returnableLines"
    @submitted="loadOrder"
  />
</template>

<script setup lang="ts">
import {
  orderReturnHoldStatuses,
  orderStatusMeta,
  orderTrackingSteps,
  type AccountOrderReturn,
} from '~/data/account'
import { sellerReturnStatusMeta } from '~/data/seller-returns-refunds'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  orderId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const { getOrderById, fetchOrder, fetchOrderReturns } = useAccount()
const { getCachedProduct } = useProducts()

const loading = ref(true)
const returnOpen = ref(false)
const orderReturns = ref<AccountOrderReturn[]>([])

const order = computed(() => getOrderById(props.orderId))
const statusMeta = computed(() =>
  (order.value && orderStatusMeta[order.value.status]) || orderStatusMeta.processing,
)

const lineItems = computed(() =>
  (order.value?.items ?? []).map(item => ({
    ...item,
    product: getCachedProduct(item.productId),
  })),
)

const returnableLines = computed(() =>
  lineItems.value.flatMap((item) => {
    const held = orderReturns.value
      .filter(row => (orderReturnHoldStatuses as readonly string[]).includes(row.status))
      .flatMap(row => row.items)
      .filter(row => row.productId === item.productId && (row.variantId || '') === (item.variantId || ''))
      .reduce((sum, row) => sum + row.qty, 0)
    const maxQty = item.qty - held
    if (maxQty <= 0) return []
    return [{
      key: `${item.productId}-${item.variantId || item.variantLabel || ''}`,
      productId: item.productId,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
      title: item.product?.title || item.productId,
      image: item.product?.image,
      maxQty,
    }]
  }),
)

const canReturn = computed(() => order.value?.status === 'delivered' && returnableLines.value.length > 0)

function returnStatusMeta(status: string) {
  return sellerReturnStatusMeta[status as keyof typeof sellerReturnStatusMeta]
    ?? { label: status, color: 'neutral' as const }
}

function mediaSrc(url: string) {
  return resolveMediaUrl(url) || url
}

const subtotal = computed(() =>
  lineItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

const discountAmount = computed(() => Number(order.value?.discountAmount) || 0)

const shippingCost = computed(() => {
  const stored = Number(order.value?.shippingCost) || 0
  if (stored > 0) return stored
  const paid = Number(order.value?.total) || 0
  return Math.max(0, paid - subtotal.value + discountAmount.value)
})

const payableTotal = computed(() => {
  const paid = Number(order.value?.total) || 0
  if (paid > 0) return paid
  return Math.max(0, subtotal.value - discountAmount.value + shippingCost.value)
})

function downloadInvoice() {
  document.body.dataset.printTarget = 'customer-invoice'
  const cleanup = () => {
    delete document.body.dataset.printTarget
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  window.setTimeout(cleanup, 1000)
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function loadOrder() {
  if (!props.orderId) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const { error } = await fetchOrder(props.orderId)
    if (error && !getOrderById(props.orderId)) {
      toast.error(apiErrorMessage(error, t('بارگذاری سفارش ناموفق بود')))
    }
    const returns = await fetchOrderReturns(props.orderId)
    orderReturns.value = returns.result || []
  }
  finally {
    loading.value = false
  }
}

watch(() => props.orderId, () => {
  loadOrder()
}, { immediate: true })
</script>

<style>
@media print {
  body * {
    visibility: hidden !important;
  }

  body[data-print-target='customer-invoice'] #customer-order-invoice,
  body[data-print-target='customer-invoice'] #customer-order-invoice * {
    visibility: visible !important;
  }

  body[data-print-target='customer-invoice'] #customer-order-invoice {
    display: block !important;
    position: absolute;
    inset: 0;
    width: 100%;
  }
}

@page {
  margin: 8mm;
}
</style>
