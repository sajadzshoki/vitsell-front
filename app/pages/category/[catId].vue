<template>
  <main class="w-full py-2 md:py-4 flex flex-col gap-6 md:gap-8">
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
} = useCategoryPage()

useSeoMeta({
  title: () => category.value?.name ?? meta.value.hero.title,
  description: () => meta.value.seo.paragraphs[0] ?? meta.value.hero.subtitle,
})
</script>
