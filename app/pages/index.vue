<template>
  <main class="flex flex-col gap-6 md:gap-10">
    <TheHeroCarousel
      v-if="heroSlides.length"
      class="<md:hidden"
    />

    <TheHomeCircleStrip v-if="circles.length" />
    <TheHomeDeals v-if="dealsOfTheDay.length" />
    <TheHomeCategories v-if="categories.length" />


    <TheHomeBanners
      v-if="bannerRows[0]"
      :items="bannerRows[0].items"
    />

    <TheHomeCategoryShelf
      v-if="categoryShelves[0]"
      :shelf="categoryShelves[0]"
    />

    <TheHomeTopMobiles />

    <TheHomeBanners
      v-if="bannerRows[1]"
      :items="bannerRows[1].items"
    />

    <TheHomeRankedBestSellers />

    <TheHomeCategoryShelf
      v-if="categoryShelves[1]"
      :shelf="categoryShelves[1]"
    />

    <TheHomeBrands v-if="brands.length" />

    <TheHomeBanners
      v-if="bannerRows[2]"
      :items="bannerRows[2].items"
    />

    <TheHomeCategoryShelf
      v-if="categoryShelves[2]"
      :shelf="categoryShelves[2]"
    />

    <TheHomeBlog />
    <TheHomeFeatures
      v-if="heroFeatures.length"
      class="<md:hidden"
    />
    <TheHomePromos v-if="promos.length" />

    <TheHomeAppDownload />

    <TheHomeSeoText />
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
  promos,
  dealsOfTheDay,
  bannerRows,
  categoryShelves,
} = useHome()

await useAsyncData('home-page', () => fetchHome({ force: true }))
</script>
