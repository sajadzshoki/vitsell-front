<template>
  <div class="w-full max-w-sm sm:max-w-md">
    <!-- Brand -->
    <div class="mb-7 flex flex-col items-center text-center gap-3">
      <NuxtLink
        to="/"
        class="size-20 rounded-2xl overflow-hidden grid place-items-center  shadow-primary/20 transition-all hover:brightness-110"
        :aria-label="$t('ویتسل')"
      >
        <img
          :src="VITSELL_LOGO_SRC"
          :alt="$t('ویتسل')"
          class="size-full object-contain "
        >
      </NuxtLink>
      <div>
        <!-- <h1 class="text-2xl font-extrabold text-highlighted tracking-tight">
          {{ $t('ویتسل') }}
        </h1> -->
        <p class=" text-sm text-muted">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="rounded-3xl border border-muted bg-default p-4 sm:p-8 shadow-sm">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <!-- Phone step -->
        <form
          v-if="step === 'phone'"
          key="phone"
          class="flex flex-col gap-5"
          @submit.prevent="submitPhone"
        >
          <div class="text-start">
            <h2 class="text-base font-bold text-highlighted">
              {{ $t('خوش آمدید') }}
            </h2>
            <p class="mt-1.5 text-sm text-muted leading-relaxed">
              {{ $t('برای ادامه، شماره موبایل خود را وارد کنید.') }}
            </p>
          </div>

          <TheFormInput
            v-model="phone"
            :label="$t('شماره موبایل')"
            name="phone"
            :error="phoneError"
            required
            digits-only
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            :maxlength="11"
            dir="ltr"
            icon="i-tabler-device-mobile"
            :placeholder="$t('۰۹۱۲۳۴۵۶۷۸۹')"
            @update:model-value="phoneError = ''"
          />

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="!canSubmitPhone"
            trailing-icon="i-tabler-arrow-left"
          >
            {{ $t('ادامه') }}
          </UButton>

          <p class="text-xs text-dimmed text-center leading-relaxed">
            {{ $t('ورود شما به معنای پذیرش') }}
            <NuxtLink to="/terms" class="!text-primary hover:underline">
              {{ $t('شرایط استفاده') }}
            </NuxtLink>
            {{ $t('و') }}
            <NuxtLink to="/privacy" class="!text-primary hover:underline">
              {{ $t('حریم خصوصی') }}
            </NuxtLink>
            {{ $t('است.') }}
          </p>
        </form>

        <!-- Password step -->
        <form
          v-else-if="step === 'password'"
          key="password"
          class="flex flex-col gap-5"
          @submit.prevent="submitPasswordLogin"
        >
          <div class="flex items-start gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-tabler-arrow-right"
              :aria-label="$t('بازگشت')"
              @click="backToPhone"
            />
            <div class="flex-1 text-start min-w-0">
              <h2 class="text-base font-bold text-highlighted">
                {{ $t('ورود با رمز عبور') }}
              </h2>
              <p class="mt-1.5 text-sm text-muted leading-relaxed">
                {{ $t('رمز عبور حساب') }}
                <span class="num text-highlighted font-medium" dir="ltr">{{ phone }}</span>
                {{ $t('را وارد کنید.') }}
              </p>
            </div>
          </div>

          <TheFormInput
            v-model="password"
            :label="$t('رمز عبور')"
            name="password"
            :error="passwordError"
            required
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            dir="ltr"
            icon="i-tabler-lock"
            :placeholder="$t('رمز عبور')"
            @update:model-value="passwordError = ''"
          />

          <div
            v-if="!isAdminApp"
            class="flex items-center justify-between gap-2 -mt-3"
          >
            <UButton
              type="button"
              color="neutral"
              variant="link"
              size="xs"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? $t('مخفی کردن رمز') : $t('نمایش رمز') }}
            </UButton>
            <UButton
              type="button"
              color="primary"
              variant="link"
              size="xs"
              :loading="loading"
              @click="startForgotPassword"
            >
              {{ $t('فراموشی رمز عبور') }}
            </UButton>
          </div>
          <div
            v-else
            class="flex justify-end -mt-3"
          >
            <UButton
              type="button"
              color="neutral"
              variant="link"
              size="xs"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? $t('مخفی کردن رمز') : $t('نمایش رمز') }}
            </UButton>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="!canSubmitPassword"
          >
            {{ $t('ورود') }}
          </UButton>

          <UButton
            v-if="!isAdminApp"
            type="button"
            color="primary"
            variant="link"
            size="sm"
            class="justify-center"
            :loading="loading"
            @click="loginWithOtpInstead"
          >
            {{ $t('ورود با کد تأیید') }}
          </UButton>
        </form>

        <!-- OTP step -->
        <form
          v-else-if="step === 'otp'"
          key="otp"
          class="flex flex-col gap-5"
          @submit.prevent="submitOtp"
        >
          <div class="flex items-start gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-tabler-arrow-right"
              :aria-label="$t('بازگشت')"
              @click="backFromOtp"
            />
            <div class="flex-1 text-start min-w-0">
              <h2 class="text-base font-bold text-highlighted">
                {{ otpPurpose === 'reset' ? $t('بازیابی رمز عبور') : $t('کد تأیید را وارد کنید') }}
              </h2>
              <p class="mt-1.5 text-sm text-muted leading-relaxed">
                {{ $t('کد ارسال‌شده به') }}
                <span class="num text-highlighted font-medium" dir="ltr">{{ phone }}</span>
                {{ $t('را وارد کنید.') }}
              </p>
            </div>
          </div>

          <div class="flex justify-center py-1" dir="ltr">
            <UPinInput
              v-model="otp"
              dir="ltr"
              otp
              :length="5"
              size="xl"
              placeholder=""
              autofocus
              :color="otpError ? 'error' : 'primary'"
              :highlight="!!otpError"
              :ui="{
                root: 'flex-row',
                base: 'size-11 sm:size-12 text-center',
              }"
              @complete="onOtpComplete"
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

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="!canSubmitOtp"
          >
            {{ otpPurpose === 'reset' ? $t('ادامه') : $t('تأیید و ورود') }}
          </UButton>

          <div class="flex items-center justify-center gap-2 text-sm">
            <template v-if="isRunning">
              <span class="text-muted">{{ $t('ارسال مجدد تا') }}</span>
              <span class="num font-medium text-highlighted" dir="ltr">{{ formattedTime }}</span>
            </template>
            <UButton
              v-else
              type="button"
              color="primary"
              variant="link"
              size="sm"
              :loading="loading"
              @click="resendOtp"
            >
              {{ $t('ارسال مجدد کد') }}
            </UButton>
          </div>
        </form>

        <!-- Reset password step -->
        <form
          v-else
          key="reset"
          class="flex flex-col gap-5"
          @submit.prevent="submitResetPassword"
        >
          <div class="flex items-start gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-tabler-arrow-right"
              :aria-label="$t('بازگشت')"
              @click="backFromReset"
            />
            <div class="flex-1 text-start min-w-0">
              <h2 class="text-base font-bold text-highlighted">
                {{ $t('رمز عبور جدید') }}
              </h2>
              <p class="mt-1.5 text-sm text-muted leading-relaxed">
                {{ $t('یک رمز عبور جدید برای حساب خود انتخاب کنید.') }}
              </p>
            </div>
          </div>

          <TheFormInput
            v-model="newPassword"
            :label="$t('رمز عبور جدید')"
            name="newPassword"
            :error="newPasswordError"
            required
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            dir="ltr"
            icon="i-tabler-lock"
            :help="$t('حداقل ۸ کاراکتر')"
            :placeholder="$t('رمز عبور جدید')"
            @update:model-value="newPasswordError = ''"
          />

          <TheFormInput
            v-model="newPasswordConfirmation"
            :label="$t('تکرار رمز عبور')"
            name="newPasswordConfirmation"
            :error="newPasswordConfirmationError"
            required
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            dir="ltr"
            icon="i-tabler-lock-check"
            :placeholder="$t('تکرار رمز عبور')"
            @update:model-value="newPasswordConfirmationError = ''"
          />

          <UButton
            type="button"
            color="neutral"
            variant="link"
            size="xs"
            class="self-start -mt-3"
            @click="showNewPassword = !showNewPassword"
          >
            {{ showNewPassword ? $t('مخفی کردن رمز') : $t('نمایش رمز') }}
          </UButton>

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            :disabled="!canSubmitReset"
          >
            {{ $t('ثبت رمز و ورود') }}
          </UButton>
        </form>
      </Transition>
    </div>

    <div class="mt-8 flex flex-col items-center gap-3">
      <a
        v-if="isAdminApp && storeUrl"
        :href="storeUrl"
        class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-all  cursor-pointer"
      >
        <UIcon name="i-tabler-arrow-right" class="size-4" />
        {{ $t('بازگشت به فروشگاه') }}
      </a>
      <template v-else-if="!isAdminApp">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-all  cursor-pointer"
        >
          <UIcon name="i-tabler-arrow-right" class="size-4" />
          {{ $t('بازگشت به فروشگاه') }}
        </NuxtLink>
   
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VITSELL_LOGO_SRC } from '~/data/brand'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const { isAdminApp, storeUrl, adminUrl } = useAppMode()
const { isLoggedIn, login } = useShop()
const { checkPhone, requestOtp, verifyOtp, loginWithPassword, resetPassword } = useAuth()
const toast = useAppToast()

