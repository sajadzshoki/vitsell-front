<template>
  <TheStaticPage page-id="contact" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('تماس با ما'),
})
</script>
