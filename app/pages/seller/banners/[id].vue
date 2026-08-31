<template>
  <div>
    <div
      v-if="!banner"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-photo-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('بنر پیدا نشد') }}
      </p>
      <UButton
        to="/seller/banners"
        color="primary"
        variant="soft"
      >
        {{ $t('بازگشت به بنرها') }}
      </UButton>
    </div>
    <TheSellerBannerForm
      v-else
      :initial="banner"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerBanners()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

ensureLoaded()

const bannerId = computed(() => String(route.params.id ?? ''))
const banner = computed(() => getById(bannerId.value) ?? null)

useSeoMeta({
  title: () => banner.value
    ? `${t('ویرایش بنر')} · ${banner.value.id}`
    : t('ویرایش بنر'),
})
</script>
