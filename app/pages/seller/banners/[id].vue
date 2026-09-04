<template>
  <div>
    <div
      v-if="loading"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>
    <div
      v-else-if="!banner"
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
import type { SellerBanner } from '~/data/seller-banners'

const { t } = useI18n()
const route = useRoute()
const { fetchBanner } = useSellerBanners()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const loading = ref(true)
const banner = ref<SellerBanner | null>(null)

const bannerId = computed(() => String(route.params.id ?? ''))

async function load() {
  loading.value = true
  try {
    if (!bannerId.value) {
      banner.value = null
      return
    }
    const result = await fetchBanner(bannerId.value, { force: true })
    banner.value = result.ok ? result.banner : null
  }
  finally {
    loading.value = false
  }
}

watch(bannerId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => banner.value
    ? `${t('ویرایش بنر')} · ${banner.value.id}`
    : t('ویرایش بنر'),
})
</script>
