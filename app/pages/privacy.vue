<template>
  <TheStaticPage page-id="privacy" />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('حریم خصوصی'),
})
</script>
