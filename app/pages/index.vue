<template>
  <main class="flex flex-col gap-6 md:gap-10">
    <TheHeroCarousel
      v-if="heroSlides.length"
      class="<md:hidden"
    />
    <TheHomeFeatures
      v-if="heroFeatures.length"
      class="<md:hidden"
    />
    <TheHomeCircleStrip v-if="circles.length" />
    <TheHomeCategories v-if="categories.length" />
    <TheHomeDeals v-if="dealsOfTheDay.length" />
    <TheHomeBrands v-if="brands.length" />
    <TheHomeBestSellers v-if="bestSellers.length" />
    <TheHomePromos v-if="promos.length" />
  </main>
</template>

<script lang="ts" setup>
const {
  fetchHome,
  heroSlides,
  heroFeatures,
  circles,
  categories,
  brands,
  bestSellers,
  promos,
  dealsOfTheDay,
} = useHome()

await useAsyncData('home-page', () => fetchHome({ force: true }))
</script>
