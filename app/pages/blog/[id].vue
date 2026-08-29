<template>
  <main
    v-if="post"
    class="w-full py-2 md:py-4"
  >
    <TheBlogPostDetail :post="post" />
  </main>
</template>

<script setup lang="ts">
import { getBlogPostById } from '~/data/static-pages'

const route = useRoute()
const { t } = useI18n()

const postId = computed(() => String(route.params.id ?? ''))

const post = computed(() => getBlogPostById(postId.value))

watch(
  post,
  (value) => {
    if (postId.value && !value) {
      throw createError({
        statusCode: 404,
        statusMessage: t('مطلب یافت نشد'),
      })
    }
  },
  { immediate: true },
)

useSeoMeta({
  title: () => post.value?.title ?? t('بلاگ دیجی‌شاپ'),
  description: () => post.value?.excerpt,
})
</script>
