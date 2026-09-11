<template>
  <TheSellerMegaMenuForm />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => t('افزودن مگا منو'),
})
</script>
