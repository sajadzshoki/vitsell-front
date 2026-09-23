<template>
  <main
    v-if="showSkeleton"
    class="w-full py-2 md:py-4 flex flex-col gap-6 md:gap-8"
  >
    <TheSkeleton variant="chip-row" />
    <TheSkeleton variant="category-hero" />
    <TheSkeleton variant="deals" />
    <TheSkeleton
      variant="circle"
      :count="8"
    />
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-2">
          <USkeleton class="h-5 w-40 rounded-lg" />
          <USkeleton class="h-3 w-52 rounded-lg" />
        </div>
        <USkeleton class="h-4 w-20 rounded-lg" />
      </div>
      <TheSkeleton
        variant="product-grid"
        :count="6"
        class="!xl:grid-cols-6"
      />
    </div>
    <TheSkeleton variant="brand" />
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-2">
          <USkeleton class="h-5 w-36 rounded-lg" />
          <USkeleton class="h-3 w-56 rounded-lg" />
        </div>
        <USkeleton class="h-4 w-20 rounded-lg" />
      </div>
      <TheSkeleton
        variant="article-grid"
        :count="4"
      />
    </div>
    <TheSkeleton variant="seo-text" />
  </main>

  <main
    v-else
    class="w-full py-2 md:py-4 flex flex-col gap-6 md:gap-8"
  >
    <TheCategoryQuickNav :active-id="catId" />

    <TheCategoryHero
      :hero="meta.hero"
      :product-count="productCount"
      :search-route="searchAllRoute"
    />

    <TheCategoryDealsStrip
      v-if="dealProducts.length"
      :products="dealProducts"
      :view-all-route="searchAllRoute"
    />

    <TheCategorySuggestedSubs
      :items="suggestedItems"
      :search-route="searchRoute"
    />

    <TheCategoryPopularProducts
      v-if="popularProducts.length"
      :products="popularProducts"
      :view-all-route="searchAllRoute"
    />

    <TheCategoryBrands
      :brands="brands"
      :brand-route="brandRoute"
    />

    <TheCategoryRelatedArticles
      :articles="articles"
      :view-all-route="blogRoute"
    />

    <TheCategorySeoBlock :seo="meta.seo" />
  </main>
</template>

<script setup lang="ts">
import { useEntitySeo } from '~/composables/useEntitySeo'

const {
  catId,
  category,
  meta,
  popularProducts,
  dealProducts,
  brands,
  suggestedItems,
  articles,
  blogRoute,
  productCount,
  searchAllRoute,
  searchRoute,
  brandRoute,
  pending,
  loaded,
  ready,
} = useCategoryPage()

await ready

const showSkeleton = computed(() =>
  (pending.value || !loaded.value) && !category.value,
)

useEntitySeo(() => ({
  entity: category.value?.seo ?? null,
  fallbackTitle: category.value?.name ?? meta.value.hero.title,
  fallbackDescription: meta.value.seo.paragraphs[0] ?? meta.value.hero.subtitle,
  fallbackImage: meta.value.hero.image || '',
  path: catId.value ? `/category/${catId.value}` : undefined,
}))
</script>
