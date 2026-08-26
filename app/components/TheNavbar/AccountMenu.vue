<template>
  <div
    ref="accountRef"
    class="relative"
    @mouseenter="onDesktopEnter"
    @mouseleave="onDesktopLeave"
  >
    <button
      type="button"
      class="hidden md:flex items-center gap-2 h-11 px-3 rounded-xl text-toned hover:bg-elevated transition"
      @click="onTrigger"
    >
      <UIcon name="i-tabler-user" class="size-5 shrink-0 text-toned" />
      <span class="text-sm font-medium text-toned">
        {{ isLoggedIn ? $t('حساب کاربری') : $t('ورود به حساب کاربری') }}
      </span>
      <UIcon
        name="i-tabler-chevron-down"
        class="size-4 text-dimmed transition-transform"
        :class="{ 'rotate-180': menuOpen }"
      />
    </button>

    <button
      type="button"
      class="md:hidden size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition"
      :aria-label="$t('حساب کاربری')"
      @click="onTrigger"
    >
      <UIcon name="i-tabler-user" class="size-5" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute top-full end-0 z-50 pt-2"
    >
      <div class="w-56 bg-default border border-muted rounded-2xl shadow-xl overflow-hidden py-2">
        <template v-if="isLoggedIn">
          <NuxtLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start text-toned hover:bg-primary/10 hover:text-primary transition no-underline"
            @click="close"
          >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
          <div class="h-px bg-muted my-1" />
        </template>
        <button
          v-else
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start text-toned hover:bg-primary/10 hover:text-primary transition"
          @click="doLogin"
        >
          <UIcon name="i-tabler-login" class="size-4 shrink-0" />
          <span>{{ $t('ورود به حساب کاربری') }}</span>
        </button>

        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start text-toned hover:bg-primary/10 hover:text-primary transition"
          @click="toggleTheme"
        >
          <UIcon :name="isDark ? 'i-tabler-sun' : 'i-tabler-moon'" class="size-4 shrink-0" />
          <span>{{ isDark ? $t('حالت روشن') : $t('حالت تاریک') }}</span>
        </button>

        <template v-if="isLoggedIn">
          <div class="h-px bg-muted my-1" />
          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start text-muted hover:bg-primary/10 hover:text-primary transition"
            @click="onLogout"
          >
            <UIcon name="i-tabler-logout" class="size-4 shrink-0" />
            <span>{{ $t('خروج از حساب') }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn } = useShop()
const { requestLogout } = useAccountLogout()
const { isDark, toggle: toggleTheme } = useColorModeTransition()

const menuOpen = ref(false)
const accountRef = ref<HTMLElement | null>(null)

const links = computed(() => [
  { label: t('پیشخوان'), icon: 'i-tabler-layout-dashboard', to: '/account' },
  { label: t('پنل فروشنده'), icon: 'i-tabler-building-store', to: '/seller' },
  { label: t('سفارش‌های من'), icon: 'i-tabler-package', to: '/account/orders' },
  { label: t('علاقه‌مندی‌ها'), icon: 'i-tabler-heart', to: '/wishlist' },
  { label: t('آدرس‌ها'), icon: 'i-tabler-map-pin', to: '/account/addresses' },
  { label: t('اطلاعات حساب'), icon: 'i-tabler-user', to: '/account/profile' },
  { label: t('تنظیمات'), icon: 'i-tabler-settings', to: '/account/settings' },
])

function isDesktop() {
  return import.meta.client && window.matchMedia('(min-width: 768px)').matches
}

function close() {
  menuOpen.value = false
}

function onTrigger() {
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  menuOpen.value = !menuOpen.value
}

function onDesktopEnter() {
  if (!isDesktop() || isLoggedIn.value) return
  menuOpen.value = true
}

function onDesktopLeave() {
  if (!isDesktop() || isLoggedIn.value) return
  menuOpen.value = false
}

function doLogin() {
  close()
  navigateTo('/login')
}

function onLogout() {
  close()
  requestLogout()
}

onClickOutside(accountRef, close)
</script>
