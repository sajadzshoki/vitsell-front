<template>
  <div class="min-h-dvh flex items-center px-4 py-10">
    <div class="w-full max-w-[480px] mx-auto bg-default border border-muted rounded-2xl p-5 space-y-5">
      <div class="text-center space-y-1">
        <h1 class="text-xl font-bold text-highlighted">
          {{ $t('ورود پیک') }}
        </h1>
        <p class="text-sm text-muted">
          {{ step === 'phone' ? $t('شماره موبایل خود را وارد کنید') : $t('کد تأیید پیامک‌شده را وارد کنید') }}
        </p>
      </div>

      <form
        v-if="step === 'phone'"
        class="space-y-4"
        @submit.prevent="sendCode"
      >
        <UFormField :error="phoneError || undefined">
          <UInput
            v-model="phone"
            type="tel"
            inputmode="numeric"
            maxlength="11"
            dir="ltr"
            size="xl"
            placeholder="09121234567"
            class="w-full"
            :ui="{ base: 'min-h-11 num' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          class="cursor-pointer min-h-11"
          :loading="pending"
        >
          {{ $t('دریافت کد') }}
        </UButton>
      </form>

      <form
        v-else
        class="space-y-4"
        @submit.prevent="verify"
      >
        <UAlert
          v-if="devCode"
          color="warning"
          variant="subtle"
          :title="$t('کد توسعه')"
          :description="devCode"
          class="text-center"
          :ui="{ description: 'num text-lg font-bold tracking-widest text-highlighted' }"
          dir="ltr"
        />
        <UFormField :error="codeError || undefined">
          <UInput
            v-model="code"
            inputmode="numeric"
            maxlength="5"
            dir="ltr"
            size="xl"
            :placeholder="$t('کد تأیید')"
            class="w-full"
            :ui="{ base: 'min-h-11 text-center num tracking-widest' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="xl"
          block
          class="cursor-pointer min-h-11"
          :loading="pending"
        >
          {{ $t('ورود') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          block
          class="cursor-pointer min-h-11"
          @click="step = 'phone'; codeError = ''"
        >
          {{ $t('تغییر شماره') }}
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { requestOtp, verifyOtp } = useAuth()
const { login, isLoggedIn } = useShop()
const { profile, profileLoaded, fetchProfile } = useAccount()

const step = ref<'phone' | 'code'>('phone')
const phone = ref('')
const code = ref('')
const devCode = ref('')
const phoneError = ref('')
const codeError = ref('')
const pending = ref(false)

function apiMessage(error: { data?: { errors?: { message?: string }[], message?: string } } | null | undefined, fallback: string) {
  return error?.data?.errors?.map(item => item.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
}

function nextPath() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect.startsWith('/courier') && !redirect.startsWith('/courier/login')) return redirect
  return '/courier'
}

async function sendCode() {
  phoneError.value = ''
  codeError.value = ''
  if (!/^09\d{9}$/.test(phone.value.trim())) {
    phoneError.value = 'شماره موبایل معتبر نیست'
    return
  }
  pending.value = true
  try {
    const { result, error } = await requestOtp(phone.value.trim())
    if (error || !result) {
      phoneError.value = apiMessage(error, 'ارسال کد ناموفق بود')
      return
    }
    devCode.value = result.devCode || ''
    code.value = ''
    step.value = 'code'
  }
  finally {
    pending.value = false
  }
}

async function verify() {
  codeError.value = ''
  if (!/^\d{5}$/.test(code.value.trim())) {
    codeError.value = 'کد تأیید نادرست است'
    return
  }
  pending.value = true
  try {
    const { result, error } = await verifyOtp(phone.value.trim(), code.value.trim(), 'courier')
    if (error || !result?.token || !(result.profile?.isCourier || result.profile?.role === 'courier')) {
      codeError.value = apiMessage(error, 'ورود به پنل پیک مجاز نیست.')
      return
    }
    await login(result.token, result.profile)
    await navigateTo(nextPath())
  }
  finally {
    pending.value = false
  }
}

onMounted(async () => {
  if (!isLoggedIn.value) return
  if (!profileLoaded.value || !profile.value.role) await fetchProfile()
  if (profile.value.isCourier || profile.value.role === 'courier') {
    await navigateTo('/courier')
  }
})
</script>
