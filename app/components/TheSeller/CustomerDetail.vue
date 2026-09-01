<template>
  <div
    v-if="!customer"
    class="py-16"
  >
    <TheSellerEmptyState
      icon="i-tabler-user-off"
      :message="$t('مشتری پیدا نشد')"
    >
      <template #actions>
        <UButton
          to="/seller/customers"
          color="primary"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('بازگشت به لیست') }}
        </UButton>
      </template>
    </TheSellerEmptyState>
  </div>

  <div
    v-else
    class="space-y-5"
  >
    <div class="md:hidden">
      <UButton
        to="/seller/customers"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-lg font-bold text-highlighted">
            {{ customerFullName(customer) }}
          </h2>
          <p class="text-xs text-muted mt-1 num" dir="ltr">
            {{ customer.email }}
            <span v-if="customer.phone"> · {{ customer.phone }}</span>
          </p>
          <div class="flex gap-1.5 mt-3 flex-wrap">
            <UBadge
              :color="sellerCustomerStatusMeta[customer.status].color"
              variant="subtle"
            >
              {{ $t(sellerCustomerStatusMeta[customer.status].label) }}
            </UBadge>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <UButton
            v-if="can('customers.update')"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-tabler-pencil"
            class="cursor-pointer"
            @click="showEdit = !showEdit"
          >
            {{ $t('ویرایش') }}
          </UButton>
          <UButton
            v-if="can('customers.update') && customer.status !== 'active'"
            color="success"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="openConfirm('activate')"
          >
            {{ $t('فعال‌سازی') }}
          </UButton>
          <UButton
            v-if="can('customers.update') && customer.status === 'active'"
            color="warning"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="openConfirm('deactivate')"
          >
            {{ $t('غیرفعال‌سازی') }}
          </UButton>
          <UButton
            v-if="can('customers.block') && customer.status !== 'blocked'"
            color="error"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="openConfirm('block')"
          >
            {{ $t('مسدودسازی') }}
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('تاریخ ثبت‌نام') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ customer.registeredAt.slice(0, 10) }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('آخرین فعالیت') }}
          </div>
          <div class="num mt-1" dir="ltr">
            {{ customer.lastActivityAt.slice(0, 10) }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('تعداد سفارش') }}
          </div>
          <div class="num mt-1">
            {{ customer.orderCount.toLocaleString('fa-IR') }}
          </div>
        </div>
        <div>
          <div class="text-[11px] text-muted">
            {{ $t('مجموع خرید') }}
          </div>
          <div class="num mt-1">
            {{ formatPrice(customer.totalSpent) }} {{ $t('تومان') }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('خلاصه مالی') }}
        </h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('سفارش تکمیل‌شده') }}
            </div>
            <div class="num mt-1">
              {{ customer.completedOrders.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('لغو شده') }}
            </div>
            <div class="num mt-1">
              {{ customer.cancelledOrders.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مرجوعی') }}
            </div>
            <div class="num mt-1">
              {{ customer.returnedOrders.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('مجموع بازپرداخت') }}
            </div>
            <div class="num mt-1">
              {{ formatPrice(customer.refundTotal) }} {{ $t('تومان') }}
            </div>
          </div>
        </div>
        <NuxtLink
          :to="`/seller/finance/transactions?q=${encodeURIComponent(customerFullName(customer))}`"
          class="inline-flex items-center gap-1 mt-4 text-xs text-primary hover:underline cursor-pointer"
        >
          <UIcon
            name="i-tabler-arrows-exchange"
            class="size-3.5"
          />
          {{ $t('تراکنش‌های مالی این مشتری') }}
        </NuxtLink>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('تعامل') }}
        </h3>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('نظرات') }}
            </div>
            <div class="num mt-1">
              {{ customer.reviewCount.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('پرسش‌ها') }}
            </div>
            <div class="num mt-1">
              {{ customer.questionCount.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('علاقه‌مندی‌ها') }}
            </div>
            <div class="num mt-1">
              {{ customer.wishlistCount.toLocaleString('fa-IR') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showEdit && can('customers.update')"
      class="bg-default border border-muted rounded-2xl p-5 md:p-6"
    >
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('ویرایش مشتری') }}
      </h3>
      <form
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        @submit.prevent="saveEdit"
      >
        <TheFormInput
          v-model="form.firstName"
          :label="$t('نام')"
          required
        />
        <TheFormInput
          v-model="form.lastName"
          :label="$t('نام خانوادگی')"
          required
        />
        <TheFormInput
          v-model="form.email"
          :label="$t('ایمیل')"
          dir="ltr"
          type="email"
        />
        <TheFormInput
          v-model="form.phone"
          :label="$t('تلفن')"
          dir="ltr"
          digits-only
        />
        <UFormField
          :label="$t('وضعیت')"
          class="sm:col-span-2"
        >
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full sm:w-64"
          />
        </UFormField>
        <div class="sm:col-span-2 flex gap-2">
          <UButton
            type="submit"
            color="primary"
            class="cursor-pointer"
          >
            {{ $t('ذخیره') }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="resetForm"
          >
            {{ $t('انصراف') }}
          </UButton>
        </div>
      </form>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('آدرس‌ها') }}
      </h3>
      <div
        v-if="customer.addresses.length"
        class="space-y-3"
      >
        <div
          v-for="addr in customer.addresses"
          :key="addr.id"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium text-highlighted">{{ addr.title }}</span>
            <UBadge
              v-if="addr.isDefault"
              color="primary"
              variant="subtle"
              size="xs"
            >
              {{ $t('پیش‌فرض') }}
            </UBadge>
          </div>
          <div class="text-muted mt-2">
            {{ addr.recipient }} · {{ addr.phone }}
          </div>
          <div class="mt-1">
            {{ addr.province }}، {{ addr.city }} — {{ addr.address }}
          </div>
          <div class="text-[11px] text-muted num mt-1" dir="ltr">
            {{ addr.postalCode }}
          </div>
        </div>
      </div>
      <p
        v-else
        class="text-sm text-muted"
      >
        {{ $t('آدرسی ثبت نشده') }}
      </p>
    </div>

    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6">
      <h3 class="font-bold text-highlighted mb-4">
        {{ $t('سفارش‌های مرتبط') }}
      </h3>
      <div
        v-if="relatedOrders.length"
        class="space-y-3"
      >
        <div
          v-for="order in relatedOrders"
          :key="order.id"
          class="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-muted bg-muted/40 p-4"
        >
          <div>
            <div class="font-medium text-highlighted num" dir="ltr">
              {{ order.id }}
            </div>
            <div class="text-[11px] text-muted mt-1">
              {{ order.date }} · {{ formatPrice(order.total) }} {{ $t('تومان') }}
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
            {{ $t('مشاهده') }}
          </UButton>
        </div>
      </div>
      <p
        v-else
        class="text-sm text-muted"
      >
        {{ $t('سفارشی برای این مشتری پیدا نشد') }}
      </p>
    </div>

    <UModal
      v-model:open="confirmOpen"
      :title="$t(confirmTitle)"
      :description="$t(confirmDescription)"
    >
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
            :color="pendingAction === 'block' ? 'error' : 'primary'"
            class="font-bold cursor-pointer"
            @click="confirmAction"
          >
            {{ $t('تأیید') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  customerFullName,
  sellerCustomerStatusMeta,
  toCustomerForm,
  type SellerCustomerFormValues,
  type SellerCustomerStatus,
} from '~/data/seller-customers'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  customerId: string
}>()

