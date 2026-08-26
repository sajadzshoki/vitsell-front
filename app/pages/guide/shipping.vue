<template>
  <TheStaticPage page-id="guide-shipping" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('رویه ارسال سفارش'),
})
</script>
