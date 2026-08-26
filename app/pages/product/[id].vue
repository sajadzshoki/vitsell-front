<template>
  <main
    v-if="product"
    class="w-screen max-w-[100vw] ms-[calc(50%-50vw)] px-3 sm:px-4 lg:px-6"
  >
    <div class="mx-auto max-w-9xl w-full">
      <UBreadcrumb
        :items="breadcrumbItems"
        class="hidden md:flex py-4 text-xs"
      />

      <section class="md:bg-default md:rounded-3xl md:border md:border-muted md:p-4 lg:p-8">
        <TheProductHeader
          :product="product"
          class="hidden md:block mb-6 pb-5 border-b border-muted"
          size="lg"
        />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div class="lg:col-span-4 lg:self-start flex flex-col gap-3">
            <TheProductGallery :product="product" />
            <TheProductHeader
              :product="product"
              class="md:hidden"
              size="sm"
            />
          </div>

          <div class="lg:col-span-5 lg:self-start">
            <TheProductInfo
              v-model:color-index="colorIndex"
              :product="product"
              @open-reviews="activeTab = 'reviews'"
            />
          </div>

          <div class="lg:col-span-3">
            <TheProductBuyBox :product="product" />
          </div>
        </div>
      </section>

      <TheProductTabs
        v-model="activeTab"
        :product="product"
      />

      <TheProductRelated :product="product" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { getProductById, type Product } from '~/data/products'

const { t } = useI18n()
const route = useRoute()

const product = computed<Product>(() => getProductById(String(route.params.id)))

const colorIndex = ref(0)
const activeTab = ref('specs')

watch(() => route.params.id, () => {
  colorIndex.value = 0
  activeTab.value = 'specs'
})

const breadcrumbItems = computed(() => [
  { label: t('خانه'), to: '/' },
  {
    label: t(product.value.categoryLabel),
    to: { name: 'category-catId', params: { catId: product.value.category } },
  },
  { label: product.value.brand },
  { label: product.value.title },
])

useSeoMeta({
  title: () => product.value.title,
  description: () => product.value.shortDesc,
})
</script>
