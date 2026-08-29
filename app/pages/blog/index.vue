<template>
  <TheStaticPage page-id="blog" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('بلاگ دیجی‌شاپ'),
})
</script>
