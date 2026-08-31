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
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between flex-wrap gap-3 mb-6">
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
        </div>
        <UBadge
          :color="statusMeta.color"
          variant="subtle"
          size="md"
          class="font-bold inline-flex items-center gap-1.5"
        >
          <UIcon
            :name="statusMeta.icon"
            class="size-4 shrink-0"
          />
          {{ $t(statusMeta.label) }}
        </UBadge>
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
        v-if="showTracking && (nextAction || undoAction)"
        class="mt-5 flex items-center justify-between gap-2 flex-wrap"
      >
        <UButton
          v-if="undoAction"
          color="neutral"
          variant="outline"
          size="lg"
          icon="i-tabler-arrow-back-up"
          class="font-medium"
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
          class="font-medium ms-auto"
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
            @click="confirmOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            :color="pendingMode === 'undo' ? 'warning' : 'primary'"
            class="font-bold"
            @click="confirmStatusChange"
          >
            {{ $t(confirmButtonLabel) }}
          </UButton>
        </div>
      </template>
    </UModal>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-3">
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
                class="size-20 rounded-xl bg-muted overflow-hidden shrink-0"
              >
                <img
                  v-if="item.product.image"
                  :src="item.product.image"
                  :alt="item.product.title"
                  class="size-full object-cover hover:scale-105 transition"
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
                  class="text-sm font-medium text-default hover:text-primary line-clamp-2 text-start block"
                >
                  {{ item.product.title }}
                </NuxtLink>
                <div class="text-[11px] text-muted mt-1 num">
                  {{ $t('تعداد') }}: {{ item.qty.toLocaleString('fa-IR') }}
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

        <div
          v-if="order.note"
          class="bg-default border border-muted rounded-2xl p-5"
        >
          <h3 class="font-bold text-highlighted mb-2 text-sm">
            {{ $t('یادداشت سفارش') }}
          </h3>
          <p class="text-xs text-toned leading-6">
            {{ order.note }}
          </p>
        </div>
      </div>

      <aside class="space-y-3">
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
                class="num text-primary font-medium"
                dir="ltr"
              >{{ order.customerPhone }}</a>
            </div>
          </div>
        </div>

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

        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3 text-sm">
            {{ $t('اطلاعات پرداخت') }}
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش ارسال') }}</span>
              <span class="text-default">{{ $t(order.shippingMethod) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('روش پرداخت') }}</span>
              <span class="text-default">{{ $t(order.paymentMethod) }}</span>
            </div>
          </div>
          <div class="border-t border-muted mt-3 pt-3 space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('جمع کالاها') }}</span>
              <span class="num text-default">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted">{{ $t('هزینه ارسال') }}</span>
              <span class="text-success">{{ $t('رایگان') }}</span>
            </div>
            <div class="flex justify-between gap-3 font-bold pt-2 border-t border-muted">
              <span class="text-default">{{ $t('مبلغ نهایی') }}</span>
              <span class="num text-highlighted">{{ formatPrice(order.total) }} {{ $t('تومان') }}</span>
            </div>
          </div>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          block
          size="lg"
        >
          {{ $t('دانلود فاکتور') }}
        </UButton>
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
      class="font-bold"
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
import { formatPrice } from '~/data/products'

const props = defineProps<{
  orderId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const { fetchOrder, advanceOrder, revertOrder, resolveProduct } = useSeller()

const order = ref<SellerOrder | null>(null)
const loading = ref(true)

async function loadOrder() {
  loading.value = true
  try {
    const { ok, order: fetched } = await fetchOrder(props.orderId, { force: true })
    order.value = ok ? fetched : null
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
  if (pendingMode.value === 'undo') {
    return undoAction.value ?? 'بازگشت'
  }
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
  if (refreshed.ok) order.value = refreshed.order

  toast.success(
    pendingMode.value === 'undo'
      ? t('وضعیت به مرحله قبل برگشت')
      : t('وضعیت سفارش به‌روزرسانی شد'),
  )
}
</script>
