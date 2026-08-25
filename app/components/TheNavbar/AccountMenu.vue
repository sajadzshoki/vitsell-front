<template>
  <div ref="accountRef" class="relative">
    <!-- Desktop trigger — digi-clone: flex items-center gap-2 h-11 -->
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
        v-if="isLoggedIn || menuOpen"
        name="i-tabler-chevron-down"
        class="size-4 text-dimmed transition-transform"
        :class="{ 'rotate-180': menuOpen }"
      />
    </button>

    <!-- Mobile trigger -->
    <button
      type="button"
      class="md:hidden size-11 grid place-items-center rounded-xl text-toned hover:bg-elevated transition"
      :aria-label="$t('حساب کاربری')"
      @click="onTrigger"
    >
      <UIcon name="i-tabler-user" class="size-5" />
    </button>

    <!-- digi-clone: absolute top-full left-0 → RTL end-0 under trigger -->
    <div
      v-if="menuOpen"
      class="absolute top-full end-0 mt-2 w-56 bg-default border border-muted rounded-2xl shadow-xl overflow-hidden z-50 py-2"
    >
      <template v-if="isLoggedIn">
        <button
          v-for="item in links"
          :key="item.label"
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start text-toned hover:bg-primary/10 hover:text-primary transition"
          @click="go(item.to)"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </button>
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
          @click="doLogout"
        >
          <UIcon name="i-tabler-logout" class="size-4 shrink-0" />
          <span>{{ $t('خروج') }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { isLoggedIn, login, logout } = useShop()
const colorMode = useColorMode()

const menuOpen = ref(false)
const accountRef = ref<HTMLElement | null>(null)

const isDark = computed(() => colorMode.value === 'dark')

const links = computed(() => [
  { label: t('پروفایل'), icon: 'i-tabler-user', to: '/account?tab=profile' },
  { label: t('سفارش‌های من'), icon: 'i-tabler-package', to: '/account?tab=orders' },
  { label: t('علاقه‌مندی‌ها'), icon: 'i-tabler-heart', to: '/wishlist' },
  { label: t('آدرس‌ها'), icon: 'i-tabler-map-pin', to: '/account?tab=addresses' },
  { label: t('تنظیمات'), icon: 'i-tabler-settings', to: '/account?tab=profile' },
])

function close() {
  menuOpen.value = false
}

function onTrigger() {
  // digi-clone: if logged out on desktop, login(); we open menu so theme is reachable
  menuOpen.value = !menuOpen.value
}

function doLogin() {
  login()
  close()
}

function doLogout() {
  logout()
  close()
}

function go(to: string) {
  navigateTo(to)
  close()
}

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

onClickOutside(accountRef, close)
</script>
