<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/account/wishlist', { redirectCode: 301, replace: true })
    },
  ],
})
</script>

<template>
  <div />
</template>
