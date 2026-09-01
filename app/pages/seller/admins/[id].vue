<template>
  <TheSellerAdminDetail :admin-id="String(route.params.id)" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
</script>
