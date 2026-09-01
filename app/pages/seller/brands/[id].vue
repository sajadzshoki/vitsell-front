<template>
  <TheSellerBrandDetail :brand-id="brandId" />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerBrands()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureLoaded()

const brandId = computed(() => String(route.params.id ?? ''))
const brand = computed(() => getById(brandId.value) ?? null)

useSeoMeta({
  title: () => brand.value
    ? `${t('جزئیات برند')} · ${brand.value.name}`
    : t('جزئیات برند'),
})
</script>