function redirectAfterLogin() {
  const raw = route.query.redirect
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    if (isAdminApp && !raw.startsWith('/seller') && raw !== '/login') {
      return '/seller'
    }
    return raw
  }
  return isAdminApp ? '/seller' : '/'
}
const { startTimer, clearTimer, isRunning, formattedTime } = useOtpTimer()

const step = ref<'phone' | 'password' | 'otp' | 'reset'>('phone')
const otpPurpose = ref<'login' | 'reset'>('login')
/** Remembers whether user came to OTP from password step (for back navigation) */
const cameFromPassword = ref(false)
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const otp = ref<string[]>([])
const resetOtpCode = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const showNewPassword = ref(false)
const phoneError = ref('')
const passwordError = ref('')
const otpError = ref('')
const newPasswordError = ref('')
const newPasswordConfirmationError = ref('')
const loading = ref(false)
/** Shown when API returns OTP in development */
const devCode = ref<string | null>(null)

const subtitle = computed(() => {
  if (isAdminApp) {
    if (step.value === 'password') return t('ورود مدیر سایت')
    return t('پنل مدیریت ویتسل')
  }
  if (step.value === 'password') return t('ورود با رمز عبور')
  if (step.value === 'otp' && otpPurpose.value === 'reset') return t('بازیابی رمز عبور')
  if (step.value === 'otp') return t('تأیید شماره موبایل')
  if (step.value === 'reset') return t('تنظیم رمز جدید')
  return t('ورود یا ثبت‌نام')
})

