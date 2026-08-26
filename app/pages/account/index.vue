<template>
  <TheAccountDashboard />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('پیشخوان'),
})
</script>
