<template>
  <TheStaticPage page-id="terms" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('شرایط استفاده'),
})
</script>
