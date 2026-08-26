<template>
  <TheStaticPage page-id="guide-payment" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('شیوه‌های پرداخت'),
})
</script>
