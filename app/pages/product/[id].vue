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
                :product="product"
                @open-reviews="activeTab = 'reviews'"
                @open-specs="activeTab = 'specs'"
                @open-questions="activeTab = 'questions'"
              />
            </div>
          </div>
        </section>

        <aside class="order-2 lg:col-span-3 lg:row-span-2 lg:sticky lg:top-36 lg:z-20 self-start w-full">
          <TheProductBuyBox :product="product" />
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
const activeTab = ref('desc')

watch(productId, () => {
  colorIndex.value = 0
  activeTab.value = 'desc'
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

useSeoMeta({
  title: () => product.value?.title ?? '',
  description: () => product.value?.shortDesc ?? product.value?.title ?? '',
})
</script>
