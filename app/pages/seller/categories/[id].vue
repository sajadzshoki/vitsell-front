<template>
  <div>
    <div
      v-if="pending && !category"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>
    <div
      v-else-if="!category"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-category-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('دسته‌بندی پیدا نشد') }}
      </p>
      <UButton
        to="/seller/categories"
        color="primary"
        variant="soft"
      >
        {{ $t('بازگشت به دسته‌بندی‌ها') }}
      </UButton>
    </div>
    <TheSellerCategoryForm
      v-else
      :initial="category"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById, pending } = useSellerCategories()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

await ensureLoaded()

const categoryId = computed(() => String(route.params.id ?? ''))
const category = computed(() => getById(categoryId.value) ?? null)

useSeoMeta({
  title: () => category.value
    ? `${t('ویرایش دسته‌بندی')} · ${category.value.name}`
    : t('ویرایش دسته‌بندی'),
})
</script>
