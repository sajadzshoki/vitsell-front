<template>
  <TheCourierOrderDetail :order-id="orderId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'courier',
  middleware: ['courier'],
})

const route = useRoute()
const orderId = computed(() => String(route.params.id || ''))
</script>
