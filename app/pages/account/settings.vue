<template>
  <TheAccountSettings />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'account',
  middleware: [
    'auth',
    function () {
      const device = useDevice()
      if (!device.isMobile) {
        return navigateTo('/account', { replace: true })
      }
    },
  ],
})

useSeoMeta({
  title: () => t('تنظیمات'),
})
</script>
