<template>
  <main
    v-if="post"
    class="w-full py-2 md:py-4"
  >
    <TheBlogPostDetail
      :post="post"
      :more-posts="related"
    />
  </main>
</template>

<script setup lang="ts">
import { toStaticBlogPost } from '~/data/seller-blog'
import type { StaticBlogPost } from '~/data/static-pages'

const route = useRoute()
const { t } = useI18n()
const { ensureLoaded, getPublishedById, morePosts } = useBlog()

const postId = computed(() => String(route.params.id ?? ''))

const { data: post } = await useAsyncData(
  () => `blog-post-view-${postId.value}`,
  async () => {
    await ensureLoaded()
    const found = getPublishedById(postId.value)
    return found ? toStaticBlogPost(found) : null
  },
  { watch: [postId] },
)

const related = computed<StaticBlogPost[]>(() =>
  post.value ? morePosts(post.value.id, 3) : [],
)

if (!post.value) {
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
