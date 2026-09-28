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
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-5">
            <TheProductHeader
              :product="product"
              class="order-2 md:(order-1 col-span-12 pb-2 border-b border-muted)"
            />

            <div class="order-1 md:(order-2 col-span-5) flex flex-col gap-2">
              <TheProductGallery :product="product" />
            </div>

            <div class="order-3 md:col-span-7">
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
import { barcodeToGtin13, productJsonLd, useJsonLd } from '~/composables/useJsonLd'
import { useEntitySeo } from '~/composables/useEntitySeo'
import { useSellerSeoSettings } from '~/composables/useSellerSeoSettings'
import { useSellerProductCommerce } from '~/composables/useSellerProductCommerce'
import {
  htmlToPlainText,
  productImageCaption,
  stripUrlQuery,
  tomanToRial,
  toPublicSeoImage,
} from '~/data/seo'
import {
  findVariantByQuery,
  preferredProductVariant,
  PRODUCT_VARIANT_QUERY_KEY,
  selectionFromVariant,
  variantFinalPrice,
  variantMatchesSelection,
  variantPriceAdjustment,
} from '~/data/seller-product-variants'

function variantOptionLabel(
  variant: { options?: { attributeName: string, label: string }[] } | null | undefined,
  patterns: RegExp,
) {
  return variant?.options?.find(option => patterns.test(option.attributeName))?.label?.trim() || undefined
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { fetchProduct } = useProducts()

const productId = computed(() => String(route.params.id ?? ''))

const { data: product, pending } = await useAsyncData(
  () => `product-${productId.value}`,
  async () => {
    const id = productId.value
    if (!id) {
      throw createError({ statusCode: 404, statusMessage: t('محصول یافت نشد') })
    }
    const { result, error } = await fetchProduct(id)
    if (!result || error) {
      throw createError({ statusCode: 404, statusMessage: t('محصول یافت نشد') })
    }
    return result
  },
  { watch: [productId] },
)

const {
  related,
  fetchDetail,
  detailPending,
  allReviews,
  displayRating,
  displayReviewCount,
} = useProductDetail(product)

const colorIndex = ref(0)
const selectedOptions = ref<Record<string, string>>({})
const activeTab = ref('desc')
/** Avoid query↔selection feedback loops while applying URL or defaults. */
const syncingVariantQuery = ref(false)

function routeVariantQuery() {
  return route.query[PRODUCT_VARIANT_QUERY_KEY]
}

function initializeVariantSelection() {
  const current = product.value
  const variants = current?.variants ?? []
  if (!current?.variantAxes?.length || !variants.length) {
    selectedOptions.value = {}
    return
  }
  const fromQuery = findVariantByQuery(variants, routeVariantQuery())
  const preferred = fromQuery ?? preferredProductVariant(variants)
  selectedOptions.value = selectionFromVariant(preferred)
}

async function patchVariantQuery(variantId: string | undefined) {
  const current = routeVariantQuery()
  const currentId = Array.isArray(current)
    ? String(current[0] ?? '')
    : String(current ?? '')
  const nextId = variantId || undefined
  if ((currentId || undefined) === nextId) return

  syncingVariantQuery.value = true
  try {
    await router.replace({
      query: {
        ...route.query,
        [PRODUCT_VARIANT_QUERY_KEY]: nextId ?? null,
      },
    })
  }
  finally {
    syncingVariantQuery.value = false
  }
}

async function hydrateProductExtras(result: Product | null | undefined) {
  if (!result) return
  initializeVariantSelection()
  await fetchDetail({ force: import.meta.server })
  if (import.meta.client) {
    const { track } = useUserActivity()
    void track({
      type: 'product_view',
      productId: result.id,
      category: result.category,
    })
  }
}

watch(product, (result, prev) => {
  if (!result || result.id === prev?.id) return
  void hydrateProductExtras(result)
})

watch(productId, () => {
  colorIndex.value = 0
  selectedOptions.value = {}
  activeTab.value = 'desc'
  openedWithVariantQuery.value = variantQueryPresent()
})

useMobileBackwardTitle(() => product.value?.title ?? '')

const selectedVariant = computed(() =>
  (product.value?.variants ?? []).find(variant =>
    variantMatchesSelection(variant, selectedOptions.value),
  ) ?? null,
)

watch(
  selectedVariant,
  (variant) => {
    if (!import.meta.client || syncingVariantQuery.value) return
    const hasAxes = Boolean(product.value?.variantAxes?.length && product.value?.variants?.length)
    void patchVariantQuery(hasAxes ? variant?.id : undefined)
  },
  { flush: 'post' },
)

watch(
  () => route.query[PRODUCT_VARIANT_QUERY_KEY],
  (queryValue) => {
    if (syncingVariantQuery.value) return
    const variants = product.value?.variants ?? []
    if (!product.value?.variantAxes?.length || !variants.length) return
    const fromQuery = findVariantByQuery(variants, queryValue)
    if (!fromQuery) return
    if (selectedVariant.value?.id === fromQuery.id) return
    syncingVariantQuery.value = true
    selectedOptions.value = selectionFromVariant(fromQuery)
    nextTick(() => {
      syncingVariantQuery.value = false
    })
  },
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

function variantQueryPresent() {
  const value = route.query[PRODUCT_VARIANT_QUERY_KEY]
  const raw = Array.isArray(value) ? value[0] : value
  return String(raw || '').trim().length > 0
}

/**
 * Noindex only when the visitor opened /product/:id?v=…
 * The page later writes ?v= itself for the selected variant; that must not
 * flip the clean URL to noindex (Google renders JS and would drop the page).
 */
const openedWithVariantQuery = ref(variantQueryPresent())

useEntitySeo(() => {
  const seo = productSeo.value
  const siteUrl = settings.value.siteUrl
  const image = toPublicSeoImage(product.value?.image || '', siteUrl)
  const ogImage = toPublicSeoImage(seo?.ogImage || product.value?.image || '', siteUrl)
  const twitterImage = toPublicSeoImage(
    seo?.twitterImage || seo?.ogImage || product.value?.image || '',
    siteUrl,
  )
  return {
    entity: {
      ...(seo || {}),
      canonicalUrl: stripUrlQuery(seo?.canonicalUrl || ''),
      robots: openedWithVariantQuery.value ? 'noindex,follow' : (seo?.robots || 'index,follow'),
      ogImage,
      twitterImage,
    },
    fallbackTitle: product.value?.title ?? '',
    fallbackDescription: htmlToPlainText(product.value?.shortDesc) || product.value?.title || '',
    fallbackImage: image,
    path: productId.value ? `/product/${productId.value}` : undefined,
  }
})

useJsonLd(() => {
  const p = product.value
  if (!p) return null
  const base = settings.value.siteUrl.replace(/\/+$/, '')
  const absolute = (path: string) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    if (!base) return path.startsWith('/') ? path : `/${path}`
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${base}${normalized}`
  }
  const offerProduct = displayProduct.value
  const variant = selectedVariant.value
  const canonical = stripUrlQuery(absolute(`/product/${p.id}`) || '')
  const color = variantOptionLabel(variant, /رنگ|color/i)
    || p.colors?.[colorIndex.value]?.name
    || undefined
  const size = variantOptionLabel(variant, /سایز|اندازه|size/i)
  const gtin13 = barcodeToGtin13(offerProduct.barcode || p.barcode || commerce.value?.barcode)
  const imageSources = [
    offerProduct.image,
    ...(p.gallery || []),
    p.image,
  ]
    .map((src) => {
      const stored = String(src || '').trim()
      const url = toPublicSeoImage(stored, settings.value.siteUrl)
      if (!url) return null
      return {
        url,
        caption: productImageCaption(p.imageAlts?.[stored] || p.imageAlts?.[url], p.title),
      }
    })
    .filter((item): item is { url: string, caption: string | undefined } => Boolean(item))

  return productJsonLd({
    name: p.title,
    description: htmlToPlainText(p.shortDesc)
      || htmlToPlainText(p.description)
      || p.title,
    image: imageSources,
    url: canonical || undefined,
    sku: offerProduct.sku || p.sku || commerce.value?.sku || undefined,
    gtin13,
    brand: p.brand || undefined,
    category: p.categoryLabel || undefined,
    color,
    size,
    additionalProperty: (p.specs || [])
      .map(spec => ({ name: spec.key, value: spec.value }))
      .filter(spec => spec.name && spec.value),
    price: tomanToRial(offerProduct.price),
    currency: 'IRR',
    inStock: offerProduct.inStock !== false,
    itemCondition: 'NewCondition',
    sellerName: settings.value.siteName || undefined,
    sellerUrl: base || undefined,
    ratingValue: displayRating.value,
    reviewCount: displayReviewCount.value,
    reviews: allReviews.value.map(review => ({
      authorName: review.name,
      ratingValue: review.rating,
      reviewBody: review.text,
      datePublished: review.date,
    })),
    breadcrumbs: [
      { name: t('خانه'), url: absolute('/') },
      { name: t(p.categoryLabel), url: absolute(`/category/${p.category}`) },
      ...(p.brand ? [{ name: p.brand }] : []),
      { name: p.title, url: canonical || undefined },
    ],
  })
})

await hydrateProductExtras(product.value)
</script>
