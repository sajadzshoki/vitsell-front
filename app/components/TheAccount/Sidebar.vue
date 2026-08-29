<template>
  <div class="bg-default border border-muted rounded-2xl p-5">
    <div class="flex items-center gap-3 pb-4 border-b border-muted">
      <div
        class="size-14 rounded-2xl account-avatar-gradient text-inverted grid place-items-center text-xl font-bold shrink-0"
      >
        {{ avatarInitial }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-highlighted truncate">
          {{ fullName }}
        </div>
        <div class="text-[11px] text-muted num leading-5" >
          {{ profile.phone }}
        </div>
      </div>
    </div>

    <!-- <ThePanelSwitch class="mt-4" /> -->

    <nav class="mt-3 pt-3 space-y-1">
      <NuxtLink
        v-for="item in accountNavItems"
        :key="item.id"
        :to="item.to"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-start"
        :class="isActive(item.to)
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-toned hover:bg-elevated'"
      >
        <UIcon :name="item.icon" class="size-5 shrink-0" />
        <span class="flex-1">{{ $t(item.label) }}</span>
        <UIcon
          v-if="isActive(item.to)"
          name="i-tabler-chevron-left"
          class="size-4 shrink-0"
        />
      </NuxtLink>

      <NuxtLink
        to="/account/settings"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-start"
        :class="isActive('/account/settings')
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-toned hover:bg-elevated'"
      >
        <UIcon name="i-tabler-settings" class="size-5 shrink-0" />
        <span class="flex-1">{{ $t('تنظیمات') }}</span>
        <UIcon
          v-if="isActive('/account/settings')"
          name="i-tabler-chevron-left"
          class="size-4 shrink-0"
        />
      </NuxtLink>

      <NuxtLink
        to="/wishlist"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-toned hover:bg-elevated transition text-start"
      >
        <UIcon name="i-tabler-heart" class="size-5 shrink-0" />
        <span class="flex-1">{{ $t('علاقه‌مندی‌ها') }}</span>
        <UBadge
          v-if="wishlistCount > 0"
          color="neutral"
          variant="subtle"
          size="xs"
          class="num"
        >
          {{ wishlistCount.toLocaleString('fa-IR') }}
        </UBadge>
      </NuxtLink>

      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2.5  text-sm text-muted hover:(bg-error/10 text-primary rounded-xl) transition text-start border-t border-muted mt-3 pt-3 text-error"
        @click="onLogout"
      >
        <UIcon name="i-tabler-logout" class="size-5 shrink-0  text-error" />
        <span   class="text-error" >{{ $t('خروج از حساب') }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { accountNavItems } from '~/data/account'

const route = useRoute()
const { wishlistCount } = useShop()
const { requestLogout } = useAccountLogout()
const { profile, fullName, avatarInitial } = useAccount()

function isActive(to: string) {
  if (to === '/account') {
    return route.path === '/account' || route.path === '/account/'
  }
  return route.path === to || route.path.startsWith(`${to}/`)
}

function onLogout() {
  requestLogout()
}
</script>
