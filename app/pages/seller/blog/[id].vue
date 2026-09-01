<template>
  <div>
    <div
      v-if="!post"
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
const { t } = useI18n()
const route = useRoute()
const { ensureSeeded, getById } = useBlog()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

ensureSeeded()

const postId = computed(() => String(route.params.id ?? ''))
const post = computed(() => getById(postId.value) ?? null)

useSeoMeta({
  title: () => post.value
    ? `${t('ویرایش مطلب')} · ${post.value.title}`
    : t('ویرایش مطلب'),
})
</script>
