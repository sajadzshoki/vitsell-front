<template>
  <Html dir="rtl">
  <Body>
  <NuxtLoadingIndicator/>
  <UApp>
    <NuxtLayout v-if="network.isOnline.value">
      <small class="text-( gray-600) z-200 fixed top-2 left-2 ">v-1.0.0</small>
      <NuxtPage/>
      <TheDevToolsNew/>
    </NuxtLayout>
    <TheOffline v-else/>
  </UApp>
  </Body>
  </Html>
</template>

<script setup lang="ts">
const network = useNetwork()
// const {isTablet , isMobile} = useDevice()
// const userId = useCookie('userId');
// if(isMobile || isTablet){
//   if(!userId.value){
//     navigateTo({name: 'login'})
//   }
// }
</script>