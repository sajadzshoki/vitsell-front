<template>
  <Html dir="rtl">
  <Body>
  <NuxtLoadingIndicator/>
  <UApp>
    <NuxtLayout v-if="network.isOnline.value">
      <NuxtPage/>
    </NuxtLayout>
    <TheOffline v-else/>
  </UApp>
  </Body>
  </Html>
</template>

<script setup lang="ts">
const network = useNetwork()

</script>