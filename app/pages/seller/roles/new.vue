<template>
  <div
    v-if="!canCreate"
    class="py-16"
  >
    <TheSellerEmptyState
      icon="i-tabler-lock"
      :message="$t('دسترسی ایجاد نقش ندارید')"
    >
      <template #actions>
        <UButton
          to="/seller/roles"
          color="primary"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('بازگشت به لیست') }}
        </UButton>
      </template>
    </TheSellerEmptyState>
  </div>
  <TheSellerRoleForm v-else />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const { can } = useSellerPermissions()
const canCreate = computed(() => can('roles.create'))
</script>
