<template>
  <main class="w-full py-2 md:py-4">
    <TheAboutPage />
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { about, ensureLoaded } = useAbout()

await ensureLoaded()

useSeoMeta({
  title: () => about.value.title || t('درباره دیجی‌شاپ'),
  description: () => about.value.subtitle,
})
</script>
