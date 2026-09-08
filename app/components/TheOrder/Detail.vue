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

      <div
        v-if="order.status !== 'cancelled'"
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
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-3">
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-4">{{ $t('کالاهای سفارش') }}</h3>
          <div class="space-y-4">
            <div
              v-for="item in lineItems"
              :key="item.productId"
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
</template>

<script setup lang="ts">
import { orderStatusMeta, orderTrackingSteps } from '~/data/account'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  orderId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const { getOrderById, fetchOrder } = useAccount()
const { getCachedProduct } = useProducts()

const loading = ref(true)

const order = computed(() => getOrderById(props.orderId))
const statusMeta = computed(() =>
  order.value ? orderStatusMeta[order.value.status] : orderStatusMeta.processing,
)

const lineItems = computed(() =>
  (order.value?.items ?? []).map(item => ({
    ...item,
    product: getCachedProduct(item.productId),
  })),
)

const subtotal = computed(() =>
  lineItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

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
  }
  finally {
    loading.value = false
  }
}

watch(() => props.orderId, () => {
  loadOrder()
}, { immediate: true })
</script>
