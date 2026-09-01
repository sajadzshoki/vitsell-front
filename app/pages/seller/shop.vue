<template>
  <div />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('تنظیمات سایت'),
})

await navigateTo('/seller/settings', { replace: true })
</script>
