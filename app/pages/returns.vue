<template>
  <TheStaticPage page-id="returns" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('رویه‌های بازگشت کالا'),
})
</script>
