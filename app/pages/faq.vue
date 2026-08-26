<template>
  <TheStaticPage page-id="faq" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('پاسخ به سوالات'),
})
</script>
