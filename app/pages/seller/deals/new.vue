<template>
  <TheSellerDealForm />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('افزودن شگفت‌انگیز'),
})
</script>
