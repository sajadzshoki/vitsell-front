<template>
  <main
    v-if="post"
    class="w-full py-2 md:py-4"
  >
    <TheBlogPostDetail
      :post="post"
      :more-posts="morePosts ?? []"
    />
  </main>
</template>

<script setup lang="ts">
import type { StaticBlogPost } from '~/data/static-pages'

const route = useRoute()
const { t } = useI18n()

const postId = computed(() => String(route.params.id ?? ''))

const { data: post, error } = await useAsyncData(
  () => `blog-post-${postId.value}`,
  async () => {
    const id = postId.value
    if (!id) return null
    const { result, error: fetchError } = await useGet<StaticBlogPost>(
      `/blog/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (fetchError || !result) return null
    return result
  },
  { watch: [postId] },
)

const { data: morePosts } = await useAsyncData(
  () => `blog-more-${postId.value}`,
  async () => {
    const id = postId.value
    const { result } = await useGet<StaticBlogPost[]>('/blog', {
      headers: { 'no-error': true },
    })
    if (!Array.isArray(result)) return [] as StaticBlogPost[]
    return result.filter(p => p.id !== id).slice(0, 3)
  },
  { watch: [postId] },
)

if (error.value || (postId.value && !post.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: t('مطلب یافت نشد'),
  })
}

useSeoMeta({
  title: () => post.value?.title ?? t('بلاگ دیجی‌شاپ'),
  description: () => post.value?.excerpt,
})
</script>
