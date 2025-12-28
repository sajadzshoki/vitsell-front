<template>
  <Html dir="rtl">
  <Body>
  <NuxtLoadingIndicator/>
  <UApp>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </UApp>
  </Body>
  </Html>
</template>

<script setup lang="ts">
// const {isTablet , isMobile} = useDevice()
// const userId = useCookie('userId');
// if(isMobile || isTablet){
//   if(!userId.value){
//     navigateTo({name: 'login'})
//   }
// }
</script>