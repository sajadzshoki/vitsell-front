<template>
  <main class="flex flex-col gap-6 md:gap-10">
    <TheHeroCarousel class="<md:hidden" />

    <TheHomeCircleStrip />
    <TheHomeDeals />
    <TheHomeForYou />
    <TheHomeCategories />

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

    <TheHomeBrands />

    <TheHomeBanners
      v-if="bannerRows[2]"
      :items="bannerRows[2].items"
    />

    <TheHomeCategoryShelf
      v-if="categoryShelves[2]"
      :shelf="categoryShelves[2]"
    />

    <TheHomeBlog />
    <TheHomeFeatures class="<md:hidden" />
    <TheHomePromos />

    <TheHomeAppDownload />

    <TheHomeSeoText />
  </main>
</template>

<script lang="ts" setup>
const {
  fetchHome,
  bannerRows,
  categoryShelves,
} = useHome()

useAsyncData('home-page', () => fetchHome({ force: true }))
</script>
