<template>
  <main
    v-if="post"
    class="w-full py-2 md:py-4"
  >
    <div
      v-if="isPreview"
      class="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
    >
      <div class="text-sm text-toned">
        <span class="font-bold text-highlighted">{{ $t('حالت پیش‌نمایش') }}</span>
        <span class="mx-1">—</span>
        {{ $t('این مطلب ممکن است هنوز منتشر نشده باشد و برای موتورهای جستجو ایندکس نمی‌شود.') }}
      </div>
      <UButton
        to="/seller/blog"
        color="neutral"
        variant="soft"
        size="xs"
        class="cursor-pointer shrink-0"
      >
        {{ $t('بازگشت به پنل') }}
      </UButton>
    </div>
    <TheBlogPostDetail
      :post="post"
      :more-posts="related"
    />
  </main>
</template>

<script setup lang="ts">
import {
  isBlogPostPubliclyVisible,
  toStaticBlogPost,
} from '~/data/seller-blog'
import type { StaticBlogPost } from '~/data/static-pages'
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
} from '~/composables/useJsonLd'
import { joinSiteUrl } from '~/data/seo'

const route = useRoute()
const { t } = useI18n()
const { settings } = useSellerSeoSettings()
const {
  ensureLoaded,
  getPublishedById,
  getByIdForPreview,
  fetchPreviewById,
  morePosts,
} = useBlog()

const postId = computed(() => String(route.params.id ?? ''))
const isPreview = computed(() =>
  route.query.preview === '1' || route.query.preview === 'true',
)

const { data: sellerPost } = await useAsyncData(
  () => `blog-post-view-${postId.value}-${isPreview.value ? 'preview' : 'pub'}`,
  async () => {
    if (isPreview.value) {
      const fromSeller = await fetchPreviewById(postId.value)
      if (fromSeller) return fromSeller
      await ensureLoaded()
      return getByIdForPreview(postId.value, true) ?? null
    }
    await ensureLoaded()
    return getPublishedById(postId.value) ?? null
  },
  { watch: [postId, isPreview] },
)

const post = computed<StaticBlogPost | null>(() =>
  sellerPost.value ? toStaticBlogPost(sellerPost.value) : null,
)

const related = computed<StaticBlogPost[]>(() =>
  post.value ? morePosts(post.value.id, 8) : [],
)

const isPublic = computed(() =>
  Boolean(sellerPost.value && isBlogPostPubliclyVisible(sellerPost.value)),
)

const forceNoIndex = computed(() => isPreview.value || !isPublic.value)

if (!sellerPost.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('مطلب یافت نشد'),
  })
}

const siteBase = computed(() => settings.value.siteUrl.replace(/\/+$/, ''))
const postPath = computed(() => `/blog/${postId.value}`)
const absoluteUrl = computed(() =>
  siteBase.value ? joinSiteUrl(siteBase.value, postPath.value) : postPath.value,
)

useEntitySeo(() => {
  const p = sellerPost.value
  return {
    entity: {
      ...(p?.seo || {}),
      robots: forceNoIndex.value
        ? 'noindex,nofollow'
        : (p?.seo?.robots || 'index,follow'),
      ogImage: p?.seo?.ogImage || p?.image || '',
      twitterImage: p?.seo?.twitterImage || p?.seo?.ogImage || p?.image || '',
    },
    fallbackTitle: p?.title ?? t('بلاگ ویتسل'),
    fallbackDescription: p?.excerpt ?? '',
    fallbackImage: p?.image ?? '',
    path: postPath.value,
  }
})

useSeoMeta({
  ogType: 'article',
  articlePublishedTime: () => sellerPost.value?.publishedAt || sellerPost.value?.createdAt || undefined,
  articleModifiedTime: () => sellerPost.value?.updatedAt || sellerPost.value?.publishedAt || undefined,
  articleAuthor: () => sellerPost.value?.author || undefined,
})

useJsonLd(() => {
  const p = sellerPost.value
  if (!p || forceNoIndex.value) return null
  const crumbs = breadcrumbJsonLd([
    { name: t('خانه'), url: siteBase.value ? `${siteBase.value}/` : '/' },
    { name: t('بلاگ'), url: siteBase.value ? `${siteBase.value}/blog` : '/blog' },
    { name: p.seo?.metaTitle || p.title, url: absoluteUrl.value },
  ])
  const article = blogPostingJsonLd({
    title: p.seo?.metaTitle || p.title,
    description: p.seo?.metaDescription || p.excerpt,
    image: p.seo?.ogImage || p.image,
    url: absoluteUrl.value,
    datePublished: p.publishedAt || p.createdAt || undefined,
    dateModified: p.updatedAt || p.publishedAt || undefined,
    authorName: p.author,
  })
  return [article, crumbs].filter(Boolean) as Record<string, unknown>[]
})
</script>
