<template>
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
        <div
          class="inline-flex w-full sm:w-auto rounded-xl bg-muted p-1 gap-1"
          role="group"
          :aria-label="$t('جنسیت')"
        >
          <UButton
            v-for="item in genderItems"
            :key="item"
            type="button"
            size="md"
            class="flex-1 sm:min-w-24 font-medium cursor-pointer"
            :color="form.gender === item ? 'primary' : 'neutral'"
            :variant="form.gender === item ? 'solid' : 'ghost'"
            @click="form.gender = item"
          >
            {{ $t(item) }}
          </UButton>
        </div>
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
</template>

<script setup lang="ts">
import moment from 'jalali-moment'
import type { AccountProfile } from '~/data/account'

const { t } = useI18n()
const toast = useAppToast()
const { profile, fetchProfile, updateProfile } = useAccount()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const form = ref<AccountProfile>({ ...profile.value })
const birthIso = ref<string | null>(parseBirthToIso(profile.value.birth))

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

function syncFormFromProfile() {
  form.value = { ...profile.value }
  birthIso.value = parseBirthToIso(profile.value.birth)
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
