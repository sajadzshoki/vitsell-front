<template>
  <main class="w-full py-2 md:py-4">
    <TheBlogListing />
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('بلاگ دیجی‌شاپ'),
  description: () => t('راهنمای خرید، بررسی محصول و اخبار دنیای تکنولوژی'),
})
</script>
