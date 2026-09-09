<template>
  <div class="space-y-5">
    <div
      v-if="pending && !shopLoaded"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0"
    >
      <h2 class="hidden lg:block font-bold text-highlighted mb-2">
        {{ $t('تنظیمات سایت') }}
      </h2>
      <p class="hidden lg:block text-xs text-muted mb-5">
        {{ $t('این اطلاعات در کل سایت (لوگو، فوتر، تماس) یکسان استفاده می‌شود.') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.name"
          :label="$t('نام سایت')"
          required
        />
        <TheFormInput
          v-model="form.slug"
          :label="$t('شناسه سایت')"
          dir="ltr"
          disabled
          :help="$t('شناسه ثابت سایت')"
        />
        <TheFormInput
          v-model="form.phone"
          :label="$t('شماره تماس')"
          dir="ltr"
          digits-only
          maxlength="11"
          required
          :help="$t('همان شماره ورود به پنل مدیریت')"
        />
        <TheFormInput
          v-model="form.email"
          :label="$t('ایمیل')"
          type="email"
          dir="ltr"
          required
        />
        <TheFormInput
          v-model="form.city"
          :label="$t('شهر')"
        />
        <TheFormInput
          :model-value="shop.joinDate"
          :label="$t('تاریخ راه‌اندازی')"
          disabled
        />
      </div>

      <UFormField
        class="mt-4"
        :label="$t('درباره سایت')"
      >
        <UTextarea
          v-model="form.about"
          :rows="4"
          autoresize
          class="w-full"
        />
      </UFormField>

      <TheSellerFormActions>
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ saved ? $t('ذخیره شد') : $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="onCancel"
        >
          {{ $t('انصراف') }}
        </UButton>
      </TheSellerFormActions>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerShop } from '~/data/seller'

const { t } = useI18n()
const toast = useAppToast()
const { shop, pending, fetchShop, updateShop } = useSeller()

const saved = ref(false)
const saving = ref(false)
const shopLoaded = ref(false)
const form = ref<SellerShop>({ ...shop.value })

watch(shop, (value) => {
  form.value = { ...value }
})

async function onSave() {
  if (!form.value.name.trim() || !form.value.phone.trim() || !form.value.email.trim()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  saving.value = true
  try {
    const { result, error } = await updateShop(form.value)
    if (error || !result) {
      toast.error(
        error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
          || error?.data?.message
          || t('ذخیره تنظیمات سایت ناموفق بود'),
      )
      return
    }
    form.value = { ...result }
    saved.value = true
    toast.success(t('تنظیمات سایت ذخیره شد'))
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }
  finally {
    saving.value = false
  }
}

function onCancel() {
  form.value = { ...shop.value }
}

const { ok, error } = await fetchShop({ force: true })
shopLoaded.value = true
if (!ok) {
  toast.error(
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
      || error?.data?.message
      || error?.message
      || t('بارگذاری تنظیمات سایت ناموفق بود'),
  )
}
else {
  form.value = { ...shop.value }
}
</script>
