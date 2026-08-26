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
      />

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-default">{{ $t('تاریخ تولد') }}</label>
        <TheIRDatePicker
          v-model="birthIso"
          :header="undefined"
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
        @click="onSave"
      >
        {{ saved ? $t('ذخیره شد') : $t('ذخیره تغییرات') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
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
const { profile } = useAccount()

const saved = ref(false)
const form = ref<AccountProfile>({ ...profile.value })
const birthIso = ref<string | null>(parseBirthToIso(profile.value.birth))

const genderItems = ['مرد', 'زن']

watch(birthIso, (value) => {
  if (!value) return
  form.value.birth = moment(value).locale('fa').format('jYYYY/jMM/jDD')
})

function faToEnDigits(value: string) {
  return value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
}

function parseBirthToIso(birth: string): string | null {
  if (!birth?.trim()) return null
  const normalized = faToEnDigits(birth.trim())
  const parsed = moment.from(normalized, 'fa', 'jYYYY/jMM/jDD')
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm:ssZ') : null
}

function onSave() {
  profile.value = { ...form.value }
  saved.value = true
  toast.success(t('اطلاعات ذخیره شد'))
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function onCancel() {
  form.value = { ...profile.value }
  birthIso.value = parseBirthToIso(profile.value.birth)
}

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('اطلاعات حساب'),
})
</script>
