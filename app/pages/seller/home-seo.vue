<template>
  <div>
    <div class="hidden lg:block mb-5">
      <h1 class="font-bold text-highlighted text-lg">
        {{ $t('متن صفحه اصلی') }}
      </h1>
      <p class="text-xs text-muted mt-1 leading-6">
        {{ $t('عنوان اول، تنها عنوان اصلی صفحه خانه است. بقیه عنوان‌ها زیرمجموعه همان بخش هستند.') }}
      </p>
    </div>
    <TheSellerHomeSeoForm />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('متن صفحه اصلی'),
})
</script>
