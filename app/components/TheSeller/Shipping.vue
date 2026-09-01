<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('روش‌های ارسال')"
        :count-label="`${shippingMethods.length.toLocaleString('fa-IR')} ${$t('روش')}`"
      />

      <TheSellerEmptyState
        v-if="!shippingMethods.length"
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
        :count-label="`${trackingOrders.length.toLocaleString('fa-IR')} ${$t('سفارش')}`"
      />

      <TheSellerEmptyState
        v-if="!trackingOrders.length"
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
              :model-value="trackingDraft[order.id] ?? getCommerce(order).trackingCode"
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
              @click="saveTracking(order.id)"
            >
              {{ $t('ذخیره رهگیری') }}
            </UButton>
          </div>
          <div
            v-else-if="getCommerce(order).trackingCode"
            class="text-sm num"
            dir="ltr"
          >
            {{ getCommerce(order).trackingCode }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { shippingMethods, ensureLoaded, updateMethod } = useSellerShipping()
const { orders, fetchOrders } = useSeller()
const { getCommerce, saveCommerce } = useSellerOrderCommerce()

ensureLoaded()
void fetchOrders()

const canManage = computed(() => can('shipping.manage'))

const editDraft = ref<Record<string, { baseCost?: number, status?: 'active' | 'inactive' }>>({})
const trackingDraft = ref<Record<string, string>>({})

const statusItems = computed(() => [
  { label: t('فعال'), value: 'active' },
  { label: t('غیرفعال'), value: 'inactive' },
])

const trackingOrders = computed(() =>
  orders.value.filter((order) => {
    if (!['packing', 'shipped'].includes(order.status)) return false
    const code = getCommerce(order).trackingCode.trim()
    return !code
  }).slice(0, 20),
)

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

function saveMethod(id: string) {
  const method = shippingMethods.value.find(m => m.id === id)
  if (!method) return
  const draft = editDraft.value[id]
  updateMethod(id, {
    baseCost: draft?.baseCost ?? method.baseCost,
    status: draft?.status ?? method.status,
  })
  toast.success(t('روش ارسال به‌روزرسانی شد'))
}

function saveTracking(orderId: string) {
  const order = orders.value.find(o => o.id === orderId)
  if (!order) return
  const code = (trackingDraft.value[orderId] ?? getCommerce(order).trackingCode).trim()
  saveCommerce(orderId, { trackingCode: code })
  toast.success(t('کد رهگیری ذخیره شد'))
}
</script>
