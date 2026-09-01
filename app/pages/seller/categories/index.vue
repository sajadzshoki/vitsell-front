<template>
  <TheSellerCategories />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('دسته‌بندی‌ها'),
})
</script>