const canSubmitPhone = computed(() => /^09\d{9}$/.test(phone.value) && !loading.value)
/** OTP as ASCII digits (Persian/Arabic numerals → English) for API */
const otpCode = computed(() => p2e(otp.value.join('')).replace(/\D/g, ''))
const canSubmitOtp = computed(() => otpCode.value.length === 5 && !loading.value)
const canSubmitPassword = computed(
  () => password.value.length >= 1 && !loading.value,
)
const canSubmitReset = computed(
  () =>
    newPassword.value.length >= 8
    && newPasswordConfirmation.value.length >= 8
    && !loading.value,
)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

function fieldError(error: any, field: string) {
  const item = error?.data?.errors?.find((e: any) => e.field === field)
  return item?.message || ''
}

function notifyDevCode(code: string | undefined, fallbackTitle: string) {
  if (code) {
    devCode.value = code
    toast.success(`${t('کد توسعه')}: ${code}`, fallbackTitle)
  }
  else {
    devCode.value = null
    toast.success(fallbackTitle, t('کد را وارد کنید'))
  }
}

if (import.meta.client && isLoggedIn.value) {
  navigateTo(redirectAfterLogin())
}

watch(isLoggedIn, (v) => {
  if (v) navigateTo(redirectAfterLogin())
})

