<template>
  <div>
    <h2 class="font-bold text-highlighted mb-5">
      {{ $t('انتخاب روش ارسال') }}
    </h2>

    <div
      v-if="!shippingOptions.length"
      class="rounded-2xl border border-muted bg-muted/40 p-4 text-sm text-muted"
    >
      {{ $t('برای شهر انتخاب‌شده روش ارسالی در دسترس نیست.') }}
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <button
        v-for="option in shippingOptions"
        :key="option.id"
        type="button"
        class="w-full flex items-center gap-4 p-4 rounded-2xl border text-start cursor-pointer transition"
        :class="shippingMethod === option.id
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-accented'"
        @click="onSelectMethod(option.id)"
      >
        <span
          class="size-4 rounded-full border-2 shrink-0 grid place-items-center"
          :class="shippingMethod === option.id ? 'border-primary' : 'border-accented'"
        >
          <span
            v-if="shippingMethod === option.id"
            class="size-2 rounded-full bg-primary"
          />
        </span>
        <span class="size-11 rounded-xl bg-muted grid place-items-center shrink-0">
          <UIcon
            :name="`i-tabler-${option.icon}`"
            class="size-6 text-primary"
          />
        </span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-default">
            {{ $t(option.name) }}
          </div>
          <div
            v-if="option.desc"
            class="text-xs text-muted mt-0.5"
          >
            {{ $t(option.desc) }}
          </div>
        </div>
        <div class="text-sm font-bold num shrink-0">
          <span
            v-if="option.price === 0"
            class="text-success"
          >{{ $t('رایگان') }}</span>
          <span v-else>{{ formatPrice(option.price) }} {{ $t('تومان') }}</span>
        </div>
      </button>
    </div>

    <div
      v-if="selectedNeedsSlots"
      class="mt-6 space-y-4"
    >
      <div
        v-if="expressAvailable"
        class="rounded-2xl border border-warning/30 bg-warning/5 p-4"
      >
        <label class="flex items-start gap-3 cursor-pointer">
          <UCheckbox
            :model-value="shippingIsExpress"
            @update:model-value="onToggleExpress(Boolean($event))"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-highlighted">
              {{ $t('ارسال سریع (همان روز)') }}
            </div>
            <div class="text-xs text-muted mt-0.5">
              {{ $t('فقط اگر همه کالاهای سبد ارسال سریع داشته باشند و قبل از ساعت') }}
              <span class="num"> {{ expressDeadlineHour }} </span>
              {{ $t('ثبت شود.') }}
            </div>
          </div>
          <div class="text-sm font-bold num shrink-0">
            {{ formatPrice(expressPrice) }} {{ $t('تومان') }}
          </div>
        </label>
      </div>

      <div>
        <h3 class="text-sm font-bold text-highlighted mb-3">
          {{ $t('روز ارسال') }}
        </h3>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="day in visibleDays"
            :key="day.date"
            type="button"
            class="shrink-0 min-w-22 px-3 py-2.5 rounded-xl border text-center cursor-pointer transition"
            :class="shippingSlotDate === day.date
              ? 'border-primary bg-primary/5'
              : day.isClosed
                ? 'border-muted opacity-40 cursor-not-allowed'
                : 'border-muted hover:border-accented'"
            :disabled="day.isClosed || (!day.hasSelectable && !day.slots.some(s => s.full))"
            @click="onSelectDay(day.date)"
          >
            <div class="text-xs text-muted">
              {{ $t(day.label) }}
            </div>
            <div class="text-sm font-bold num mt-0.5">
              {{ formatDayLabel(day.date) }}
            </div>
            <div
              v-if="day.isHoliday"
              class="text-[10px] text-warning mt-1"
            >
              {{ $t('تعطیل') }}
            </div>
          </button>
        </div>
      </div>

      <div v-if="shippingSlotDate">
        <h3 class="text-sm font-bold text-highlighted mb-3">
          {{ $t('بازه زمانی') }}
        </h3>
        <div
          v-if="availabilityLoading"
          class="py-6 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="space-y-2"
        >
          <button
            v-for="slot in selectedDaySlots"
            :key="`${slot.startTime}-${slot.endTime}`"
            type="button"
            class="w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-start transition"
            :class="slot.selectable
              ? (isSelectedSlot(slot)
                ? 'border-primary bg-primary/5 cursor-pointer'
                : 'border-muted hover:border-accented cursor-pointer')
              : 'border-muted opacity-60 cursor-not-allowed'"
            :disabled="!slot.selectable"
            @click="onSelectSlot(slot)"
          >
            <div>
              <div class="text-sm font-medium num" dir="ltr">
                {{ slot.startTime }} – {{ slot.endTime }}
              </div>
              <div
                v-if="slot.full"
                class="text-xs text-error mt-0.5"
              >
                {{ $t('تکمیل شده') }}
              </div>
              <div
                v-else-if="!slot.selectable"
                class="text-xs text-muted mt-0.5"
              >
                {{ $t('غیرقابل انتخاب') }}
              </div>
            </div>
            <div
              v-if="!shippingIsExpress"
              class="text-sm font-bold num shrink-0"
            >
              {{ formatPrice(slot.price) }} {{ $t('تومان') }}
            </div>
          </button>
          <p
            v-if="!selectedDaySlots.length"
            class="text-sm text-muted"
          >
            {{ $t('بازه‌ای برای این روز تعریف نشده است.') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import type { CheckoutAvailabilitySlot } from '~/data/checkout'

const store = useCheckoutStore()
const {
  shippingMethod,
  shippingOptions,
  shippingSlotDate,
  shippingSlotStart,
  shippingSlotEnd,
  shippingIsExpress,
  availabilityDays,
  availabilityLoading,
  expressAvailable,
  expressPrice,
  expressDeadlineHour,
} = storeToRefs(store)

const selectedNeedsSlots = computed(() => {
  const opt = shippingOptions.value.find(o => o.id === shippingMethod.value)
  return Boolean(opt?.slotsEnabled)
})

const visibleDays = computed(() =>
  availabilityDays.value.filter(d => !d.isClosed || d.slots.some(s => s.full)),
)

const selectedDaySlots = computed(() => {
  const day = availabilityDays.value.find(d => d.date === shippingSlotDate.value)
  // Show selectable + full (تکمیل شده) — hide past non-full non-selectable without being full? Spec: hide full from selection but show as تکمیل شده. So show selectable OR full.
  return (day?.slots || []).filter(s => s.selectable || s.full)
})

function formatDayLabel(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${iso}T12:00:00`))
  }
  catch {
    return iso
  }
}

function isSelectedSlot(slot: CheckoutAvailabilitySlot) {
  return shippingSlotStart.value === slot.startTime && shippingSlotEnd.value === slot.endTime
}

function onSelectMethod(id: string) {
  void store.selectShippingMethod(id)
}

function onSelectDay(date: string) {
  void store.selectShippingDay(date)
}

function onSelectSlot(slot: CheckoutAvailabilitySlot) {
  if (!slot.selectable) return
  store.selectShippingSlot(slot.startTime, slot.endTime)
}

function onToggleExpress(value: boolean) {
  void store.setShippingExpress(value)
}

onMounted(() => {
  void store.fetchShippingMethods()
})
</script>
