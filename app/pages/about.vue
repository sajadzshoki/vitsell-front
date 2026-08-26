<template>
  <TheStaticPage page-id="about" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('درباره دیجی‌شاپ'),
})
</script>
