<template>
  <TheSellerNotifications />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('اعلان‌ها'),
})
</script>
