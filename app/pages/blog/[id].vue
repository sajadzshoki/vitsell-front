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
import { blogPostingJsonLd } from '~/composables/useJsonLd'

const route = useRoute()
const { t } = useI18n()
const { settings } = useSellerSeoSettings()
const { ensureLoaded, getPublishedById, getByIdForPreview, morePosts } = useBlog()

const postId = computed(() => String(route.params.id ?? ''))
const isPreview = computed(() =>
  route.query.preview === '1' || route.query.preview === 'true',
)

const { data: sellerPost } = await useAsyncData(
  () => `blog-post-view-${postId.value}-${isPreview.value ? 'preview' : 'pub'}`,
  async () => {
    await ensureLoaded()
    return isPreview.value
      ? getByIdForPreview(postId.value, true) ?? null
      : getPublishedById(postId.value) ?? null
  },
  { watch: [postId, isPreview] },
)

const post = computed<StaticBlogPost | null>(() =>
  sellerPost.value ? toStaticBlogPost(sellerPost.value) : null,
)

const related = computed<StaticBlogPost[]>(() =>
  post.value ? morePosts(post.value.id, 3) : [],
)

if (!sellerPost.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('مطلب یافت نشد'),
  })
}

useEntitySeo(() => ({
  entity: sellerPost.value?.seo,
  fallbackTitle: sellerPost.value?.title ?? t('بلاگ دیجی‌شاپ'),
  fallbackDescription: sellerPost.value?.excerpt ?? '',
  fallbackImage: sellerPost.value?.image ?? '',
  path: `/blog/${postId.value}`,
}))

useJsonLd(() => {
  const p = sellerPost.value
  if (!p) return null
  const base = settings.value.siteUrl.replace(/\/+$/, '')
  return blogPostingJsonLd({
    title: p.seo?.metaTitle || p.title,
    description: p.seo?.metaDescription || p.excerpt,
    image: p.seo?.ogImage || p.image,
    url: base ? `${base}/blog/${p.id}` : `/blog/${p.id}`,
    datePublished: p.publishedAt || p.createdAt || undefined,
    dateModified: p.updatedAt || p.publishedAt || undefined,
    authorName: p.author,
  })
})
</script>
