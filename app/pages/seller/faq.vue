<template>
  <div>
    <div class="hidden lg:block mb-5">
      <h1 class="font-bold text-highlighted text-lg">
        {{ $t('سوالات متداول') }}
      </h1>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ $t('دسته‌ها و پرسش‌وپاسخ صفحه FAQ را مدیریت کنید؛ تغییرات در /faq نمایش داده می‌شود.') }}
      </p>
    </div>
    <TheSellerFaqForm />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('سوالات متداول'),
})
</script>
