<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/promotions?tab=codes"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ isEdit ? $t('ویرایش کوپن') : $t('افزودن کوپن') }}
      </h2>
      <p class="text-xs text-muted mb-4 leading-6">
        {{ $t('کد تخفیف، نوع تخفیف، محدودیت‌ها و هدف‌گیری را تنظیم کنید.') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.code"
          :label="$t('کد')"
          :placeholder="$t('مثلاً WELCOME20')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.code"
          required
          icon="i-tabler-ticket"
          :help="$t('حروف بزرگ انگلیسی و عدد')"
          @update:model-value="form.code = String($event).toUpperCase()"
        />

        <TheFormInput
          v-model="form.name"
          :label="$t('نام')"
          :placeholder="$t('نام نمایشی کوپن')"
          icon="i-tabler-tag"
        />

        <UFormField
          class="md:col-span-2"
          :label="$t('توضیحات')"
        >
          <UTextarea
            v-model="form.description"
            :rows="2"
            autoresize
            class="w-full"
            :placeholder="$t('توضیح کوتاه برای تیم یا صفحه کوپن')"
          />
        </UFormField>

        <UFormField
          :label="$t('نوع تخفیف')"
          required
        >
          <USelect
            v-model="form.discountType"
            :items="discountTypeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-if="form.discountType === 'percent'"
          v-model="form.percent"
          :label="$t('درصد تخفیف')"
          placeholder="10"
          dir="ltr"
          digits-only
          maxlength="2"
          :error="errors.percent"
          required
          icon="i-tabler-percentage"
        />

        <TheFormInput
          v-else
          v-model="form.fixedAmount"
          :label="$t('مبلغ ثابت (تومان)')"
          placeholder="50000"
          dir="ltr"
          digits-only
          :error="errors.fixedAmount"
          required
          icon="i-tabler-cash"
        />

        <TheFormInput
          v-if="form.discountType === 'percent'"
          v-model="form.maxDiscount"
          :label="$t('سقف تخفیف (تومان)')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          digits-only
          icon="i-tabler-chart-arrows"
        />

        <TheFormInput
          v-model="form.minAmount"
          :label="$t('حداقل مبلغ سفارش (تومان)')"
          placeholder="0"
          dir="ltr"
          digits-only
          :error="errors.minAmount"
          required
          icon="i-tabler-cash"
          :help="$t('۰ یعنی بدون حداقل')"
        />

        <TheFormInput
          v-model="form.usageLimit"
          :label="$t('سقف کل استفاده')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          digits-only
          icon="i-tabler-hash"
        />

        <TheFormInput
          v-model="form.perCustomerLimit"
          :label="$t('سقف استفاده هر مشتری')"
          :placeholder="$t('مثلاً ۱')"
          dir="ltr"
          digits-only
          icon="i-tabler-user"
        />

        <TheFormInput
          v-model.number="form.priority"
          type="number"
          :label="$t('اولویت')"
          dir="ltr"
          icon="i-tabler-list-numbers"
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

        <div class="flex flex-col gap-3 justify-end pb-1 md:col-span-2">
          <UCheckbox
            v-model="form.oncePerUser"
            :label="$t('یک‌بار استفاده برای هر کاربر')"
          />
          <UCheckbox
            v-model="form.active"
            :label="$t('فعال')"
          />
        </div>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerMarketingTargetingFields
        :model-value="form.targeting"
        @update:model-value="form.targeting = $event"
      />
    </div>

    <TheSellerSeoFields
      :model-value="form.seo"
      :preview-title="form.name || form.code"
      :preview-description="form.description"
      :preview-url="form.code ? `/promo/${form.code}` : ''"
      @update:model-value="form.seo = $event"
    />

    <TheSellerFormActions>
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت کوپن') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
        to="/seller/promotions?tab=codes"
      >
        {{ $t('انصراف') }}
      </UButton>
    </TheSellerFormActions>
  </div>
</template>

<script setup lang="ts">
import {
  discountCodePattern,
  emptyDiscountCodeForm,
  toDiscountCodeForm,
  type SellerDiscountCode,
  type SellerDiscountCodeForm,
} from '~/data/seller-promotions'

const props = defineProps<{
  initial?: SellerDiscountCode | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createCode, updateCode } = useSellerPromotions()

const isEdit = computed(() => Boolean(props.initial?.code))
const saving = ref(false)
const form = ref<SellerDiscountCodeForm>(
  props.initial ? toDiscountCodeForm(props.initial) : emptyDiscountCodeForm(),
)
const errors = ref<Partial<Record<'code' | 'percent' | 'fixedAmount' | 'startsAt' | 'endsAt' | 'minAmount', string>>>({})

const discountTypeItems = [
  { label: t('درصدی'), value: 'percent' },
  { label: t('مبلغ ثابت'), value: 'fixed' },
]

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toDiscountCodeForm(value) : emptyDiscountCodeForm()
    errors.value = {}
  },
)

watch(
  () => form.value.perCustomerLimit,
  (value) => {
    if (Number(value) === 1) form.value.oncePerUser = true
  },
)

function validate() {
  const next: typeof errors.value = {}
  const code = form.value.code.trim().toUpperCase()
  const percent = Number(form.value.percent)
  const fixedAmount = Number(form.value.fixedAmount)
  const minAmount = Number(form.value.minAmount)

  if (!isEdit.value) {
    if (!code) next.code = t('کد الزامی است')
    else if (!discountCodePattern.test(code)) next.code = t('فرمت کد نامعتبر است')
  }
  if (form.value.discountType === 'percent') {
    if (!Number.isFinite(percent) || percent < 1 || percent > 99) {
      next.percent = t('درصد باید بین ۱ تا ۹۹ باشد')
    }
  }
  else if (!Number.isFinite(fixedAmount) || fixedAmount < 0) {
    next.fixedAmount = t('مبلغ ثابت نامعتبر است')
  }
  if (!Number.isFinite(minAmount) || minAmount < 0) {
    next.minAmount = t('حداقل مبلغ نامعتبر است')
  }
  if (
    form.value.startsAt
    && form.value.endsAt
    && new Date(form.value.endsAt).getTime() <= new Date(form.value.startsAt).getTime()
  ) {
    next.endsAt = t('زمان پایان باید بعد از شروع باشد')
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
      ? await updateCode(props.initial!.code, form.value)
      : await createCode(form.value)
    if (!result.ok) {
      toast.error(result.error)
      if (String(result.error).includes('وجود دارد')) {
        errors.value = { ...errors.value, code: result.error }
      }
      return
    }
    toast.success(isEdit.value ? t('کوپن به‌روز شد') : t('کوپن ثبت شد'))
    await router.push('/seller/promotions?tab=codes')
  }
  finally {
    saving.value = false
  }
}
</script>
