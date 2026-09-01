<template>
  <div>
    <div
      v-if="!category"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <p class="text-sm text-muted mb-4">
        {{ $t('دسته پیدا نشد') }}
      </p>
      <UButton
        to="/seller/blog/categories"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>
    <TheSellerBlogCategoryForm
      v-else
      :initial="category"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerBlogCategories()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureLoaded()

const category = computed(() => getById(String(route.params.id ?? '')))

useSeoMeta({
  title: () => category.value
    ? `${t('ویرایش دسته وبلاگ')} · ${category.value.name}`
    : t('ویرایش دسته وبلاگ'),
})
</script>
