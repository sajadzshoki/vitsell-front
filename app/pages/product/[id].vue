<template>
  <main
    v-if="pending && !product"
    class="w-screen max-w-[100vw] ms-[calc(50%-50vw)] max-lg:pb-28"
  >
    <TheSkeleton variant="product-detail" />
  </main>

  <main
    v-else-if="product"
    class="w-screen max-w-[100vw] ms-[calc(50%-50vw)] px-3 sm:px-4 lg:px-6 max-lg:pb-28"
  >
    <div class="mx-auto max-w-9xl w-full">
      <UBreadcrumb
        :items="breadcrumbItems"
        class="hidden md:flex py-4 text-xs"
      />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-start">
        <section class="order-1 lg:col-span-9 md:bg-default md:rounded-3xl md:border md:border-muted md:p-4 lg:p-6 min-w-0">
          <TheProductHeader
            :product="product"
            class="hidden md:block mb-4 pb-2  border-b border-muted"
            size="lg"
          />

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-5">
            <div class="md:col-span-5 flex flex-col gap-2">
              <TheProductGallery :product="product" />
              <TheProductHeader
                :product="product"
                class="md:hidden"
                size="sm"
              />
            </div>

            <div class="md:col-span-7">
              <TheProductInfo
                v-model:color-index="colorIndex"
                v-model:selected-options="selectedOptions"
                :product="product"
                @open-reviews="activeTab = 'reviews'"
                @open-specs="activeTab = 'specs'"
                @open-questions="activeTab = 'questions'"
              />
            </div>
          </div>
        </section>

        <aside class="order-2 lg:col-span-3 lg:row-span-2 lg:sticky lg:top-36 lg:z-20 self-start w-full">
          <TheProductBuyBox
            :product="displayProduct"
            :variant-id="selectedVariant?.id"
          />
        </aside>

        <div class="order-3 lg:col-span-9 min-w-0">
          <TheProductTabs
            v-model="activeTab"
            :product="product"
          />
        </div>
      </div>

      <TheSkeleton
        v-if="detailPending && !related.length"
        variant="product-grid"
        :count="6"
        class="mt-6 md:mt-10"
      />
      <TheProductRelated
        v-else
        :product="product"
        :related="related"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import { productJsonLd, useJsonLd } from '~/composables/useJsonLd'
import { useEntitySeo } from '~/composables/useEntitySeo'
import { useSellerSeoSettings } from '~/composables/useSellerSeoSettings'
import { useSellerProductCommerce } from '~/composables/useSellerProductCommerce'
import { htmlToPlainText } from '~/data/seo'
import {
  variantFinalPrice,
  variantMatchesSelection,
  variantPriceAdjustment,
} from '~/data/seller-product-variants'

const { t } = useI18n()
const route = useRoute()
const { fetchProduct, cache } = useProducts()

const productId = computed(() => String(route.params.id ?? ''))
const product = ref<Product | null>(null)
const pending = ref(true)

const { related, fetchDetail, detailPending } = useProductDetail(product)

watch(
  () => (productId.value ? cache.value[productId.value] : null),
  (cached) => {
    if (cached) product.value = cached
  },
)

async function loadProduct() {
  const id = productId.value
  pending.value = true
  try {
    if (!id) {
      product.value = null
      throw createError({ statusCode: 404, statusMessage: t('محصول یافت نشد') })
    }
    const { result, error } = await fetchProduct(id)
    if (!result || error) {
      product.value = null
      throw createError({ statusCode: 404, statusMessage: t('محصول یافت نشد') })
    }
    product.value = result
    initializeVariantSelection()
    await fetchDetail({ force: true })
    if (result) {
      const { track } = useUserActivity()
      void track({
        type: 'product_view',
        productId: result.id,
        category: result.category,
      })
    }
  }
  finally {
    pending.value = false
  }
}

loadProduct()

watch(productId, () => {
  loadProduct()
})

useMobileBackwardTitle(() => product.value?.title ?? '')

const colorIndex = ref(0)
const selectedOptions = ref<Record<string, string>>({})
const activeTab = ref('desc')

watch(productId, () => {
  colorIndex.value = 0
  selectedOptions.value = {}
  activeTab.value = 'desc'
})

const selectedVariant = computed(() =>
  (product.value?.variants ?? []).find(variant =>
    variantMatchesSelection(variant, selectedOptions.value),
  ) ?? null,
)

const displayProduct = computed<Product>(() => {
  const current = product.value!
  const variant = selectedVariant.value
  if (!variant || !(current.variants?.length)) return current
  const adjustment = variantPriceAdjustment(current.variantAxes, variant)
  const price = variantFinalPrice(current.price, current.variantAxes, variant)
  const oldPrice = current.oldPrice
    ? Math.max(price, current.oldPrice + adjustment)
    : undefined
  return {
    ...current,
    price,
    ...(oldPrice && oldPrice > price ? { oldPrice } : { oldPrice: undefined }),
    image: variant.image || current.image,
    stock: variant.stock,
    inStock: variant.status === 'active' && variant.stock > 0,
    sku: variant.sku || current.sku,
    barcode: variant.barcode || current.barcode,
    weight: variant.weight || current.weight,
  }
})

function initializeVariantSelection() {
  const current = product.value
  const variants = current?.variants ?? []
  if (!current?.variantAxes?.length || !variants.length) {
    selectedOptions.value = {}
    return
  }
  const preferred = variants.find(variant => variant.status === 'active' && variant.stock > 0)
    ?? variants.find(variant => variant.status === 'active')
    ?? variants[0]
  selectedOptions.value = Object.fromEntries(
    (preferred?.options ?? []).map(option => [option.attributeId, option.valueId]),
  )
}

const breadcrumbItems = computed(() => {
  if (!product.value) return []
  return [
    { label: t('خانه'), to: '/' },
    {
      label: t(product.value.categoryLabel),
      to: { name: 'category-catId', params: { catId: product.value.category } },
    },
    { label: product.value.brand },
    { label: product.value.title },
  ]
})

const { getByProductId } = useSellerProductCommerce()
const { settings } = useSellerSeoSettings()

const commerce = computed(() =>
  productId.value ? getByProductId(productId.value) : null,
)

const productSeo = computed(() =>
  product.value?.seo || commerce.value?.seo || null,
)

useEntitySeo(() => ({
  entity: productSeo.value,
  fallbackTitle: product.value?.title ?? '',
  fallbackDescription: htmlToPlainText(product.value?.shortDesc) || product.value?.title || '',
  fallbackImage: product.value?.image ?? '',
  path: productId.value ? `/product/${productId.value}` : undefined,
}))

useJsonLd(() => {
  const p = product.value
  if (!p) return null
  const base = settings.value.siteUrl.replace(/\/+$/, '')
  const price = p.price
  const seo = productSeo.value
  return productJsonLd({
    name: seo?.metaTitle || p.title,
    description: htmlToPlainText(seo?.metaDescription)
      || htmlToPlainText(p.shortDesc)
      || p.title,
    image: seo?.ogImage || p.image,
    url: base ? `${base}/product/${p.id}` : `/product/${p.id}`,
    sku: p.sku || commerce.value?.sku || undefined,
    brand: p.brand,
    price,
    currency: 'IRR',
  })
})
</script>
