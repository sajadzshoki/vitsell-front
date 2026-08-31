<template>
  <TheSellerProductDetail :product-id="productId" />
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { getListing, resolveProduct, fetchProductPanel } = useSeller()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const productId = computed(() => String(route.params.id ?? ''))
const listing = computed(() => getListing(productId.value))
const product = computed(() =>
  listing.value ? resolveProduct(productId.value) : null,
)

await useAsyncData(
  () => `seller-product-${productId.value}`,
  () => fetchProductPanel(productId.value),
  { watch: [productId] },
)

useSeoMeta({
  title: () => product.value
    ? `${t('جزئیات محصول')} · ${product.value.title}`
    : t('جزئیات محصول'),
})
</script>
