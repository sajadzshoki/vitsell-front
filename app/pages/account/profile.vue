<template>
  <TheSkeleton
    v-if="loading"
    variant="form"
  />

  <div
    v-else
    class="flex flex-col gap-5"
  >
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
        <div class="flex flex-col gap-2">
          <TheFormInput
            v-model="phoneDraft"
            :label="$t('شماره موبایل')"
            name="phone"
            :error="phoneError"
            dir="ltr"
            digits-only
            type="tel"
            inputmode="numeric"
            maxlength="11"
            icon="i-tabler-device-mobile"
            :help="phoneHelp"
            @update:model-value="onPhoneDraft"
          />
          <UButton
            v-if="phoneDirty && phoneStep === 'edit'"
            type="button"
            color="primary"
            variant="soft"
            size="md"
            block
            class="font-bold"
            :loading="sendingPhoneOtp"
            :disabled="!phoneValid || sendingPhoneOtp"
            @click="sendPhoneOtp"
          >
            {{ $t('ارسال کد تأیید') }}
          </UButton>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-default">{{ $t('تاریخ تولد') }}</label>
          <TheIRDatePicker
            v-model="birthIso"
            :placeholder="$t('انتخاب تاریخ تولد')"
            with-max
          />
        </div>

        <UFormField :label="$t('جنسیت')">
          <URadioGroup
            v-model="form.gender"
            :items="genderItems"
            orientation="horizontal"
            variant="table"
            indicator="hidden"
            size="md"
            class="w-full"
            :ui="{
              item: 'flex-1 justify-center cursor-pointer',
            }"
          />
        </UFormField>
      </div>

      <div
        v-if="phoneStep === 'otp'"
        class="mt-5 flex flex-col gap-4 rounded-xl border border-muted bg-muted p-4"
      >
        <div class="text-start">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('کد تأیید را وارد کنید') }}
          </h3>
          <p class="mt-1.5 text-sm text-muted leading-relaxed">
            {{ $t('کد ارسال‌شده به') }}
            <span class="num text-highlighted font-medium" dir="ltr">{{ phoneDraft }}</span>
            {{ $t('را وارد کنید.') }}
          </p>
        </div>

        <div class="flex justify-center py-1" dir="ltr">
          <UPinInput
            v-model="otp"
            dir="ltr"
            otp
            :length="5"
            size="lg"
            placeholder=""
            autofocus
            :color="otpError ? 'error' : 'primary'"
            :highlight="!!otpError"
            :ui="{
              root: 'flex-row',
              base: 'size-11 text-center',
            }"
            @complete="confirmPhoneChange"
          />
        </div>

        <UAlert
          v-if="devCode"
          color="warning"
          variant="subtle"
          :title="$t('کد توسعه')"
          :description="devCode"
          class="text-center"
          :ui="{ description: 'num text-lg font-bold tracking-widest text-highlighted', title: 'text-xs' }"
          dir="ltr"
        />

        <p v-if="otpError" class="text-sm text-error text-center">
          {{ otpError }}
        </p>

        <div class="flex items-center gap-3 flex-wrap">
          <UButton
            type="button"
            color="primary"
            size="lg"
            class="font-bold"
            :loading="confirmingPhone"
            :disabled="!canConfirmPhone"
            @click="confirmPhoneChange"
          >
            {{ $t('تأیید شماره') }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="lg"
            :disabled="confirmingPhone || sendingPhoneOtp"
            @click="cancelPhoneChange"
          >
            {{ $t('انصراف') }}
          </UButton>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <template v-if="phoneResendLeft > 0">
            <span class="text-muted">{{ $t('ارسال مجدد تا') }}</span>
            <span class="num font-medium text-highlighted" dir="ltr">{{ phoneResendLabel }}</span>
          </template>
          <UButton
            v-else
            type="button"
            color="primary"
            variant="link"
            size="sm"
            :loading="sendingPhoneOtp"
            @click="sendPhoneOtp"
          >
            {{ $t('ارسال مجدد کد') }}
          </UButton>
        </div>
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
const { profile, fetchProfile, updateProfile, setPassword, requestPhoneOtp, confirmPhone } = useAccount()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const savingPassword = ref(false)
const form = ref<AccountProfile>({ ...profile.value })
const birthIso = ref<string | null>(parseBirthToIso(profile.value.birth))
const phoneDraft = ref(profile.value.phone)
const phoneStep = ref<'edit' | 'otp'>('edit')
const phoneError = ref('')
const otp = ref<string[]>([])
const otpError = ref('')
const devCode = ref<string | null>(null)
const sendingPhoneOtp = ref(false)
const confirmingPhone = ref(false)
const phoneResendLeft = ref(0)
let phoneTimer: ReturnType<typeof setInterval> | null = null

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

const genderItems = computed(() => [
  { label: t('مرد'), value: 'مرد', icon: 'i-tabler-man' },
  { label: t('زن'), value: 'زن', icon: 'i-tabler-woman' },
])

const phoneValid = computed(() => /^09\d{9}$/.test(phoneDraft.value))
const phoneDirty = computed(() => phoneDraft.value !== profile.value.phone)
const otpCode = computed(() => p2e(otp.value.join('')).replace(/\D/g, ''))
const canConfirmPhone = computed(() => otpCode.value.length === 5 && !confirmingPhone.value)
const phoneResendLabel = computed(() => {
  const minutes = Math.floor(phoneResendLeft.value / 60).toString().padStart(2, '0')
  const seconds = (phoneResendLeft.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})
const phoneHelp = computed(() => {
  if (phoneStep.value === 'otp') return undefined
  if (phoneDirty.value) return t('کد تأیید به این شماره ارسال می‌شود.')
  return t('تغییر شماره پس از تأیید کد پیامکی اعمال می‌شود.')
})

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
  phoneDraft.value = profile.value.phone
  phoneError.value = ''
  resetPhoneFlow()
}

function stopPhoneTimer() {
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneTimer = null
  }
}

