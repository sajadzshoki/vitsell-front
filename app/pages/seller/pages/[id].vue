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
      v-else-if="!pageItem"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <p class="text-sm text-muted mb-4">
        {{ $t('صفحه پیدا نشد') }}
      </p>
      <UButton
        to="/seller/pages"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>
    <TheSellerPageForm
      v-else
      :initial="pageItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { SellerManagedPage } from '~/data/seller-pages'

const { t } = useI18n()
const route = useRoute()
const toast = useAppToast()
const { fetchById } = useSellerPages()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const pageId = computed(() => String(route.params.id ?? ''))
const loading = ref(true)
const pageItem = ref<SellerManagedPage | null>(null)

const { data } = await useAsyncData(
  () => `seller-page-edit-${pageId.value}`,
  async () => {
    if (!pageId.value) return null
    const { ok, page, error } = await fetchById(pageId.value, { force: true })
    if (!ok) {
      if (import.meta.client) {
        toast.error(t(error?.message || 'بارگذاری صفحه ناموفق بود'))
      }
      return null
    }
    return page
  },
  { watch: [pageId] },
)

pageItem.value = data.value
loading.value = false

watch(data, (value) => {
  pageItem.value = value
  loading.value = false
})

useSeoMeta({
  title: () => pageItem.value
    ? `${t('ویرایش صفحه')} · ${pageItem.value.title}`
    : t('ویرایش صفحه'),
})
</script>
