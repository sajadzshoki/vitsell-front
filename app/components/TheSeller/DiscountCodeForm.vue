<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/promotions?tab=codes"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-4">
        {{ isEdit ? $t('ویرایش کد تخفیف') : $t('افزودن کد تخفیف') }}
      </h2>

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
          v-model="form.startsAt"
          :label="$t('شروع')"
          type="datetime-local"
          dir="ltr"
          :error="errors.startsAt"
          required
          icon="i-tabler-calendar-event"
        />
        <TheFormInput
          v-model="form.endsAt"
          :label="$t('پایان')"
          type="datetime-local"
          dir="ltr"
          :error="errors.endsAt"
          required
          icon="i-tabler-calendar-due"
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
        <div class="flex flex-col gap-3 justify-end pb-1">
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

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت کد') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        to="/seller/promotions?tab=codes"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
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
const errors = ref<Partial<Record<'code' | 'percent' | 'startsAt' | 'endsAt' | 'minAmount', string>>>({})

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toDiscountCodeForm(value) : emptyDiscountCodeForm()
    errors.value = {}
  },
)

function validate() {
  const next: typeof errors.value = {}
  const code = form.value.code.trim().toUpperCase()
  const percent = Number(form.value.percent)
  const minAmount = Number(form.value.minAmount)

  if (!isEdit.value) {
    if (!code) next.code = t('کد الزامی است')
    else if (!discountCodePattern.test(code)) next.code = t('فرمت کد نامعتبر است')
  }
  if (!Number.isFinite(percent) || percent < 1 || percent > 99) {
    next.percent = t('درصد باید بین ۱ تا ۹۹ باشد')
  }
  if (!form.value.startsAt.trim()) next.startsAt = t('زمان شروع الزامی است')
  if (!form.value.endsAt.trim()) next.endsAt = t('زمان پایان الزامی است')
  if (
    form.value.startsAt
    && form.value.endsAt
    && new Date(form.value.endsAt).getTime() <= new Date(form.value.startsAt).getTime()
  ) {
    next.endsAt = t('زمان پایان باید بعد از شروع باشد')
  }
  if (!Number.isFinite(minAmount) || minAmount < 0) {
    next.minAmount = t('حداقل مبلغ نامعتبر است')
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
      ? updateCode(props.initial!.code, form.value)
      : createCode(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(isEdit.value ? t('کد به‌روز شد') : t('کد ثبت شد'))
    await router.push('/seller/promotions?tab=codes')
  }
  finally {
    saving.value = false
  }
}
</script>
