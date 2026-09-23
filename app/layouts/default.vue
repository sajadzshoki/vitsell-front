<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col">
    <TheNavbar :class="{ 'max-md:hidden': isBackwardPage }" />

    <TheMobileBackHeader
      v-if="isBackwardPage"
      :title="backwardTitle"
    />

    <div
      class="mx-auto max-w-8xl w-full flex-1"
      :class="contentClass"
    >
      <slot />
    </div>

    <TheFooter
      class="pb-20 md:pb-0"
      :class="{
        'max-md:hidden': isCategoryIndex || isBackwardPage,
        'md:pb-0': isBackwardPage,
      }"
    />

    <TheBottomNav v-if="!isBackwardPage" />
    <TheCompareBar />
  </div>
</template>

<script setup lang="ts">
import { webSiteJsonLd } from '~/composables/useJsonLd'

const route = useRoute()
const { isBackwardPage, title: backwardTitle } = useMobileBackward()
const { settings, ensureLoaded } = useSellerSeoSettings()

await ensureLoaded()

useJsonLd(() => webSiteJsonLd({
  name: settings.value.siteName,
  url: settings.value.siteUrl || undefined,
}))

const isCategoryIndex = computed(() => route.path === '/category')

const contentClass = computed(() => {
  if (isCategoryIndex.value) {
    return 'max-md:(px-0 py-0 pb-16) md:(px-3 py-4 sm:px-4 lg:px-6 pb-4)'
  }
  if (isBackwardPage.value) {
    return 'px-3 py-3 sm:px-4 md:(px-4 py-4) lg:px-6 md:pb-4 pb-6'
  }
  return 'px-3 py-4 sm:px-4 lg:px-6 pb-24 md:pb-4'
})
</script>
