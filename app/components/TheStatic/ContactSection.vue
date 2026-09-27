<template>
  <section class="bg-default border border-muted rounded-2xl p-5 md:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-muted transition"
          :class="item.href ? 'hover:(border-primary/30 bg-primary/5)' : ''"
        >
          <component
            :is="item.href ? 'a' : 'div'"
            :href="item.href"
            class="flex items-start gap-3 w-full min-w-0"
          >
            <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <UIcon :name="item.icon" class="size-5" />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-muted mb-0.5">
                {{ $t(item.label) }}
              </div>
              <div
                class="text-sm font-medium text-highlighted"
                :class="item.href ? 'num' : ''"
                :dir="item.href?.startsWith('tel:') || item.href?.startsWith('mailto:') ? 'ltr' : undefined"
              >
                {{ item.raw ? item.value : $t(item.value) }}
              </div>
            </div>
          </component>
        </div>

        <div
          v-if="storeContact.address"
          class="p-4 rounded-xl border border-dashed border-muted bg-muted/30"
        >
          <div class="flex items-center gap-2 text-sm font-semibold text-highlighted mb-2">
            <UIcon name="i-tabler-map-2" class="size-4 text-primary" />
            {{ $t('موقعیت دفتر مرکزی') }}
          </div>
          <div class="aspect-video rounded-lg bg-muted border border-muted grid place-items-center text-muted">
            <div class="text-center px-4">
              <UIcon name="i-tabler-map-pin" class="size-8 mx-auto mb-2 opacity-60" />
              <p class="text-xs leading-6">
                {{ storeContact.address }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div class="border border-muted rounded-2xl overflow-hidden">
          <div class="px-4 py-4 sm:(px-5 py-4) border-b border-muted bg-muted/30">
            <h2 class="text-base font-bold text-highlighted">
              {{ $t('ارسال پیام') }}
            </h2>
            <p class="text-xs text-muted mt-1">
              {{ $t('فرم زیر را پر کنید؛ حداکثر تا ۲۴ ساعت پاسخ می‌دهیم.') }}
            </p>
          </div>

          <form
            class="p-4 sm:p-5 space-y-4"
            @submit.prevent="onSubmit"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TheFormInput
                v-model="form.fullName"
                :label="$t('نام و نام خانوادگی')"
                required
                icon="i-tabler-user"
                :placeholder="$t('نام کامل')"
                :error="errors.fullName"
                @update:model-value="errors.fullName = ''"
              />
              <TheFormInput
                v-model="form.phone"
                :label="$t('شماره موبایل')"
                required
                digits-only
                type="tel"
                inputmode="numeric"
                :maxlength="11"
                dir="ltr"
                icon="i-tabler-device-mobile"
                :placeholder="$t('۰۹۱۲۳۴۵۶۷۸۹')"
                :error="errors.phone"
                @update:model-value="errors.phone = ''"
              />
              <TheFormInput
                v-model="form.email"
                :label="$t('ایمیل (اختیاری)')"
                type="email"
                dir="ltr"
                icon="i-tabler-mail"
                placeholder="name@example.com"
              />
              <TheFormSelect
                v-model="form.subject"
                :label="$t('موضوع')"
                required
                :items="subjectItems"
                icon="i-tabler-tag"
                :placeholder="$t('انتخاب موضوع')"
                :error="errors.subject"
                @update:model-value="errors.subject = ''"
              />
            </div>

            <UFormField
              :label="$t('متن پیام')"
              required
              :error="errors.message || undefined"
              :ui="{ label: 'text-sm', error: 'text-[11px] text-error mt-1' }"
            >
              <UTextarea
                v-model="form.message"
                :rows="5"
                size="xl"
                :placeholder="$t('پیام خود را بنویسید...')"
                class="w-full"
                :ui="textareaUi"
                @update:model-value="errors.message = ''"
              />
            </UFormField>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-muted">
              <p class="text-[11px] text-dimmed leading-6">
                {{ $t('اطلاعات شما محرمانه نگه داشته می‌شود.') }}
              </p>
              <UButton
                type="submit"
                color="primary"
                size="lg"
                class="font-bold sm:min-w-36 shrink-0"
                :loading="submitting"
                trailing-icon="i-tabler-send"
              >
                {{ $t('ارسال پیام') }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StaticContactItem } from '~/data/static-pages'
import { contactFormSubjects } from '~/data/static-pages'

const props = defineProps<{
  items: StaticContactItem[]
}>()

const { contact: storeContact } = await useStoreContact()

function isFooterContactField(item: StaticContactItem) {
  const label = item.label || ''
  const href = item.href || ''
  if (item.icon === 'i-tabler-phone' || href.startsWith('tel:') || label.includes('تلفن')) return true
  if (item.icon === 'i-tabler-clock' || label.includes('پاسخ') || label.includes('ساعت')) return true
  if (item.icon === 'i-tabler-map-pin' || label.includes('آدرس')) return true
  return false
}

const displayItems = computed(() => {
  const live = storeContact.value
  const extras = props.items.filter(item => !isFooterContactField(item))
  const phones = live.phones.map(phone => ({
    icon: 'i-tabler-phone',
    label: 'تلفن پشتیبانی',
    value: phone.label,
    href: phone.href,
    raw: true,
  }))
  const address = live.address
    ? [{
        icon: 'i-tabler-map-pin',
        label: 'آدرس',
        value: live.address,
        raw: true as const,
      }]
    : []
  const hours = live.workingHours
    ? [{
        icon: 'i-tabler-clock',
        label: 'ساعات پاسخگویی',
        value: live.workingHours,
        raw: true as const,
      }]
    : []

  return [...phones, ...extras, ...address, ...hours]
})

const { t } = useI18n()
const toast = useAppToast()

const subjectItems = contactFormSubjects.map(item => item.label)

const form = ref({
  fullName: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
})

const errors = ref({
  fullName: '',
  phone: '',
  subject: '',
  message: '',
})

const submitting = ref(false)

const textareaUi = {
  base: 'rounded-xl border border-default bg-default focus:border-primary',
}

function validate() {
  let valid = true
  errors.value = { fullName: '', phone: '', subject: '', message: '' }

  if (!form.value.fullName.trim()) {
    errors.value.fullName = t('نام الزامی است')
    valid = false
  }

  if (!/^09\d{9}$/.test(form.value.phone.replace(/\D/g, ''))) {
    errors.value.phone = t('شماره موبایل معتبر نیست')
    valid = false
  }

  if (!form.value.subject) {
    errors.value.subject = t('موضوع را انتخاب کنید')
    valid = false
  }

  if (form.value.message.trim().length < 10) {
    errors.value.message = t('پیام باید حداقل ۱۰ کاراکتر باشد')
    valid = false
  }

  return valid
}

async function onSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    const phone = form.value.phone.replace(/\D/g, '')
    const { result, error } = await usePost<{ message: string }>(
      '/contact',
      {
        fullName: form.value.fullName.trim(),
        phone,
        ...(form.value.email.trim() ? { email: form.value.email.trim() } : {}),
        subject: form.value.subject,
        message: form.value.message.trim(),
      },
      { headers: { 'no-error': true } },
    )

    if (error || !result) {
      toast.error(t('ارسال پیام ناموفق بود. دوباره تلاش کنید.'))
      return
    }

    toast.success(t('پیام شما ثبت شد. به زودی با شما تماس می‌گیریم.'))

    form.value = {
      fullName: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    }
  }
  finally {
    submitting.value = false
  }
}
</script>
