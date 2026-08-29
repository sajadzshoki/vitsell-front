<template>
  <div class="w-full max-w-sm sm:max-w-md">
    <!-- Brand -->
    <div class="mb-7 flex flex-col items-center text-center gap-3">
      <NuxtLink
        to="/"
        class="size-14 rounded-2xl bg-primary grid place-items-center text-inverted shadow-lg shadow-primary/20 transition hover:brightness-110"
        :aria-label="$t('دیجی‌شاپ')"
      >
        <UIcon name="i-tabler-shopping-bag" class="size-7" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-extrabold text-highlighted tracking-tight">
          {{ $t('دیجی‌شاپ') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ step === 'phone' ? $t('ورود یا ثبت‌نام') : $t('تأیید شماره موبایل') }}
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="rounded-3xl border border-muted bg-default p-6 sm:p-8 shadow-sm">
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
            
            :loading="loading"
            :disabled="!canSubmitPhone"
            trailing-icon="i-tabler-arrow-left"
          >
            {{ $t('دریافت کد') }}
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

        <!-- OTP step -->
        <form
          v-else
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
              @click="backToPhone"
            />
            <div class="flex-1 text-start min-w-0">
              <h2 class="text-base font-bold text-highlighted">
                {{ $t('کد تأیید را وارد کنید') }}
              </h2>
              <p class="mt-1.5 text-sm text-muted leading-relaxed">
                {{ $t('کد ارسال‌شده به') }}
                <span class="num text-highlighted font-medium" dir="ltr">{{ phone }}</span>
                {{ $t('را وارد کنید.') }}
              </p>
            </div>
          </div>

          <!-- dir on UPinInput (reka ConfigProvider); wrapper alone is not enough -->
          <div class="flex justify-center py-1" dir="ltr">
            <UPinInput
              v-model="otp"
              dir="ltr"
              otp
              :length="5"
              size="xl"
              placeholder="○"
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
            {{ $t('تأیید و ورود') }}
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
      </Transition>
    </div>

    <div class="mt-8 flex justify-center">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition"
      >
        <UIcon name="i-tabler-arrow-right" class="size-4" />
        {{ $t('بازگشت به فروشگاه') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const { isLoggedIn, login } = useShop()
const { requestOtp, verifyOtp } = useAuth()
const toast = useAppToast()

function redirectAfterLogin() {
  const raw = route.query.redirect
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return '/'
}
const { startTimer, clearTimer, isRunning, formattedTime } = useOtpTimer()

const step = ref<'phone' | 'otp'>('phone')
const phone = ref('')
const otp = ref<string[]>([])
const phoneError = ref('')
const otpError = ref('')
const loading = ref(false)
/** Shown when API returns OTP in development */
const devCode = ref<string | null>(null)

const canSubmitPhone = computed(() => /^09\d{9}$/.test(phone.value) && !loading.value)
const canSubmitOtp = computed(() => otp.value.filter(Boolean).length === 5 && !loading.value)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
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

async function submitPhone() {
  if (!/^09\d{9}$/.test(phone.value)) {
    phoneError.value = t('شماره موبایل معتبر نیست')
    return
  }

  loading.value = true
  phoneError.value = ''
  try {
    const { result, error } = await requestOtp(phone.value)
    if (error) {
      phoneError.value = apiErrorMessage(error, t('ارسال کد تأیید ناموفق بود'))
      toast.error(phoneError.value)
      return
    }
    step.value = 'otp'
    otp.value = []
    otpError.value = ''
    startTimer(120)
    notifyDevCode(result?.devCode, t('کد تأیید ارسال شد'))
  }
  finally {
    loading.value = false
  }
}

function backToPhone() {
  step.value = 'phone'
  otp.value = []
  otpError.value = ''
  devCode.value = null
  clearTimer()
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
  const code = otp.value.join('')
  if (code.length !== 5 || loading.value) return

  loading.value = true
  otpError.value = ''
  try {
    const { result, error } = await verifyOtp(phone.value, code)
    if (error || !result?.token) {
      otpError.value = apiErrorMessage(error, t('کد تأیید نادرست است'))
      toast.error(otpError.value)
      return
    }

    login(result.token, result.profile)
    clearTimer()
    toast.success(
      t('ورود موفق'),
      t('به دیجی‌شاپ خوش آمدید'),
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

onBeforeUnmount(() => {
  clearTimer()
})
</script>
