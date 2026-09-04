<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('روش‌های ارسال')"
        :count-label="!methodsLoading ? `${shippingMethods.length.toLocaleString('fa-IR')} ${$t('روش')}` : undefined"
      />

      <div
        v-if="(methodsLoading || methodsPending) && !shippingMethods.length"
        class="py-16 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <TheSellerEmptyState
        v-else-if="!shippingMethods.length"
        icon="i-tabler-truck-delivery"
        :message="$t('روش ارسالی تعریف نشده')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="method in shippingMethods"
          :key="method.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div class="font-medium text-highlighted">
                {{ method.name }}
              </div>
              <div class="text-[11px] text-muted mt-1">
                {{ method.carrier }} · {{ method.estimatedDays }}
              </div>
            </div>
            <UBadge
              :color="method.status === 'active' ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ method.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
            </UBadge>
          </div>
          <div
            v-if="canManage"
            class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <TheFormInput
              :model-value="String(editDraft[method.id]?.baseCost ?? method.baseCost)"
              :label="$t('هزینه پایه (تومان)')"
              dir="ltr"
              digits-only
              @update:model-value="setDraftCost(method.id, $event)"
            />
            <UFormField :label="$t('وضعیت')">
              <USelect
                :model-value="editDraft[method.id]?.status ?? method.status"
                :items="statusItems"
                value-key="value"
                class="w-full"
                @update:model-value="setDraftStatus(method.id, String($event ?? ''))"
              />
            </UFormField>
            <div class="flex items-end">
              <UButton
                type="button"
                color="primary"
                variant="soft"
                size="sm"
                class="cursor-pointer w-full sm:w-auto"
                :loading="savingMethodId === method.id"
                @click="saveMethod(method.id)"
              >
                {{ $t('ذخیره') }}
              </UButton>
            </div>
          </div>
          <div
            v-else
            class="mt-3 text-sm num"
          >
            {{ formatPrice(method.baseCost) }} {{ $t('تومان') }}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('سفارش‌های نیازمند کد رهگیری')"
        :description="$t('سفارش‌های در حال آماده‌سازی یا ارسال بدون کد رهگیری')"
        :count-label="!trackingLoading ? `${trackingOrders.length.toLocaleString('fa-IR')} ${$t('سفارش')}` : undefined"
      />

      <div
        v-if="trackingLoading && !trackingOrders.length"
        class="py-16 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <TheSellerEmptyState
        v-else-if="!trackingOrders.length"
        icon="i-tabler-package"
        :message="$t('سفارشی برای ثبت رهگیری نیست')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="order in trackingOrders"
          :key="order.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <div class="font-medium text-highlighted num" dir="ltr">
                {{ order.id }}
              </div>
              <div class="text-[11px] text-muted mt-1">
                {{ order.customerName }} · {{ order.shippingMethod }}
              </div>
            </div>
            <UButton
              :to="`/seller/orders/${order.id}`"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-tabler-eye"
              class="cursor-pointer"
            >
              {{ $t('جزئیات سفارش') }}
            </UButton>
          </div>
          <div
            v-if="canManage"
            class="flex flex-col sm:(flex-row items-end) gap-2"
          >
            <TheFormInput
              :model-value="trackingDraft[order.id] ?? ''"
              :label="$t('کد رهگیری')"
              dir="ltr"
              class="flex-1 w-full"
              @update:model-value="trackingDraft[order.id] = String($event ?? '')"
            />
            <UButton
              type="button"
              color="primary"
              size="sm"
              class="cursor-pointer shrink-0"
              :loading="savingTrackingId === order.id"
              @click="saveTracking(order.id)"
            >
              {{ $t('ذخیره رهگیری') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { toSellerOrder, type SellerOrder } from '~/data/seller'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { shippingMethods, pending: methodsPending, fetchList, updateMethod } = useSellerShipping()
const { updateOrderTracking } = useSeller()

const canManage = computed(() => can('shipping.manage'))

const methodsLoading = ref(true)
const trackingLoading = ref(true)
const savingMethodId = ref<string | null>(null)
const savingTrackingId = ref<string | null>(null)
const trackingOrders = ref<SellerOrder[]>([])
const editDraft = ref<Record<string, { baseCost?: number, status?: 'active' | 'inactive' }>>({})
const trackingDraft = ref<Record<string, string>>({})

const statusItems = computed(() => [
  { label: t('فعال'), value: 'active' },
  { label: t('غیرفعال'), value: 'inactive' },
])

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function setDraftCost(id: string, value: string | number) {
  const raw = Number(String(value ?? '').replace(/\D/g, '')) || 0
  editDraft.value = {
    ...editDraft.value,
    [id]: { ...editDraft.value[id], baseCost: raw },
  }
}

function setDraftStatus(id: string, value: string) {
  const status = value === 'inactive' ? 'inactive' : 'active'
  editDraft.value = {
    ...editDraft.value,
    [id]: { ...editDraft.value[id], status },
  }
}

async function loadMethods() {
  methodsLoading.value = true
  try {
    const { ok, error } = await fetchList({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری روش‌های ارسال ناموفق بود')))
    }
  }
  finally {
    methodsLoading.value = false
  }
}

async function loadTrackingOrders() {
  trackingLoading.value = true
  try {
    const { result, error } = await useGet<{ items: any[] } | any[]>(
      '/seller/orders',
      {
        headers: { 'no-error': true },
        query: { needsTracking: true, pageSize: 20 },
      },
    )
    if (error || result == null) {
      toast.error(apiErrorMessage(error, t('بارگذاری سفارش‌های بدون رهگیری ناموفق بود')))
      trackingOrders.value = []
      return
    }
    const rows = Array.isArray(result)
      ? result
      : (Array.isArray(result.items) ? result.items : [])
    trackingOrders.value = rows.map((row: any) => toSellerOrder(row)).slice(0, 20)
  }
  finally {
    trackingLoading.value = false
  }
}

async function saveMethod(id: string) {
  const method = shippingMethods.value.find(m => m.id === id)
  if (!method) return
  const draft = editDraft.value[id]
  savingMethodId.value = id
  try {
    const result = await updateMethod(id, {
      baseCost: draft?.baseCost ?? method.baseCost,
      status: draft?.status ?? method.status,
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    const next = { ...editDraft.value }
    delete next[id]
    editDraft.value = next
    toast.success(t('روش ارسال به‌روزرسانی شد'))
  }
  finally {
    savingMethodId.value = null
  }
}

async function saveTracking(orderId: string) {
  const code = (trackingDraft.value[orderId] ?? '').trim()
  if (!code) {
    toast.error(t('کد رهگیری را وارد کنید'))
    return
  }
  savingTrackingId.value = orderId
  try {
    const result = await updateOrderTracking(orderId, { trackingCode: code })
    if (!result.ok) {
      toast.error(apiErrorMessage(result.error, t('ذخیره کد رهگیری ناموفق بود')))
      return
    }
    trackingOrders.value = trackingOrders.value.filter(o => o.id !== orderId)
    const next = { ...trackingDraft.value }
    delete next[orderId]
    trackingDraft.value = next
    toast.success(t('کد رهگیری ذخیره شد'))
  }
  finally {
    savingTrackingId.value = null
  }
}

onMounted(() => {
  void loadMethods()
  void loadTrackingOrders()
})
</script>
