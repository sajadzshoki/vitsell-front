<template>
  <main class="w-full py-2 md:py-4">
    <TheBlogListing />
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { ensureLoaded, publishedPosts } = useBlog()

await ensureLoaded()

useEntitySeo(() => ({
  fallbackTitle: t('بلاگ دیجی‌شاپ'),
  fallbackDescription: t('راهنمای خرید، بررسی محصول و اخبار دنیای تکنولوژی'),
  path: '/blog',
}))

// Ensure listing surface only published posts (TheBlogListing uses publishedPosts)
void publishedPosts.value
</script>
