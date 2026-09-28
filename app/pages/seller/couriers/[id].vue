<template>
  <TheSellerCourierForm :courier-id="courierId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const courierId = computed(() => String(route.params.id || ''))
</script>
