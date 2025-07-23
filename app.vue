<template>
  <NuxtLoadingIndicator />
  <div class="flex flex-col min-h-screen max-w-full">
    <Html dir="rtl"/>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
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