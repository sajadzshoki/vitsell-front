<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <h2 class="hidden lg:block font-bold text-highlighted mb-5">
      {{ $t('تنظیمات فروشگاه') }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TheFormInput
        v-model="form.name"
        :label="$t('نام فروشگاه')"
      />
      <TheFormInput
        v-model="form.slug"
        :label="$t('شناسه فروشگاه')"
        dir="ltr"
      />
      <TheFormInput
        v-model="form.phone"
        :label="$t('شماره تماس فروشگاه')"
        dir="ltr"
        digits-only
        maxlength="11"
      />
      <TheFormInput
        v-model="form.email"
        :label="$t('ایمیل')"
        type="email"
        dir="ltr"
      />
      <TheFormInput
        v-model="form.city"
        :label="$t('شهر')"
      />
      <TheFormInput
        :model-value="shop.joinDate"
        :label="$t('تاریخ عضویت')"
        disabled
      />
    </div>

    <UFormField
      class="mt-4"
      :label="$t('درباره فروشگاه')"
    >
      <UTextarea
        v-model="form.about"
        :rows="4"
        autoresize
        class="w-full"
      />
    </UFormField>

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
import type { SellerShop } from '~/data/seller'

const { t } = useI18n()
const toast = useAppToast()
const { shop } = useSeller()

const saved = ref(false)
const form = ref<SellerShop>({ ...shop.value })

watch(shop, (value) => {
  form.value = { ...value }
})

function onSave() {
  shop.value = { ...form.value }
  saved.value = true
  toast.success(t('اطلاعات فروشگاه ذخیره شد'))
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function onCancel() {
  form.value = { ...shop.value }
}
</script>
