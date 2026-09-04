<template>
  <div
    v-if="loading"
    class="py-16 grid place-items-center"
  >
    <UIcon
      name="i-tabler-loader-2"
      class="size-8 text-primary animate-spin"
    />
  </div>
  <div v-else-if="!role">
    <TheSellerEmptyState
      icon="i-tabler-lock-off"
      :message="$t('نقش پیدا نشد')"
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
const { t } = useI18n()
const toast = useAppToast()
const { getById, fetchById } = useSellerRoles()
const loading = ref(true)
const roleId = computed(() => String(route.params.id || ''))
const role = computed(() => getById(roleId.value))

onMounted(async () => {
  loading.value = true
  try {
    const { ok, error } = await fetchById(roleId.value, { force: true })
    if (!ok) {
      toast.error(t(error || 'بارگذاری نقش ناموفق بود'))
    }
  }
  finally {
    loading.value = false
  }
})
</script>
