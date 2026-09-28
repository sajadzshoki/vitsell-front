<template>
  <main class="flex flex-col gap-6 md:gap-10">
    <!-- هیرو / اسلایدر اصلی -->
    <TheHeroCarousel />

    <!-- نوار دایره‌ای میان‌برها -->
    <TheHomeCircleStrip />

    <!-- پیشنهاد شگفت‌انگیز -->
    <TheHomeDeals />

    <!-- پیشنهاد برای شما -->
    <TheHomeForYou />

    <!-- دسته‌بندی‌ها -->
    <TheHomeCategories />

    <!-- بنر ردیف ۱ -->
    <TheHomeBanners
      v-if="bannerRows[0]"
      :items="bannerRows[0].items"
    />

    <!-- شلف دسته‌بندی ۱ -->
    <TheHomeCategoryShelf
      v-if="categoryShelves[0]"
      :shelf="categoryShelves[0]"
    />

    <!-- برترین‌های موبایل‌ها -->
    <TheHomeTopMobiles />

    <!-- بنر ردیف ۲ -->
    <TheHomeBanners
      v-if="bannerRows[1]"
      :items="bannerRows[1].items"
    />

    <!-- پرفروش‌های رتبه‌بندی‌شده -->
    <TheHomeRankedBestSellers />

    <!-- شلف دسته‌بندی ۲ -->
    <TheHomeCategoryShelf
      v-if="categoryShelves[1]"
      :shelf="categoryShelves[1]"
    />

    <!-- برندها -->
    <TheHomeBrands />

    <!-- بنر ردیف ۳ -->
    <TheHomeBanners
      v-if="bannerRows[2]"
      :items="bannerRows[2].items"
    />

    <!-- شلف دسته‌بندی ۳ -->
    <TheHomeCategoryShelf
      v-if="categoryShelves[2]"
      :shelf="categoryShelves[2]"
    />

    <!-- وبلاگ -->
    <TheHomeBlog />

    <!-- ویژگی‌ها (فقط دسکتاپ) -->
    <TheHomeFeatures class="<md:hidden" />

    <!-- پروموها (غیرفعال) -->
    <!-- <TheHomePromos /> -->

    <!-- دانلود اپ -->
    <!-- <TheHomeAppDownload /> -->

    <!-- متن سئو -->
    <TheHomeSeoText />
  </main>
</template>

<script lang="ts" setup>
import { organizationJsonLd, useJsonLd } from '~/composables/useJsonLd'
const {
  fetchHome,
  bannerRows,
  categoryShelves,
  seoBlocks,
} = useHome()

await useAsyncData('home-page', () => fetchHome({ force: true }))

const { site } = useSiteSettings()
const { settings } = useSellerSeoSettings()

const homeDescription = computed(() =>
  site.value.brandDescription
  || site.value.about
  || seoBlocks.value[0]?.paragraphs[0]
  || '',
)

useEntitySeo(() => ({
  fallbackTitle: seoBlocks.value[0]?.title || settings.value.siteName || site.value.brandName || site.value.name || 'vitsell',
  fallbackDescription: homeDescription.value,
  fallbackImage: settings.value.defaultOgImage || site.value.defaultOgImage || site.value.logoUrl || '',
  path: '/',
}))

useJsonLd(() => organizationJsonLd({
  name: settings.value.siteName || site.value.brandName || site.value.name || 'vitsell',
  description: homeDescription.value || undefined,
  url: settings.value.siteUrl || undefined,
  logo: settings.value.defaultOgImage || site.value.defaultOgImage || site.value.logoUrl || undefined,
}))
</script>
