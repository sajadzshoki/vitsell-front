<template>
  <div>
    <div
      v-if="!pageItem"
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
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerPages()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureLoaded()

const pageItem = computed(() => getById(String(route.params.id ?? '')))

useSeoMeta({
  title: () => pageItem.value
    ? `${t('ویرایش صفحه')} · ${pageItem.value.title}`
    : t('ویرایش صفحه'),
})
</script>
