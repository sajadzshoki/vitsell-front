<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/discounts"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به تخفیف‌ها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش تخفیف') : $t('افزودن تخفیف') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('نوع، مقدار، محدودیت‌ها، بازه زمانی و هدف‌گیری را تنظیم کنید.') }}
          </p>
        </div>
        <UBadge
          :color="form.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          size="md"
          class="font-medium"
        >
          {{ form.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً sitewide-10')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />

        <TheFormInput
          v-model="form.name"
          :label="$t('نام')"
          required
          :error="errors.name"
          icon="i-tabler-tag"
        />

        <UFormField
          :label="$t('نوع تخفیف')"
          required
        >
          <USelect
            v-model="form.type"
            :items="typeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-model="form.value"
          :label="form.type === 'percent' ? $t('درصد') : $t('مبلغ (تومان)')"
          dir="ltr"
          :error="errors.value"
          required
          :icon="form.type === 'percent' ? 'i-tabler-percentage' : 'i-tabler-cash'"
        />

        <TheFormInput
          v-model="form.minOrder"
          :label="$t('حداقل سفارش (تومان)')"
          dir="ltr"
          icon="i-tabler-shopping-cart"
          :help="$t('۰ = بدون حداقل')"
        />

        <TheFormInput
          v-model="form.maxDiscount"
          :label="$t('سقف تخفیف (تومان)')"
          dir="ltr"
          icon="i-tabler-arrow-bar-up"
          :help="$t('خالی = بدون سقف')"
        />

        <TheIRDatePicker
          :model-value="form.startsAt || null"
          type="datetime"
          :header="$t('شروع')"
          :placeholder="$t('انتخاب تاریخ')"
          :validation="Boolean(errors.startsAt)"
          @update:model-value="form.startsAt = $event || ''"
        />

        <TheIRDatePicker
          :model-value="form.endsAt || null"
          type="datetime"
          :header="$t('پایان')"
          :placeholder="$t('انتخاب تاریخ')"
          :validation="Boolean(errors.endsAt)"
          @update:model-value="form.endsAt = $event || ''"
        />

        <TheFormInput
          v-model="form.usageLimit"
          :label="$t('سقف کل استفاده')"
          dir="ltr"
          icon="i-tabler-hash"
          :help="$t('خالی = نامحدود')"
        />

        <TheFormInput
          v-model="form.perCustomerLimit"
          :label="$t('سقف هر مشتری')"
          dir="ltr"
          icon="i-tabler-user"
          :help="$t('خالی = نامحدود')"
        />

        <TheFormInput
          v-model.number="form.priority"
          type="number"
          :label="$t('اولویت')"
          dir="ltr"
          icon="i-tabler-arrows-sort"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />

        <UFormField :label="$t('وضعیت')">
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField
        class="mt-4"
        :label="$t('توضیحات')"
      >
        <UTextarea
          v-model="form.description"
          :rows="3"
          autoresize
          class="w-full"
          :placeholder="$t('توضیح کوتاه درباره تخفیف')"
        />
      </UFormField>

      <div class="mt-6 pt-5 border-t border-muted">
        <TheSellerMarketingTargetingFields v-model="form.targeting" />
      </div>

      <div
        v-if="isEdit && initial"
        class="mt-4 flex flex-wrap gap-4 text-[11px] text-muted"
      >
        <span class="num">
          {{ $t('استفاده') }}: {{ initial.usageCount.toLocaleString('fa-IR') }}
        </span>
        <span
          class="num"
          dir="ltr"
        >
          {{ $t('ایجاد') }}: {{ initial.createdAt.slice(0, 19) }}
        </span>
      </div>
    </div>

    <TheSellerFormActions>
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت تخفیف') }}
      </UButton>
      <UButton
        to="/seller/discounts"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
      >
        {{ $t('انصراف') }}
      </UButton>
    </TheSellerFormActions>
  </div>
</template>

<script setup lang="ts">
import {
  discountIdPattern,
  emptyDiscountForm,
  toDiscountForm,
  type SellerDiscount,
  type SellerDiscountFormValues,
} from '~/data/seller-discounts'

const props = defineProps<{
  initial?: SellerDiscount | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createDiscount, updateDiscount } = useSellerDiscounts()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerDiscountFormValues>(
  props.initial ? toDiscountForm(props.initial) : emptyDiscountForm(),
)
const errors = ref<Partial<Record<'id' | 'name' | 'value' | 'startsAt' | 'endsAt', string>>>({})

const typeItems = computed(() => [
  { value: 'percent', label: t('درصدی') },
  { value: 'fixed', label: t('مبلغ ثابت') },
])

const statusItems = computed(() => [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
])

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toDiscountForm(value) : emptyDiscountForm()
    errors.value = {}
  },
)

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!discountIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  const value = Number(form.value.value)
  if (form.value.type === 'percent' && (value < 1 || value > 99)) {
    next.value = t('درصد باید بین ۱ تا ۹۹ باشد')
  }
  if (form.value.type === 'fixed' && (!(value > 0) || Number.isNaN(value))) {
    next.value = t('مبلغ تخفیف باید مثبت باشد')
  }
  if (form.value.startsAt && form.value.endsAt && form.value.endsAt <= form.value.startsAt) {
    next.endsAt = t('پایان باید بعد از شروع باشد')
  }
  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  saving.value = true
  try {
    const result = isEdit.value
      ? await updateDiscount(props.initial!.id, form.value)
      : await createDiscount(form.value)

    if (!result.ok) {
      toast.error(t(result.error))
      if (result.error.includes('تکراری') || result.error.includes('شناسه')) {
        errors.value = { ...errors.value, id: t(result.error) }
      }
      return
    }

    toast.success(isEdit.value ? t('تخفیف به‌روز شد') : t('تخفیف اضافه شد'))
    await router.push('/seller/discounts')
  }
  finally {
    saving.value = false
  }
}
</script>