const route = useRoute()
const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { getById, ensureLoaded, updateCustomer, setStatus, customerFullName: fullName } = useSellerCustomers()
const { orders, fetchOrders } = useSeller()

ensureLoaded()
void fetchOrders()

const showEdit = ref(route.query.tab === 'edit')
const confirmOpen = ref(false)
const pendingAction = ref<'activate' | 'deactivate' | 'block' | null>(null)
const form = ref<SellerCustomerFormValues>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'active',
})

const customer = computed(() => getById(props.customerId))

watch(customer, (c) => {
  if (c) form.value = toCustomerForm(c)
}, { immediate: true })

const statusItems = computed(() =>
  (['active', 'inactive', 'blocked'] as SellerCustomerStatus[]).map(value => ({
    label: t(sellerCustomerStatusMeta[value].label),
    value,
  })),
)

const relatedOrders = computed(() => {
  const c = customer.value
  if (!c) return []
  const name = fullName(c).trim()
  return orders.value.filter(order =>
    order.customerPhone === c.phone
    || order.customerName.trim() === name,
  ).slice(0, 10)
})

const confirmTitle = computed(() => {
  if (pendingAction.value === 'activate') return 'فعال‌سازی مشتری'
  if (pendingAction.value === 'deactivate') return 'غیرفعال‌سازی مشتری'
  if (pendingAction.value === 'block') return 'مسدودسازی مشتری'
  return 'تأیید'
})

const confirmDescription = computed(() => {
  const name = customer.value ? fullName(customer.value) : ''
  if (pendingAction.value === 'activate') return `آیا ${name} فعال شود؟`
  if (pendingAction.value === 'deactivate') return `آیا ${name} غیرفعال شود؟`
  if (pendingAction.value === 'block') return `آیا ${name} مسدود شود؟`
  return ''
})

function openConfirm(action: 'activate' | 'deactivate' | 'block') {
  pendingAction.value = action
  confirmOpen.value = true
}

function confirmAction() {
  const action = pendingAction.value
  if (!action) return
  const status: SellerCustomerStatus =
    action === 'activate' ? 'active'
      : action === 'deactivate' ? 'inactive'
        : 'blocked'
  const result = setStatus(props.customerId, status)
  confirmOpen.value = false
  pendingAction.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('وضعیت مشتری به‌روزرسانی شد'))
}

function resetForm() {
  const c = customer.value
  if (c) form.value = toCustomerForm(c)
  showEdit.value = false
}

function saveEdit() {
  const result = updateCustomer(props.customerId, form.value)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('اطلاعات مشتری ذخیره شد'))
  showEdit.value = false
}
</script>
