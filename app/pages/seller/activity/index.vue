<template>
  <TheSellerAuditLogs mode="activity" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})
</script>
