<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/couriers"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به پیک‌ها') }}
      </UButton>
    </div>

    <TheSellerForbidden
      v-if="!canUpdate"
      :message="$t('برای مدیریت پیک‌ها مجوز به‌روزرسانی سفارش لازم است')"
    />

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
    >
      <h1 class="text-lg font-bold text-highlighted mb-5">
        {{ isEdit ? $t('ویرایش پیک') : $t('افزودن پیک') }}
      </h1>

      <form
        class="space-y-4 max-w-md"
        @submit.prevent="submit"
      >
        <TheFormInput
          v-model="name"
          :label="$t('نام')"
          :placeholder="$t('نام پیک')"
          required
          :error="errors.name"
        />
        <TheFormInput
          v-model="phone"
          :label="$t('شماره موبایل')"
          placeholder="09121234567"
          dir="ltr"
          digits-only
          maxlength="11"
          inputmode="tel"
          required
          :error="errors.phone"
        />
        <p
          v-if="formError"
          class="text-sm text-error"
        >
          {{ formError }}
        </p>
        <div class="flex items-center gap-2">
          <UButton
            type="submit"
            color="primary"
            class="cursor-pointer"
            :loading="saving"
          >
            {{ $t('ذخیره') }}
          </UButton>
          <UButton
            to="/seller/couriers"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
          >
            {{ $t('انصراف') }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  courierId?: string
}>()

const { can } = useSellerPermissions()
const canUpdate = computed(() => can('orders.update'))
const { fetchCourier, createCourier, updateCourier } = useSellerCouriers()
const toast = useAppToast()
const { t } = useI18n()

const isEdit = computed(() => Boolean(props.courierId))
const name = ref('')
const phone = ref('')
const saving = ref(false)
const formError = ref('')
const errors = reactive({ name: '', phone: '' })

function validate() {
  errors.name = name.value.trim().length < 2 ? t('نام را وارد کنید') : ''
  errors.phone = /^09\d{9}$/.test(phone.value.trim()) ? '' : t('شماره موبایل معتبر نیست')
  return !errors.name && !errors.phone
}

async function submit() {
  formError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    const payload = { name: name.value.trim(), phone: phone.value.trim() }
    const result = isEdit.value
      ? await updateCourier(Number(props.courierId), payload)
      : await createCourier(payload)
    if (!result.ok) {
      formError.value = result.message
      return
    }
    toast.success(isEdit.value ? t('پیک ویرایش شد') : t('پیک ثبت شد'))
    await navigateTo('/seller/couriers')
  }
  finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!canUpdate.value || !props.courierId) return
  const result = await fetchCourier(Number(props.courierId))
  if (!result.ok || !result.courier) {
    formError.value = result.message
    return
  }
  name.value = result.courier.name
  phone.value = result.courier.phone
})
</script>
