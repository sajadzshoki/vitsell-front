<template>
  <div>
    <div
      v-if="loading"
      class="space-y-5"
    >
      <USkeleton class="h-40 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
      <USkeleton class="h-48 rounded-2xl" />
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
import type { SellerCategory } from '~/data/seller-categories'

const { t } = useI18n()
const route = useRoute()
const { fetchCategory } = useSellerCategories()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const categoryId = computed(() => String(route.params.id ?? ''))
const category = ref<SellerCategory | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const { ok, category: fetched } = await fetchCategory(categoryId.value, { force: true })
    category.value = ok ? fetched : null
  }
  finally {
    loading.value = false
  }
}

watch(categoryId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => category.value
    ? `${t('ویرایش دسته‌بندی')} · ${category.value.name}`
    : t('ویرایش دسته‌بندی'),
})
</script>
