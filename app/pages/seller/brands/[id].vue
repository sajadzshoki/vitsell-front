<template>
  <TheSellerBrandDetail :brand-id="brandId" />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { fetchBrand, getById } = useSellerBrands()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const brandId = computed(() => String(route.params.id ?? ''))
const brand = computed(() => getById(brandId.value) ?? null)

onMounted(() => {
  if (brandId.value) void fetchBrand(brandId.value, { force: true })
})

useSeoMeta({
  title: () => brand.value
    ? `${t('جزئیات برند')} · ${brand.value.name}`
    : t('جزئیات برند'),
})
</script>
