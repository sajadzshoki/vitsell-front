<template>
  <TheStaticPage page-id="guide-order" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('نحوه ثبت سفارش'),
})
</script>
