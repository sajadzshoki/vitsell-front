<template>
  <TheSellerShopForm />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('تنظیمات فروشگاه'),
})
</script>
