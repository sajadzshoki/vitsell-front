<template>
  <TheSellerMediaLibrary />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})
</script>
