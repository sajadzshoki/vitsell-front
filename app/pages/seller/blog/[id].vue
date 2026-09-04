<template>
  <div>
    <div
      v-if="loading"
      class="py-16 flex justify-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>
    <div
      v-else-if="!post"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-news-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('مطلب پیدا نشد') }}
      </p>
      <UButton
        to="/seller/blog"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به وبلاگ') }}
      </UButton>
    </div>
    <TheSellerBlogForm
      v-else
      :initial="post"
    />
  </div>
</template>

<script setup lang="ts">
import type { SellerBlogPost } from '~/data/seller-blog'

const { t } = useI18n()
const route = useRoute()
const toast = useAppToast()
const { fetchById } = useSellerBlog()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const postId = computed(() => String(route.params.id ?? ''))
const loading = ref(true)
const post = ref<SellerBlogPost | null>(null)

const { data } = await useAsyncData(
  () => `seller-blog-edit-${postId.value}`,
  async () => {
    if (!postId.value) return null
    const { ok, post: row, error } = await fetchById(postId.value, { force: true })
    if (!ok) {
      if (import.meta.client) {
        toast.error(t(error?.message || 'بارگذاری مطلب ناموفق بود'))
      }
      return null
    }
    return row
  },
  { watch: [postId] },
)

post.value = data.value
loading.value = false

watch(data, (value) => {
  post.value = value
  loading.value = false
})

useSeoMeta({
  title: () => post.value
    ? `${t('ویرایش مطلب')} · ${post.value.title}`
    : t('ویرایش مطلب'),
})
</script>
