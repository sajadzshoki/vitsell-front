<template>
  <TheStaticPage page-id="careers" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('فرصت‌های شغلی'),
})
</script>
