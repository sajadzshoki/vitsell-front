<template>
  <div>
    <div class="hidden lg:block mb-5">
      <h1 class="font-bold text-highlighted text-lg">
        {{ $t('اطلاعات فوتر') }}
      </h1>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ $t('متن، تماس، ستون‌های لینک، شبکه‌های اجتماعی و نشان‌های فوتر سایت را مدیریت کنید.') }}
      </p>
    </div>
    <TheSellerFooterForm />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('اطلاعات فوتر'),
})
</script>