watch(otp, (cells) => {
  let changed = false
  const next = cells.map((c) => {
    if (!c) return c
    const digit = p2e(String(c)).replace(/\D/g, '').slice(-1)
    if (digit !== c) changed = true
    return digit
  })
  if (changed) otp.value = next
}, { deep: true })

async function sendOtpAndGo(options?: {
  fromPassword?: boolean
  purpose?: 'login' | 'reset'
}) {
  const purpose = options?.purpose ?? 'login'
  const { result, error } = await requestOtp(phone.value)
  if (error) {
    const message = apiErrorMessage(error, t('ارسال کد تأیید ناموفق بود'))
    if (options?.fromPassword) {
      passwordError.value = message
    }
    else {
      phoneError.value = message
    }
    toast.error(message)
    return false
  }

  otpPurpose.value = purpose
  cameFromPassword.value = !!options?.fromPassword
  step.value = 'otp'
  otp.value = []
  otpError.value = ''
  resetOtpCode.value = ''
  password.value = ''
  passwordError.value = ''
  startTimer(120)
  notifyDevCode(
    result?.devCode,
    purpose === 'reset' ? t('کد بازیابی ارسال شد') : t('کد تأیید ارسال شد'),
  )
  return true
}

async function submitPhone() {
  if (!/^09\d{9}$/.test(phone.value)) {
    phoneError.value = t('شماره موبایل معتبر نیست')
    return
  }

  loading.value = true
  phoneError.value = ''
  try {
    const { result, error } = await checkPhone(phone.value)
    if (error) {
      phoneError.value = apiErrorMessage(error, t('بررسی شماره ناموفق بود'))
      toast.error(phoneError.value)
      return
    }

    if (isAdminApp) {
      if (!result?.isAdmin) {
        phoneError.value = t('این شماره دسترسی مدیر ندارد')
        toast.error(phoneError.value)
        return
      }
      if (!result.hasPassword) {
        phoneError.value = t('برای این حساب ابتدا رمز عبور تنظیم کنید')
        toast.error(phoneError.value)
        return
      }
      step.value = 'password'
      password.value = ''
      passwordError.value = ''
      showPassword.value = false
      return
    }

    if (result?.isAdmin) {
      phoneError.value = adminUrl
        ? t('حساب مدیر است؛ از پنل ادمین وارد شوید')
        : t('حساب مدیر از فروشگاه قابل ورود نیست')
      toast.error(phoneError.value)
      return
    }

    if (result?.hasPassword) {
      step.value = 'password'
      password.value = ''
      passwordError.value = ''
      showPassword.value = false
      return
    }

    await sendOtpAndGo({ purpose: 'login' })
  }
  finally {
    loading.value = false
  }
}

function backToPhone() {
  step.value = 'phone'
  password.value = ''
  passwordError.value = ''
  otp.value = []
  otpError.value = ''
  resetOtpCode.value = ''
  newPassword.value = ''
  newPasswordConfirmation.value = ''
  newPasswordError.value = ''
  newPasswordConfirmationError.value = ''
  devCode.value = null
  cameFromPassword.value = false
  otpPurpose.value = 'login'
  clearTimer()
}

function backFromOtp() {
  clearTimer()
  otp.value = []
  otpError.value = ''
  devCode.value = null
  resetOtpCode.value = ''
  if (cameFromPassword.value || otpPurpose.value === 'reset') {
    step.value = 'password'
    cameFromPassword.value = false
    otpPurpose.value = 'login'
    return
  }
  backToPhone()
}

function backFromReset() {
  step.value = 'otp'
  newPassword.value = ''
  newPasswordConfirmation.value = ''
  newPasswordError.value = ''
  newPasswordConfirmationError.value = ''
  otp.value = resetOtpCode.value ? resetOtpCode.value.split('') : []
}

async function loginWithOtpInstead() {
  loading.value = true
  passwordError.value = ''
  try {
    await sendOtpAndGo({ fromPassword: true, purpose: 'login' })
  }
  finally {
    loading.value = false
  }
}

async function startForgotPassword() {
  loading.value = true
  passwordError.value = ''
  try {
    await sendOtpAndGo({ fromPassword: true, purpose: 'reset' })
  }
  finally {
    loading.value = false
  }
}