function startPhoneTimer(seconds: number) {
  stopPhoneTimer()
  phoneResendLeft.value = seconds
  phoneTimer = setInterval(() => {
    if (phoneResendLeft.value > 0) phoneResendLeft.value -= 1
    else stopPhoneTimer()
  }, 1000)
}

function resetPhoneFlow() {
  phoneStep.value = 'edit'
  otp.value = []
  otpError.value = ''
  devCode.value = null
  phoneResendLeft.value = 0
  stopPhoneTimer()
}

function onPhoneDraft() {
  phoneError.value = ''
  if (phoneStep.value === 'otp') resetPhoneFlow()
}

watch(otp, (cells) => {
  let changed = false
  const next = cells.map((cell) => {
    if (!cell) return cell
    const digit = p2e(String(cell)).replace(/\D/g, '').slice(-1)
    if (digit !== cell) changed = true
    return digit
  })
  if (changed) otp.value = next
  if (otpError.value) otpError.value = ''
}, { deep: true })

async function sendPhoneOtp() {
  phoneError.value = ''
  if (!phoneValid.value) {
    phoneError.value = t('شماره موبایل معتبر نیست')
    return
  }
  if (!phoneDirty.value) return

  sendingPhoneOtp.value = true
  try {
    const { result, error } = await requestPhoneOtp(phoneDraft.value)
    if (error || !result) {
      phoneError.value = fieldError(error, 'phone') || apiErrorMessage(error, t('ارسال کد تأیید ناموفق بود'))
      toast.error(phoneError.value)
      return
    }
    phoneStep.value = 'otp'
    otp.value = []
    otpError.value = ''
    devCode.value = result.devCode || null
    startPhoneTimer(result.expiresIn || 120)
    if (result.devCode) {
      toast.success(`${t('کد توسعه')}: ${result.devCode}`, t('کد تأیید ارسال شد'))
    }
    else {
      toast.success(t('کد تأیید ارسال شد'))
    }
  }
  finally {
    sendingPhoneOtp.value = false
  }
}

async function confirmPhoneChange() {
  if (otpCode.value.length !== 5 || confirmingPhone.value) return
  confirmingPhone.value = true
  otpError.value = ''
  const snapshot = { ...form.value }
  const birth = birthIso.value
  try {
    const { result, error } = await confirmPhone(phoneDraft.value, otpCode.value)
    if (error || !result) {
      otpError.value = fieldError(error, 'code')
      phoneError.value = fieldError(error, 'phone')
      toast.error(apiErrorMessage(error, t('تغییر شماره ناموفق بود')))
      return
    }
    form.value = { ...snapshot, phone: result.phone }
    birthIso.value = birth
    phoneDraft.value = result.phone
    phoneError.value = ''
    resetPhoneFlow()
    toast.success(t('شماره موبایل به‌روز شد'))
  }
  finally {
    confirmingPhone.value = false
  }
}

function cancelPhoneChange() {
  phoneDraft.value = profile.value.phone
  phoneError.value = ''
  resetPhoneFlow()
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
  if (phoneDraft.value !== profile.value.phone) {
    phoneError.value = phoneValid.value
      ? t('برای تغییر شماره، ابتدا کد تأیید را وارد کنید')
      : t('شماره موبایل معتبر نیست')
    return
  }

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

onUnmounted(() => {
  stopPhoneTimer()
})

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('اطلاعات حساب'),
})
</script>
