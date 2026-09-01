<template>
  <TheSellerCustomerDetail :customer-id="String(route.params.id)" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
</script>
