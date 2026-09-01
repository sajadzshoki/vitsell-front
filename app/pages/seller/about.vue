<template>
  <div>
    <div class="hidden lg:block mb-5">
      <h1 class="font-bold text-highlighted text-lg">
        {{ $t('درباره ما') }}
      </h1>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ $t('محتوای صفحه درباره ما شامل هیرو، داستان، آمار، ارزش‌ها، مسیر رشد و تیم را مدیریت کنید.') }}
      </p>
    </div>
    <TheSellerAboutForm />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('درباره ما'),
})
</script>
