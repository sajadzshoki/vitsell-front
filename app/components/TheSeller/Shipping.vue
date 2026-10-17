<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('روش‌های ارسال')"
        :count-label="!methodsLoading ? `${shippingMethods.length.toLocaleString('fa-IR')} ${$t('روش')}` : undefined"
      >
        <template
          v-if="canManage && hubTab === 'methods'"
          #actions
        >
          <UButton
            type="button"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="openCreate"
          >
            {{ $t('روش ارسال جدید') }}
          </UButton>
        </template>
      </TheSellerPageHeader>

      <UTabs
        v-model="hubTab"
        :items="hubTabItems"
        variant="pill"
        color="primary"
        size="sm"
        class="w-full mt-4"
        :ui="{
          list: 'bg-muted/60 p-1 rounded-xl w-full overflow-x-auto',
          trigger: 'shrink-0 font-medium',
          content: 'pt-4',
        }"
      >
        <template #methods>
          <div
            v-if="selectedMethod"
            class="mb-5 rounded-2xl border border-muted bg-muted/30 p-4 md:p-5"
          >
            <TheSellerShippingMethodPanel
              :method="selectedMethod"
              @close="selectedMethodId = null"
              @updated="onMethodUpdated"
            />
          </div>

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
          >
            <template
              v-if="canManage"
              #actions
            >
              <UButton
                type="button"
                color="primary"
                variant="soft"
                icon="i-tabler-plus"
                class="cursor-pointer"
                @click="openCreate"
              >
                {{ $t('افزودن اولین روش ارسال') }}
              </UButton>
            </template>
          </TheSellerEmptyState>

          <div
            v-else
            class="space-y-3"
          >
            <button
              v-for="method in shippingMethods"
              :key="method.id"
              type="button"
              class="w-full text-start bg-muted border rounded-2xl p-4 cursor-pointer transition hover:border-primary/40"
              :class="selectedMethodId === method.id ? 'border-primary bg-primary/5' : 'border-muted'"
              @click="openMethod(method.id)"
            >
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div class="font-medium text-highlighted">
                    {{ method.name }}
                  </div>
                  <div class="text-[11px] text-muted mt-1">
                    {{ method.carrier || '—' }} · {{ method.estimatedDays || '—' }}
                  </div>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                      size="xs"
                    >
                      {{ method.coverage === 'cities' ? $t('پیک / شهری') : $t('سراسری') }}
                    </UBadge>
                    <UBadge
                      v-if="method.slotsEnabled"
                      color="info"
                      variant="subtle"
                      size="xs"
                    >
                      {{ $t('بازه زمانی') }}
                    </UBadge>
                    <UBadge
                      v-if="method.expressEnabled"
                      color="warning"
                      variant="subtle"
                      size="xs"
                    >
                      {{ $t('ارسال سریع') }}
                    </UBadge>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm num font-medium">
                    {{ formatPrice(method.baseCost) }} {{ $t('تومان') }}
                  </span>
                  <UBadge
                    :color="method.status === 'active' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ method.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
                  </UBadge>
                </div>
              </div>
              <div
                v-if="canManage"
                class="mt-3 flex gap-2"
                @click.stop
              >
                <UButton
                  type="button"
                  color="primary"
                  variant="soft"
                  size="xs"
                  class="cursor-pointer"
                  @click="openMethod(method.id)"
                >
                  {{ $t('تنظیمات') }}
                </UButton>
                <UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  class="cursor-pointer"
                  @click="openDeleteMethod(method)"
                >
                  {{ $t('حذف') }}
                </UButton>
              </div>
            </button>
          </div>
        </template>

        <template #holidays>
          <div class="space-y-4">
            <p class="text-sm text-muted">
              {{ $t('تعطیلات تقویم ایران و تعطیل‌های دستی. جمعه به‌صورت پیش‌فرض تعطیل است.') }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end max-w-3xl">
              <TheIRDatePicker
                :model-value="holidayForm.date || null"
                type="date"
                :header="$t('تاریخ')"
                :placeholder="$t('انتخاب تاریخ')"
                @update:model-value="holidayForm.date = $event || ''"
              />
              <TheFormInput
                v-model="holidayForm.title"
                :label="$t('عنوان')"
                :placeholder="$t('مثلاً نوروز')"
              />
              <UButton
                v-if="canManage"
                type="button"
                color="primary"
                class="cursor-pointer h-11"
                :loading="savingHoliday"
                @click="addHoliday"
              >
                {{ $t('افزودن تعطیل') }}
              </UButton>
            </div>

            <div
              v-if="holidaysLoading"
              class="py-10 grid place-items-center"
            >
              <UIcon
                name="i-tabler-loader-2"
                class="size-6 text-primary animate-spin"
              />
            </div>
            <div
              v-else-if="!holidays.length"
              class="text-sm text-muted text-center py-8"
            >
              {{ $t('تعطیلی ثبت نشده') }}
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="row in holidays"
                :key="row.id"
                class="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-muted bg-muted/40 px-3 py-2"
              >
                <div class="text-sm">
                  <span class="font-medium text-highlighted num">{{ formatJalaliDate(row.date) }}</span>
                  <span class="text-muted"> · {{ row.title || '—' }}</span>
                  <UBadge
                    class="ms-2"
                    size="xs"
                    variant="subtle"
                    :color="row.source === 'iran' ? 'info' : 'neutral'"
                  >
                    {{ row.source === 'iran' ? $t('تقویم ایران') : $t('دستی') }}
                  </UBadge>
                </div>
                <UButton
                  v-if="canManage"
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  class="cursor-pointer"
                  @click="removeHoliday(row.id)"
                />
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <UModal
      v-model:open="createOpen"
      :title="$t('روش ارسال جدید')"
      :description="$t('روش ارسال دلخواه خود را برای فروشگاه تعریف کنید')"
    >
      <template #body>
        <div class="space-y-3">
          <TheFormInput
            v-model="createForm.name"
            :label="$t('نام')"
            required
            :error="createErrors.name"
            :placeholder="$t('مثلاً ارسال با پیک محلی')"
          />
          <TheFormInput
            v-model="createForm.carrier"
            :label="$t('شرکت حمل')"
            :placeholder="$t('مثلاً پیک اختصاصی')"
          />
          <TheFormInput
            v-model="createForm.estimatedDays"
            :label="$t('زمان تقریبی')"
            :placeholder="$t('مثلاً ۱–۳ روز')"
          />
          <TheFormInput
            v-model="createForm.baseCost"
            :label="$t('هزینه پایه (تومان)')"
            dir="ltr"
            thousand-sep
          />
          <UFormField :label="$t('پوشش جغرافیایی')">
            <USelect
              v-model="createForm.coverage"
              :items="coverageItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="createForm.status"
              :items="statusItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
        </div>
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
            {{ $t('ثبت روش ارسال') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف روش ارسال')"
      :description="$t('این روش از لیست ارسال حذف می‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="deleting"
            @click="confirmDeleteMethod"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import moment from 'jalali-moment'
import { formatPrice } from '~/data/products'
import type { SellerShippingMethod, ShippingCalendarHoliday } from '~/data/seller-returns-refunds'

function formatJalaliDate(isoDate: string) {
  if (!isoDate) return '—'
  const m = moment(isoDate, ['YYYY-MM-DD', moment.ISO_8601])
  return m.isValid() ? m.locale('fa').format('jYYYY/jMM/jDD') : isoDate
}

function toApiDate(value: string) {
  const m = moment(value)
  return m.isValid() ? m.format('YYYY-MM-DD') : value.trim().slice(0, 10)
}

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  shippingMethods,
  pending: methodsPending,
  fetchList,
  fetchMethod,
  createMethod,
  deleteMethod,
  fetchHolidays,
  upsertHoliday,
  deleteHoliday,
} = useSellerShipping()

const canManage = computed(() => can('shipping.manage'))
const hubTab = ref('methods')
const selectedMethodId = ref<string | null>(null)
const methodsLoading = ref(true)
const holidaysLoading = ref(false)
const holidays = ref<ShippingCalendarHoliday[]>([])
const savingHoliday = ref(false)
const holidayForm = ref({ date: '', title: '' })

const createOpen = ref(false)
const creating = ref(false)
const createErrors = ref<Partial<Record<'name', string>>>({})
const createForm = ref({
  name: '',
  carrier: '',
  estimatedDays: '',
  baseCost: '0',
  coverage: 'nationwide' as 'nationwide' | 'cities',
  status: 'active' as 'active' | 'inactive',
})

const deleteOpen = ref(false)
const deleting = ref(false)
const pendingDelete = ref<SellerShippingMethod | null>(null)

const selectedMethod = computed(() =>
  shippingMethods.value.find(m => m.id === selectedMethodId.value) ?? null,
)

const hubTabItems = computed(() => [
  { label: t('روش‌های ارسال'), value: 'methods', slot: 'methods' },
  { label: t('تعطیلات تقویم'), value: 'holidays', slot: 'holidays' },
])

const statusItems = computed(() => [
  { label: t('فعال'), value: 'active' },
  { label: t('غیرفعال'), value: 'inactive' },
])

const coverageItems = computed(() => [
  { label: t('سراسری (همه شهرها)'), value: 'nationwide' },
  { label: t('فقط شهرهای تعریف‌شده (پیک)'), value: 'cities' },
])

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function openCreate() {
  createForm.value = {
    name: '',
    carrier: '',
    estimatedDays: '',
    baseCost: '0',
    coverage: 'nationwide',
    status: 'active',
  }
  createErrors.value = {}
  createOpen.value = true
}

function openDeleteMethod(method: SellerShippingMethod) {
  pendingDelete.value = method
  deleteOpen.value = true
}

async function openMethod(id: string) {
  selectedMethodId.value = id
  const res = await fetchMethod(id)
  if (!res.ok) toast.error(t(res.error))
}

function onMethodUpdated(method: SellerShippingMethod) {
  if (selectedMethodId.value === method.id) {
    // list already updated via composable
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

async function loadHolidays() {
  holidaysLoading.value = true
  try {
    const res = await fetchHolidays()
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    holidays.value = res.items
  }
  finally {
    holidaysLoading.value = false
  }
}

async function addHoliday() {
  if (!holidayForm.value.date?.trim()) {
    toast.error(t('تاریخ الزامی است'))
    return
  }
  savingHoliday.value = true
  try {
    const res = await upsertHoliday({
      date: toApiDate(holidayForm.value.date),
      title: holidayForm.value.title.trim() || undefined,
    })
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    holidayForm.value = { date: '', title: '' }
    await loadHolidays()
    toast.success(t('تعطیل ثبت شد'))
  }
  finally {
    savingHoliday.value = false
  }
}

async function removeHoliday(id: number) {
  const res = await deleteHoliday(id)
  if (!res.ok) {
    toast.error(t(res.error))
    return
  }
  holidays.value = holidays.value.filter(h => h.id !== id)
  toast.success(t('حذف شد'))
}

async function submitCreate() {
  const name = createForm.value.name.trim()
  if (!name) {
    createErrors.value = { name: t('نام الزامی است') }
    return
  }
  createErrors.value = {}
  creating.value = true
  try {
    const result = await createMethod({
      name,
      carrier: createForm.value.carrier.trim(),
      estimatedDays: createForm.value.estimatedDays.trim(),
      baseCost: Number(String(createForm.value.baseCost).replace(/\D/g, '')) || 0,
      status: createForm.value.status,
      coverage: createForm.value.coverage,
      slotsEnabled: createForm.value.coverage === 'cities',
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    createOpen.value = false
    toast.success(t('روش ارسال اضافه شد'))
    if (result.method) selectedMethodId.value = result.method.id
  }
  finally {
    creating.value = false
  }
}

async function confirmDeleteMethod() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteMethod(pendingDelete.value.id)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    if (selectedMethodId.value === pendingDelete.value.id) selectedMethodId.value = null
    deleteOpen.value = false
    pendingDelete.value = null
    toast.success(t('روش ارسال حذف شد'))
  }
  finally {
    deleting.value = false
  }
}

watch(hubTab, (tab) => {
  if (tab === 'holidays' && !holidays.value.length) void loadHolidays()
})

onMounted(() => {
  void loadMethods()
})
</script>
