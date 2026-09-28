<template>
  <div
    v-if="loading"
    class="px-4 py-4 space-y-3"
  >
    <USkeleton class="h-28 w-full rounded-2xl" />
    <USkeleton class="h-40 w-full rounded-2xl" />
    <USkeleton class="h-24 w-full rounded-2xl" />
  </div>

  <div
    v-else-if="missing"
    class="px-4 py-16 text-center space-y-3"
  >
    <UIcon
      name="i-tabler-package-off"
      class="size-12 text-dimmed mx-auto"
    />
    <p class="font-bold text-highlighted">
      {{ $t('سفارش یافت نشد') }}
    </p>
    <UButton
      to="/courier"
      color="primary"
      class="cursor-pointer min-h-11"
    >
      {{ $t('بازگشت به سفارش‌ها') }}
    </UButton>
  </div>

  <div
    v-else-if="error"
    class="px-4 py-10 text-center space-y-3"
  >
    <UIcon
      name="i-tabler-wifi-off"
      class="size-10 text-dimmed mx-auto"
    />
    <p class="text-sm text-muted">
      {{ error }}
    </p>
    <UButton
      color="primary"
      class="cursor-pointer min-h-11"
      @click="load"
    >
      {{ $t('تلاش دوباره') }}
    </UButton>
  </div>

  <div
    v-else-if="order"
    class="px-4 py-4 pb-44 space-y-3"
  >
    <div class="bg-default border border-muted rounded-2xl p-4 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span
          class="num font-bold text-highlighted"
          dir="ltr"
        >{{ order.id }}</span>
        <UBadge
          :color="courierStatusMeta(order.status).color"
          variant="subtle"
        >
          {{ $t(courierStatusMeta(order.status).label) }}
        </UBadge>
      </div>
      <div
        v-if="order.date"
        class="inline-flex items-center gap-1 text-xs text-muted"
      >
        <UIcon
          name="i-tabler-calendar"
          class="size-3.5"
        />
        <span class="num">{{ order.date }}</span>
      </div>
      <div class="text-sm font-medium text-default">
        {{ order.receiverName }}
      </div>
      <p class="text-sm text-toned leading-6">
        {{ order.address.province }}، {{ order.address.city }}، {{ order.address.address }}
      </p>
      <p class="text-xs text-muted num">
        {{ $t('کدپستی') }}: {{ order.address.postalCode }}
      </p>
      <div class="grid grid-cols-2 gap-2 pt-1">
        <a
          :href="`tel:${order.phone}`"
          class="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-inverted text-sm font-bold cursor-pointer"
        >
          <UIcon
            name="i-tabler-phone"
            class="size-4"
          />
          {{ $t('تماس') }}
        </a>
        <a
          :href="mapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-default bg-default text-default text-sm font-bold cursor-pointer"
        >
          <UIcon
            name="i-tabler-map-pin"
            class="size-4"
          />
          {{ $t('مسیریابی') }}
        </a>
      </div>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-4">
      <h2 class="text-sm font-bold text-highlighted mb-3">
        {{ $t('کالاها') }}
      </h2>
      <ul class="space-y-2">
        <li
          v-for="(item, index) in order.items"
          :key="`${item.title}-${index}`"
          class="flex items-start justify-between gap-3 text-sm"
        >
          <span class="text-default">
            {{ item.title }}
            <span
              v-if="item.variantLabel"
              class="text-muted"
            >· {{ item.variantLabel }}</span>
          </span>
          <span class="num text-toned shrink-0">×{{ item.qty.toLocaleString('fa-IR') }}</span>
        </li>
      </ul>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-4 space-y-2 text-sm">
      <div class="flex justify-between gap-3">
        <span class="text-muted">{{ $t('مبلغ') }}</span>
        <span class="num font-bold text-highlighted">{{ formatPrice(order.total) }} {{ $t('تومان') }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-muted">{{ $t('پرداخت') }}</span>
        <span class="text-default">{{ order.paymentMethod }}</span>
      </div>
      <div class="flex justify-between gap-3">
        <span class="text-muted">{{ $t('ارسال') }}</span>
        <span class="text-default">{{ order.shippingMethod }}</span>
      </div>
      <div v-if="order.note">
        <div class="text-muted mb-1">
          {{ $t('یادداشت') }}
        </div>
        <p class="text-default leading-6">
          {{ order.note }}
        </p>
      </div>
    </div>

    <div
      v-if="canDeliver"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-muted bg-default pb-[env(safe-area-inset-bottom)]"
    >
      <form
        class="max-w-[480px] mx-auto p-3 flex flex-col gap-2"
        @submit.prevent="submitCode"
      >
        <UFormField :error="codeError || undefined">
          <UInput
            v-model="code"
            inputmode="numeric"
            maxlength="6"
            dir="ltr"
            size="xl"
            :placeholder="$t('کد تحویل')"
            class="w-full"
            :ui="{ base: 'min-h-11 text-center num tracking-widest' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          class="cursor-pointer min-h-11"
          :loading="submitting"
        >
          {{ $t('ثبت تحویل') }}
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { courierMapsUrl, courierStatusMeta, type CourierOrder } from '~/data/courier'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  orderId: string
}>()

const { fetchOrder, deliver } = useCourier()
const toast = useAppToast()
const { t } = useI18n()

const order = ref<CourierOrder | null>(null)
const loading = ref(true)
const missing = ref(false)
const error = ref('')
const code = ref('')
const codeError = ref('')
const submitting = ref(false)

const mapsUrl = computed(() => order.value ? courierMapsUrl(order.value) : '#')
const canDeliver = computed(() =>
  order.value ? ['new', 'packing', 'shipped'].includes(order.value.status) : false,
)

async function load() {
  loading.value = true
  missing.value = false
  error.value = ''
  try {
    const result = await fetchOrder(props.orderId)
    if (result.missing) {
      missing.value = true
      order.value = null
      return
    }
    if (!result.ok || !result.order) {
      error.value = result.message
      order.value = null
      return
    }
    order.value = result.order
  }
  finally {
    loading.value = false
  }
}

async function submitCode() {
  if (!order.value) return
  codeError.value = ''
  const value = code.value.trim()
  if (!/^\d{6}$/.test(value)) {
    codeError.value = t('کد شش رقمی را وارد کنید')
    return
  }
  submitting.value = true
  try {
    const result = await deliver(order.value.id, value)
    if (!result.ok || !result.order) {
      codeError.value = result.message || t('کد تحویل نادرست است')
      return
    }
    order.value = result.order
    code.value = ''
    toast.success(t('سفارش تحویل شد'))
  }
  finally {
    submitting.value = false
  }
}

watch(() => props.orderId, () => {
  void load()
}, { immediate: true })
</script>
