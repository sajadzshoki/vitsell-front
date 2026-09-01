<template>
  <div v-if="!role">
    <TheSellerEmptyState
      icon="i-tabler-lock-off"
      :message="$t('نقش پیدا نشد')"
    />
  </div>
  <TheSellerRoleForm
    v-else
    :initial="role"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const { getById, ensureLoaded } = useSellerRoles()
ensureLoaded()
const role = computed(() => getById(String(route.params.id)))
</script>