async function resendOtp() {
  loading.value = true
  otpError.value = ''
  otp.value = []
  try {
    const { result, error } = await requestOtp(phone.value)
    if (error) {
      otpError.value = apiErrorMessage(error, t('ارسال مجدد ناموفق بود'))
      toast.error(otpError.value)
      return
    }
    startTimer(120)
    notifyDevCode(result?.devCode, t('کد جدید ارسال شد'))
  }
  finally {
    loading.value = false
  }
}

function onOtpComplete(value: string[]) {
  otp.value = value
  submitOtp()
}

async function submitOtp() {
  const code = otpCode.value
  if (code.length !== 5 || loading.value) return

  if (otpPurpose.value === 'reset') {
    resetOtpCode.value = code
    clearTimer()
    step.value = 'reset'
    newPassword.value = ''
    newPasswordConfirmation.value = ''
    newPasswordError.value = ''
    newPasswordConfirmationError.value = ''
    showNewPassword.value = false
    return
  }

  loading.value = true
  otpError.value = ''
  try {
    const { result, error } = await verifyOtp(phone.value, code)
    if (error || !result?.token) {
      otpError.value = apiErrorMessage(error, t('کد تأیید نادرست است'))
      toast.error(otpError.value)
      return
    }

    await login(result.token, result.profile)
    clearTimer()
    toast.success(
      t('ورود موفق'),
      t('به ویتسل خوش آمدید'),
      'i-tabler-check',
    )
    await navigateTo(redirectAfterLogin())
  }
  catch {
    otpError.value = t('کد تأیید نادرست است')
    toast.error(t('کد تأیید نادرست است'))
  }
  finally {
    loading.value = false
  }
}

async function submitPasswordLogin() {
  if (!password.value) {
    passwordError.value = t('رمز عبور را وارد کنید')
    return
  }

  loading.value = true
  passwordError.value = ''
  try {
    const { result, error } = await loginWithPassword(phone.value, password.value)
    if (error || !result?.token) {
      passwordError.value = apiErrorMessage(error, t('رمز عبور نادرست است'))
      toast.error(passwordError.value)
      return
    }

    await login(result.token, result.profile)
    toast.success(
      t('ورود موفق'),
      t('به ویتسل خوش آمدید'),
      'i-tabler-check',
    )
    await navigateTo(redirectAfterLogin())
  }
  catch {
    passwordError.value = t('رمز عبور نادرست است')
    toast.error(passwordError.value)
  }
  finally {
    loading.value = false
  }
}

async function submitResetPassword() {
  newPasswordError.value = ''
  newPasswordConfirmationError.value = ''

  if (newPassword.value.length < 8) {
    newPasswordError.value = t('رمز عبور باید حداقل ۸ کاراکتر باشد')
    return
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    newPasswordConfirmationError.value = t('تکرار رمز عبور مطابقت ندارد')
    return
  }
  if (!resetOtpCode.value || resetOtpCode.value.length !== 5) {
    toast.error(t('کد تأیید نامعتبر است. دوباره تلاش کنید.'))
    step.value = 'password'
    return
  }

  loading.value = true
  try {
    const { result, error } = await resetPassword({
      phone: phone.value,
      code: resetOtpCode.value,
      password: newPassword.value,
      passwordConfirmation: newPasswordConfirmation.value,
    })

    if (error || !result?.token) {
      const codeMsg = fieldError(error, 'code')
      if (codeMsg) {
        otpError.value = codeMsg
        toast.error(codeMsg)
        step.value = 'otp'
        otpPurpose.value = 'reset'
        otp.value = []
        resetOtpCode.value = ''
        return
      }
      newPasswordError.value = fieldError(error, 'password')
      newPasswordConfirmationError.value = fieldError(error, 'passwordConfirmation')
      toast.error(apiErrorMessage(error, t('تغییر رمز عبور ناموفق بود')))
      return
    }

    await login(result.token, result.profile)
    toast.success(
      result.message || t('رمز عبور تغییر کرد'),
      t('با رمز جدید وارد شدید'),
      'i-tabler-check',
    )
    await navigateTo(redirectAfterLogin())
  }
  finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>
