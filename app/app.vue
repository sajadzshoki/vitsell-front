<template>
  <Html dir="rtl">
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

const toaster = computed(() => ({
  position: 'top-center' as const,
  duration: 3500,
  expand: true,
  ...(appConfig.toaster ?? {}),
}))
</script>
