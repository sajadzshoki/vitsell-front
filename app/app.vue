<template>
  <Html
    :dir="htmlDir"
    :lang="htmlLang"
  >
  <Body>
  <NuxtLoadingIndicator/>
  <UApp
    :locale="fa_ir"
    :toaster="toaster"
  >
    <NuxtLayout v-if="network.isOnline.value">
      <NuxtPage/>
    </NuxtLayout>
    <TheOffline v-else/>
    <TheAccountLogoutModal />
  </UApp>
  </Body>
  </Html>
</template>

<script setup lang="ts">
import { fa_ir } from '@nuxt/ui/locale'

const network = useNetwork()
const appConfig = useAppConfig()
const route = useRoute()
const { site, fetchSite } = useSiteSettings()
const { ensureLoaded: ensureSeoSettings } = useSellerSeoSettings()
await Promise.all([fetchSite(), ensureSeoSettings()])

const htmlLang = computed(() => site.value.defaultLocale || 'fa')
const htmlDir = computed(() => (site.value.defaultLocale === 'en' ? 'ltr' : 'rtl'))

const toaster = computed(() => {
  const isProductPage = /^\/product\//.test(route.path)
  return {
    duration: 3500,
    expand: true,
    ...(appConfig.toaster ?? {}),
    // position: (isProductPage  ? 'bottom-center' : 'top-center') as 'bottom-center' | 'top-center',
    position:  'top-center',
  }
})
</script>
