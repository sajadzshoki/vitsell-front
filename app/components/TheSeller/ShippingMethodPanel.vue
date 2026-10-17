<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h3 class="font-bold text-highlighted">
          {{ method.name }}
        </h3>
        <p class="text-xs text-muted mt-1">
          {{ method.carrier || '—' }} · {{ method.estimatedDays || '—' }}
        </p>
      </div>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-x"
        class="cursor-pointer"
        @click="emit('close')"
      >
        {{ $t('بستن') }}
      </UButton>
    </div>

    <UTabs
      v-model="activeTab"
      :items="tabItems"
      variant="pill"
      color="primary"
      size="sm"
      class="w-full"
      :ui="{
        list: 'bg-muted/60 p-1 rounded-xl w-full overflow-x-auto',
        trigger: 'shrink-0 font-medium',
        content: 'pt-4',
      }"
    >
      <template #base>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TheFormInput
            v-model="draft.name"
            :label="$t('نام')"
          />
          <TheFormInput
            v-model="draft.carrier"
            :label="$t('شرکت حمل')"
          />
          <TheFormInput
            v-model="draft.estimatedDays"
            :label="$t('زمان تقریبی')"
          />
          <TheFormInput
            :model-value="formatPriceInput(draft.baseCost)"
            :label="$t('هزینه پایه (تومان)')"
            dir="ltr"
            thousand-sep
            @update:model-value="draft.baseCost = Number(String($event ?? '').replace(/\D/g, '')) || 0"
          />
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="draft.status"
              :items="statusItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('پوشش جغرافیایی')">
            <USelect
              v-model="draft.coverage"
              :items="coverageItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('بازه زمانی ارسال')">
            <USwitch
              v-model="draft.slotsEnabled"
              :label="draft.slotsEnabled ? $t('فعال') : $t('غیرفعال')"
            />
          </UFormField>
          <div class="sm:col-span-2 flex justify-end">
            <UButton
              type="button"
              color="primary"
              class="cursor-pointer"
              :loading="savingBase"
              @click="saveBase"
            >
              {{ $t('ذخیره تنظیمات پایه') }}
            </UButton>
          </div>
        </div>
      </template>

      <template #cities>
        <div
          v-if="draft.coverage !== 'cities'"
          class="text-sm text-muted py-6 text-center"
        >
          {{ $t('پوشش این روش سراسری است؛ نیازی به تعریف شهر نیست.') }}
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <UFormField :label="$t('استان')">
              <USelectMenu
                v-model="cityForm.province"
                :items="provinceItems"
                class="w-full"
                :placeholder="$t('انتخاب استان')"
              />
            </UFormField>
            <UFormField :label="$t('شهر')">
              <USelectMenu
                v-model="cityForm.city"
                :items="cityItems"
                class="w-full"
                :placeholder="$t('انتخاب شهر')"
                :disabled="!cityForm.province"
              />
            </UFormField>
            <TheFormInput
              :model-value="formatPriceInput(cityForm.price)"
              :label="$t('قیمت (تومان)')"
              dir="ltr"
              thousand-sep
              @update:model-value="cityForm.price = Number(String($event ?? '').replace(/\D/g, '')) || 0"
            />
            <UButton
              type="button"
              color="primary"
              class="cursor-pointer h-11"
              :loading="savingCity"
              @click="addCity"
            >
              {{ $t('افزودن شهر') }}
            </UButton>
          </div>

          <div
            v-if="citiesLoading"
            class="py-8 grid place-items-center"
          >
            <UIcon
              name="i-tabler-loader-2"
              class="size-6 text-primary animate-spin"
            />
          </div>
          <div
            v-else-if="!cities.length"
            class="text-sm text-muted text-center py-6"
          >
            {{ $t('شهری تعریف نشده') }}
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="row in cities"
              :key="row.id"
              class="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-muted bg-muted/40 px-3 py-2"
            >
              <div class="text-sm">
                <span class="font-medium text-highlighted">{{ row.city }}</span>
                <span class="text-muted"> · {{ row.province }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm num">{{ formatPrice(row.price) }} {{ $t('تومان') }}</span>
                <UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  class="cursor-pointer"
                  @click="removeCity(row.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #slots>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="day in weekdayItems"
              :key="day.value"
              type="button"
              size="sm"
              class="cursor-pointer"
              :color="selectedWeekday === day.value ? 'primary' : 'neutral'"
              :variant="selectedWeekday === day.value ? 'solid' : 'soft'"
              @click="selectWeekday(day.value)"
            >
              {{ $t(day.label) }}
            </UButton>
          </div>

          <div class="space-y-3">
            <div
              v-for="(slot, idx) in slotDrafts"
              :key="idx"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end rounded-xl border border-muted p-3"
            >
              <TheFormInput
                v-model="slot.startTime"
                :label="$t('از ساعت')"
                dir="ltr"
                placeholder="09:00"
              />
              <TheFormInput
                v-model="slot.endTime"
                :label="$t('تا ساعت')"
                dir="ltr"
                placeholder="12:00"
              />
              <TheFormInput
                v-model.number="slot.capacity"
                :label="$t('ظرفیت (سفارش)')"
                dir="ltr"
                type="number"
              />
              <TheFormInput
                :model-value="slot.priceOverride == null ? '' : formatPriceInput(slot.priceOverride)"
                :label="$t('قیمت سفارشی')"
                dir="ltr"
                thousand-sep
                :placeholder="$t('پیش‌فرض روش')"
                @update:model-value="onSlotPrice(idx, $event)"
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                class="cursor-pointer h-11"
                icon="i-tabler-trash"
                @click="slotDrafts.splice(idx, 1)"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-tabler-plus"
              class="cursor-pointer"
              @click="slotDrafts.push(emptySlot())"
            >
              {{ $t('بازه جدید') }}
            </UButton>
            <UButton
              type="button"
              color="primary"
              class="cursor-pointer"
              :loading="savingSlots"
              @click="saveSlots"
            >
              {{ $t('ذخیره بازه‌های این روز') }}
            </UButton>
          </div>
        </div>
      </template>

      <template #holiday>
        <div class="space-y-4">
          <UFormField :label="$t('حالت روزهای تعطیل')">
            <USelect
              v-model="draft.holidayMode"
              :items="holidayModeItems"
              value-key="value"
              class="w-full max-w-md"
            />
          </UFormField>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            :loading="savingHolidayMode"
            @click="saveHolidayMode"
          >
            {{ $t('ذخیره حالت تعطیل') }}
          </UButton>

          <div
            v-if="draft.holidayMode === 'custom'"
            class="space-y-3 pt-2 border-t border-muted"
          >
            <p class="text-xs text-muted">
              {{ $t('بازه‌های اختصاصی برای روزهای تعطیل (شامل جمعه)') }}
            </p>
            <div
              v-for="(slot, idx) in holidaySlotDrafts"
              :key="idx"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end rounded-xl border border-muted p-3"
            >
              <TheFormInput
                v-model="slot.startTime"
                :label="$t('از ساعت')"
                dir="ltr"
                placeholder="09:00"
              />
              <TheFormInput
                v-model="slot.endTime"
                :label="$t('تا ساعت')"
                dir="ltr"
                placeholder="12:00"
              />
              <TheFormInput
                v-model.number="slot.capacity"
                :label="$t('ظرفیت (سفارش)')"
                dir="ltr"
                type="number"
              />
              <TheFormInput
                :model-value="slot.priceOverride == null ? '' : formatPriceInput(slot.priceOverride)"
                :label="$t('قیمت سفارشی')"
                dir="ltr"
                thousand-sep
                @update:model-value="onHolidaySlotPrice(idx, $event)"
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                class="cursor-pointer h-11"
                icon="i-tabler-trash"
                @click="holidaySlotDrafts.splice(idx, 1)"
              />
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                icon="i-tabler-plus"
                class="cursor-pointer"
                @click="holidaySlotDrafts.push(emptySlot())"
              >
                {{ $t('بازه جدید') }}
              </UButton>
              <UButton
                type="button"
                color="primary"
                class="cursor-pointer"
                :loading="savingHolidaySlots"
                @click="saveHolidaySlots"
              >
                {{ $t('ذخیره بازه‌های تعطیل') }}
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template #express>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <UFormField :label="$t('ارسال سریع')">
            <USwitch
              v-model="draft.expressEnabled"
              :label="draft.expressEnabled ? $t('فعال') : $t('غیرفعال')"
            />
          </UFormField>
          <TheFormInput
            v-model.number="draft.expressDeadlineHour"
            :label="$t('مهلت ثبت (ساعت)')"
            dir="ltr"
            type="number"
            :help="$t('اگر قبل از این ساعت سفارش دهد، ارسال همان روز ممکن است')"
          />
          <TheFormInput
            :model-value="formatPriceInput(draft.expressPrice)"
            :label="$t('قیمت ارسال سریع (تومان)')"
            dir="ltr"
            thousand-sep
            @update:model-value="draft.expressPrice = Number(String($event ?? '').replace(/\D/g, '')) || 0"
          />
          <div class="sm:col-span-2 flex justify-end">
            <UButton
              type="button"
              color="primary"
              class="cursor-pointer"
              :loading="savingExpress"
              @click="saveExpress"
            >
              {{ $t('ذخیره ارسال سریع') }}
            </UButton>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { formatPriceInput } from '~/data/seller-product-form'
import { getCitiesForProvince, getProvinceOptions } from '~/data/iran-locations'
import type {
  SellerShippingCity,
  SellerShippingMethod,
  SellerShippingSlot,
} from '~/data/seller-returns-refunds'

const props = defineProps<{
  method: SellerShippingMethod
}>()

const emit = defineEmits<{
  close: []
  updated: [method: SellerShippingMethod]
}>()

const { t } = useI18n()
const toast = useAppToast()
const {
  updateMethod,
  fetchCities,
  upsertCity,
  deleteCity,
  fetchWeekdaySlots,
  replaceWeekdaySlots,
  fetchHolidaySlots,
  replaceHolidaySlots,
} = useSellerShipping()

const activeTab = ref('base')
const savingBase = ref(false)
const savingCity = ref(false)
const savingSlots = ref(false)
const savingHolidayMode = ref(false)
const savingHolidaySlots = ref(false)
const savingExpress = ref(false)
const citiesLoading = ref(false)
const cities = ref<SellerShippingCity[]>([])
const selectedWeekday = ref(0)
const slotDrafts = ref<SellerShippingSlot[]>([])
const holidaySlotDrafts = ref<SellerShippingSlot[]>([])

const draft = reactive({
  name: props.method.name,
  carrier: props.method.carrier,
  estimatedDays: props.method.estimatedDays,
  baseCost: props.method.baseCost,
  status: props.method.status as 'active' | 'inactive',
  coverage: (props.method.coverage || 'nationwide') as 'nationwide' | 'cities',
  slotsEnabled: Boolean(props.method.slotsEnabled),
  holidayMode: (props.method.holidayMode || 'use_weekday') as 'use_weekday' | 'custom' | 'closed',
  expressEnabled: Boolean(props.method.expressEnabled),
  expressPrice: Number(props.method.expressPrice) || 0,
  expressDeadlineHour: Number(props.method.expressDeadlineHour) || 12,
})

const cityForm = reactive({
  province: '',
  city: '',
  price: props.method.baseCost || 0,
})

const tabItems = computed(() => [
  { label: t('پایه'), value: 'base', slot: 'base' },
  { label: t('شهرها'), value: 'cities', slot: 'cities' },
  { label: t('بازه‌ها'), value: 'slots', slot: 'slots' },
  { label: t('تعطیلات'), value: 'holiday', slot: 'holiday' },
  { label: t('ارسال سریع'), value: 'express', slot: 'express' },
])

const statusItems = computed(() => [
  { label: t('فعال'), value: 'active' },
  { label: t('غیرفعال'), value: 'inactive' },
])

const coverageItems = computed(() => [
  { label: t('سراسری (همه شهرها)'), value: 'nationwide' },
  { label: t('فقط شهرهای تعریف‌شده (پیک)'), value: 'cities' },
])

const holidayModeItems = computed(() => [
  { label: t('استفاده از بازه‌های همان روز هفته'), value: 'use_weekday' },
  { label: t('بازه‌های اختصاصی تعطیل'), value: 'custom' },
  { label: t('بسته در تعطیلات'), value: 'closed' },
])

const weekdayItems = [
  { value: 0, label: 'شنبه' },
  { value: 1, label: 'یکشنبه' },
  { value: 2, label: 'دوشنبه' },
  { value: 3, label: 'سه‌شنبه' },
  { value: 4, label: 'چهارشنبه' },
  { value: 5, label: 'پنجشنبه' },
]

const provinceItems = computed(() => getProvinceOptions(t))
const cityItems = computed(() => getCitiesForProvince(cityForm.province))

function emptySlot(): SellerShippingSlot {
  return { startTime: '09:00', endTime: '12:00', capacity: 20, priceOverride: null }
}

function onSlotPrice(idx: number, value: string | number) {
  const raw = String(value ?? '').replace(/\D/g, '')
  slotDrafts.value[idx]!.priceOverride = raw ? Number(raw) : null
}

function onHolidaySlotPrice(idx: number, value: string | number) {
  const raw = String(value ?? '').replace(/\D/g, '')
  holidaySlotDrafts.value[idx]!.priceOverride = raw ? Number(raw) : null
}

async function loadCities() {
  citiesLoading.value = true
  try {
    const res = await fetchCities(props.method.id)
    if (res.ok) cities.value = res.items
  }
  finally {
    citiesLoading.value = false
  }
}

async function selectWeekday(weekday: number) {
  selectedWeekday.value = weekday
  const res = await fetchWeekdaySlots(props.method.id)
  if (!res.ok) {
    toast.error(t(res.error))
    return
  }
  const rows = res.items.filter(s => s.weekday === weekday)
  slotDrafts.value = rows.length
    ? rows.map(s => ({ ...s }))
    : [emptySlot()]
}

async function loadHolidaySlots() {
  const res = await fetchHolidaySlots(props.method.id)
  if (!res.ok) return
  holidaySlotDrafts.value = res.items.length ? res.items.map(s => ({ ...s })) : [emptySlot()]
}

async function saveBase() {
  savingBase.value = true
  try {
    const res = await updateMethod(props.method.id, {
      name: draft.name.trim(),
      carrier: draft.carrier.trim(),
      estimatedDays: draft.estimatedDays.trim(),
      baseCost: draft.baseCost,
      status: draft.status,
      coverage: draft.coverage,
      slotsEnabled: draft.slotsEnabled,
    })
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    emit('updated', res.method)
    toast.success(t('ذخیره شد'))
  }
  finally {
    savingBase.value = false
  }
}

async function addCity() {
  if (!cityForm.province || !cityForm.city) {
    toast.error(t('استان و شهر را انتخاب کنید'))
    return
  }
  savingCity.value = true
  try {
    const res = await upsertCity(props.method.id, {
      province: cityForm.province,
      city: cityForm.city,
      price: cityForm.price,
      active: true,
    })
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    await loadCities()
    toast.success(t('شهر ذخیره شد'))
  }
  finally {
    savingCity.value = false
  }
}

async function removeCity(id: number) {
  const res = await deleteCity(props.method.id, id)
  if (!res.ok) {
    toast.error(t(res.error))
    return
  }
  cities.value = cities.value.filter(c => c.id !== id)
  toast.success(t('حذف شد'))
}

async function saveSlots() {
  savingSlots.value = true
  try {
    const res = await replaceWeekdaySlots(props.method.id, selectedWeekday.value, slotDrafts.value)
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    toast.success(t('بازه‌ها ذخیره شد'))
  }
  finally {
    savingSlots.value = false
  }
}

async function saveHolidayMode() {
  savingHolidayMode.value = true
  try {
    const res = await updateMethod(props.method.id, { holidayMode: draft.holidayMode })
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    emit('updated', res.method)
    toast.success(t('ذخیره شد'))
  }
  finally {
    savingHolidayMode.value = false
  }
}

async function saveHolidaySlots() {
  savingHolidaySlots.value = true
  try {
    const res = await replaceHolidaySlots(props.method.id, holidaySlotDrafts.value)
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    toast.success(t('بازه‌های تعطیل ذخیره شد'))
  }
  finally {
    savingHolidaySlots.value = false
  }
}

async function saveExpress() {
  savingExpress.value = true
  try {
    const res = await updateMethod(props.method.id, {
      expressEnabled: draft.expressEnabled,
      expressPrice: draft.expressPrice,
      expressDeadlineHour: draft.expressDeadlineHour,
    })
    if (!res.ok) {
      toast.error(t(res.error))
      return
    }
    emit('updated', res.method)
    toast.success(t('ذخیره شد'))
  }
  finally {
    savingExpress.value = false
  }
}

watch(
  () => props.method.id,
  async () => {
    Object.assign(draft, {
      name: props.method.name,
      carrier: props.method.carrier,
      estimatedDays: props.method.estimatedDays,
      baseCost: props.method.baseCost,
      status: props.method.status,
      coverage: props.method.coverage || 'nationwide',
      slotsEnabled: Boolean(props.method.slotsEnabled),
      holidayMode: props.method.holidayMode || 'use_weekday',
      expressEnabled: Boolean(props.method.expressEnabled),
      expressPrice: Number(props.method.expressPrice) || 0,
      expressDeadlineHour: Number(props.method.expressDeadlineHour) || 12,
    })
    cityForm.price = props.method.baseCost || 0
    await Promise.all([loadCities(), selectWeekday(0), loadHolidaySlots()])
  },
  { immediate: true },
)

watch(
  () => cityForm.province,
  () => {
    cityForm.city = ''
  },
)
</script>
