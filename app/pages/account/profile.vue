<template>
  <div class="flex flex-col gap-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="hidden lg:block font-bold text-highlighted mb-5">
        {{ $t('اطلاعات حساب کاربری') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.firstName"
          :label="$t('نام')"
        />
        <TheFormInput
          v-model="form.lastName"
          :label="$t('نام خانوادگی')"
        />
        <TheFormInput
          v-model="form.email"
          :label="$t('ایمیل')"
          type="email"
          dir="ltr"
        />
        <TheFormInput
          v-model="form.phone"
          :label="$t('شماره موبایل')"
          dir="ltr"
          digits-only
          maxlength="11"
          disabled
        />

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-default">{{ $t('تاریخ تولد') }}</label>
          <TheIRDatePicker
            v-model="birthIso"
            :placeholder="$t('انتخاب تاریخ تولد')"
            with-max
          />
        </div>

        <UFormField :label="$t('جنسیت')">
          <USelect
            v-model="form.gender"
            :items="genderItems"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="mt-6 flex items-center gap-3 flex-wrap">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold"
          :loading="saving"
          :disabled="loading"
          @click="onSave"
        >
          {{ saved ? $t('ذخیره شد') : $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          :disabled="saving || loading"
          @click="onCancel"
        >
          {{ $t('انصراف') }}
        </UButton>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ profile.hasPassword ? $t('تغییر رمز عبور') : $t('تنظیم رمز عبور') }}
      </h2>
      <p class="text-sm text-muted mb-5 leading-relaxed">
        {{
          profile.hasPassword
            ? $t('با تنظیم رمز می‌توانید بدون کد تأیید وارد شوید.')
            : $t('رمز عبور بگذارید تا بتوانید با شماره موبایل و رمز وارد شوید.')
        }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-if="profile.hasPassword"
          v-model="passwordForm.currentPassword"
          :label="$t('رمز عبور فعلی')"
          name="currentPassword"
          :error="passwordErrors.currentPassword"
          :type="showCurrentPassword ? 'text' : 'password'"
          autocomplete="current-password"
          dir="ltr"
          icon="i-tabler-lock"
          class="md:col-span-2"
          @update:model-value="passwordErrors.currentPassword = ''"
        />
        <TheFormInput
          v-model="passwordForm.password"
          :label="$t('رمز عبور جدید')"
          name="password"
          :error="passwordErrors.password"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="new-password"
          dir="ltr"
          icon="i-tabler-lock"
          :help="$t('حداقل ۸ کاراکتر')"
          @update:model-value="passwordErrors.password = ''"
        />
        <TheFormInput
          v-model="passwordForm.passwordConfirmation"
          :label="$t('تکرار رمز عبور')"
          name="passwordConfirmation"
          :error="passwordErrors.passwordConfirmation"
          :type="showNewPassword ? 'text' : 'password'"
          autocomplete="new-password"
          dir="ltr"
          icon="i-tabler-lock-check"
          @update:model-value="passwordErrors.passwordConfirmation = ''"
        />
      </div>

      <div class="mt-4 flex items-center gap-3 flex-wrap">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold"
          :loading="savingPassword"
          :disabled="loading"
          @click="onSavePassword"
        >
          {{ profile.hasPassword ? $t('به‌روزرسانی رمز') : $t('ذخیره رمز عبور') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="showNewPassword = !showNewPassword; showCurrentPassword = !showCurrentPassword"
        >
          {{ showNewPassword ? $t('مخفی کردن رمز') : $t('نمایش رمز') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'jalali-moment'
import type { AccountProfile } from '~/data/account'

const { t } = useI18n()
const toast = useAppToast()
const { profile, fetchProfile, updateProfile, setPassword } = useAccount()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const savingPassword = ref(false)
const form = ref<AccountProfile>({ ...profile.value })
const birthIso = ref<string | null>(parseBirthToIso(profile.value.birth))

const passwordForm = ref({
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
})
const passwordErrors = ref({
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const genderItems = ['مرد', 'زن']

watch(birthIso, (value) => {
  if (!value) {
    form.value.birth = ''
    return
  }
  const formatted = moment(value).locale('fa').format('jYYYY/jMM/jDD')
  if (form.value.birth !== formatted) {
    form.value.birth = formatted
  }
})

watch(
  profile,
  (value) => {
    form.value = { ...value }
    const nextIso = parseBirthToIso(value.birth)
    if (birthIso.value !== nextIso) {
      birthIso.value = nextIso
    }
  },
  { deep: true },
)

function faToEnDigits(value: string) {
  return value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
}

function parseBirthToIso(birth: string): string | null {
  if (!birth?.trim()) return null
  const normalized = faToEnDigits(birth.trim())
  const parsed = moment.from(normalized, 'fa', 'jYYYY/jMM/jDD')
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm:ssZ') : null
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

function fieldError(error: any, field: string) {
  const item = error?.data?.errors?.find((e: any) => e.field === field)
  return item?.message || ''
}

function syncFormFromProfile() {
  form.value = { ...profile.value }
  birthIso.value = parseBirthToIso(profile.value.birth)
}

function resetPasswordForm() {
  passwordForm.value = {
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  }
  passwordErrors.value = {
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  }
}

async function loadProfile() {
  loading.value = true
  try {
    const { error } = await fetchProfile()
    if (error) {
      toast.error(apiErrorMessage(error, t('بارگذاری اطلاعات ناموفق بود')))
      return
    }
    syncFormFromProfile()
  }
  finally {
    loading.value = false
  }
}

async function onSave() {
  saving.value = true
  saved.value = false
  try {
    const { result, error } = await updateProfile({ ...form.value })
    if (error || !result) {
      toast.error(apiErrorMessage(error, t('ذخیره اطلاعات ناموفق بود')))
      return
    }
    syncFormFromProfile()
    saved.value = true
    toast.success(t('اطلاعات ذخیره شد'))
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }
  finally {
    saving.value = false
  }
}

function onCancel() {
  syncFormFromProfile()
}

async function onSavePassword() {
  passwordErrors.value = {
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  }

  if (profile.value.hasPassword && !passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = t('رمز عبور فعلی را وارد کنید')
    return
  }
  if (passwordForm.value.password.length < 8) {
    passwordErrors.value.password = t('رمز عبور باید حداقل ۸ کاراکتر باشد')
    return
  }
  if (passwordForm.value.password !== passwordForm.value.passwordConfirmation) {
    passwordErrors.value.passwordConfirmation = t('تکرار رمز عبور مطابقت ندارد')
    return
  }

  savingPassword.value = true
  try {
    const { result, error } = await setPassword({
      password: passwordForm.value.password,
      passwordConfirmation: passwordForm.value.passwordConfirmation,
      ...(profile.value.hasPassword
        ? { currentPassword: passwordForm.value.currentPassword }
        : {}),
    })
    if (error || !result) {
      passwordErrors.value.currentPassword = fieldError(error, 'currentPassword')
      passwordErrors.value.password = fieldError(error, 'password')
      passwordErrors.value.passwordConfirmation = fieldError(error, 'passwordConfirmation')
      toast.error(apiErrorMessage(error, t('ذخیره رمز عبور ناموفق بود')))
      return
    }
    resetPasswordForm()
    toast.success(result.message || t('رمز عبور ذخیره شد'))
  }
  finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  loadProfile()
})

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('اطلاعات حساب'),
})
</script>
