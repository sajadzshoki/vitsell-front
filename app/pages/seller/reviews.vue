<template>
  <TheSellerReviews />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('نظرات مشتریان'),
})
</script>
