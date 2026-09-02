<template>
  <nav class="bg-default border-t border-muted -mx-3 sm:-mx-4 mt-6">
    <NuxtLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted last:border-b-0 transition hover:bg-muted/50"
    >
      <div
        class="size-9 rounded-xl grid place-items-center shrink-0"
        :class="item.iconWrap"
      >
        <UIcon :name="item.icon" class="size-5" />
      </div>
      <span class="flex-1 text-sm text-default font-medium">{{ $t(item.label) }}</span>
      <UBadge
        v-if="item.badge"
        color="error"
        variant="solid"
        size="xs"
        class="num me-1"
      >
        {{ item.badge }}
      </UBadge>
      <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed shrink-0" />
    </NuxtLink>

    <button
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3.5 text-start border-t border-muted transition hover:bg-error/50"
      @click="onLogout"
    >
      <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-muted text-muted">
        <UIcon name="i-tabler-logout" class="size-5 text-error" />
      </div>
      <span class="flex-1 text-sm text-error">{{ $t('خروج از حساب') }}</span>
      <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed shrink-0 text-error" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { accountNavItems } from '~/data/account'

const { wishlistCount } = useShop()
const { requestLogout } = useAccountLogout()

const menuItems = computed(() => [
  ...accountNavItems
    .filter(item => item.id !== 'dashboard')
    .map(item => ({
      label: item.label,
      icon: item.icon,
      to: item.to,
      iconWrap: 'bg-primary/10 text-primary',
      badge: item.id === 'wishlist' && wishlistCount.value > 0
        ? wishlistCount.value.toLocaleString('fa-IR')
        : undefined as string | undefined,
    })),
  {
    label: 'تنظیمات',
    icon: 'i-tabler-settings',
    to: '/account/settings',
    iconWrap: 'bg-muted text-toned',
    badge: undefined as string | undefined,
  },
])

function onLogout() {
  requestLogout()
}
</script>
