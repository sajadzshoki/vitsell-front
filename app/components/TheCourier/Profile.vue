<template>
  <div class="px-4 py-6">
    <div class="bg-default border border-muted rounded-2xl p-5 space-y-4">
      <div>
        <div class="text-xs text-muted mb-1">
          {{ $t('نام') }}
        </div>
        <div class="font-bold text-highlighted">
          {{ displayName || $t('پیک') }}
        </div>
      </div>
      <div>
        <div class="text-xs text-muted mb-1">
          {{ $t('شماره موبایل') }}
        </div>
        <div
          class="num text-default"
          dir="ltr"
        >
          {{ profile.phone }}
        </div>
      </div>
      <UButton
        color="error"
        variant="soft"
        block
        size="xl"
        class="cursor-pointer min-h-11"
        :loading="pending"
        @click="onLogout"
      >
        {{ $t('خروج') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { profile, fetchProfile } = useAccount()
const { logout } = useShop()
const pending = ref(false)

const displayName = computed(() =>
  [profile.value.firstName, profile.value.lastName].map(part => part?.trim()).filter(Boolean).join(' '),
)

onMounted(() => {
  void fetchProfile()
})

async function onLogout() {
  pending.value = true
  try {
    await logout()
    await navigateTo('/courier/login')
  }
  finally {
    pending.value = false
  }
}
</script>
