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
      <div class="w-64 bg-default border border-muted rounded-2xl shadow-xl overflow-hidden py-1.5">
        <template v-if="isLoggedIn">
          <NuxtLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="w-full flex items-center gap-3 px-3 py-2 mx-0 text-sm text-start text-toned hover:(bg-primary/10 text-primary) transition-all  no-underline"
            @click="close"
          >
            <span class="size-8 rounded-lg grid place-items-center shrink-0 bg-muted text-toned">
              <UIcon :name="item.icon" class="size-4" />
            </span>
            <span class="font-medium">{{ item.label }}</span>
          </NuxtLink>
          <div class="h-px bg-muted my-1.5 mx-3" />
        </template>
        <button
          v-else
          type="button"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-start text-toned hover:(bg-primary/10 text-primary) transition"
          @click="doLogin"
        >
          <span class="size-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
            <UIcon name="i-tabler-login" class="size-4" />
          </span>
          <span class="font-medium">{{ $t('ورود به حساب کاربری') }}</span>
        </button>

        <!-- Theme -->
        <div class="px-3 py-2">
          <div class="flex items-center gap-2.5 rounded-xl bg-muted/70 p-2">
            <span
              class="size-8 rounded-lg grid place-items-center shrink-0 transition-colors"
              :class="isDark ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'"
            >
              <UIcon :name="isDark ? 'i-tabler-moon-stars' : 'i-tabler-sun'" class="size-4" />
            </span>
            <div class="flex-1 min-w-0 text-start">
              <div class="text-xs font-medium text-default leading-tight">
                {{ isDark ? $t('حالت تاریک') : $t('حالت روشن') }}
              </div>
              <div class="text-[10px] text-muted mt-0.5 leading-tight">
                {{ $t('ظاهر برنامه') }}
              </div>
            </div>
            <div
              class="relative flex items-center shrink-0 p-0.5 rounded-full bg-default border border-muted"
              role="group"
              :aria-label="$t('تغییر تم')"
            >
              <button
                type="button"
                class="size-7 rounded-full grid place-items-center transition"
                :class="!isDark
                  ? 'bg-warning/20 text-warning shadow-sm'
                  : 'text-dimmed hover:text-toned'"
                :aria-label="$t('حالت روشن')"
                :aria-pressed="!isDark"
                @click="setPreference('light')"
              >
                <UIcon name="i-tabler-sun" class="size-3.5" />
              </button>
              <button
                type="button"
                class="size-7 rounded-full grid place-items-center transition"
                :class="isDark
                  ? 'bg-primary/20 text-primary shadow-sm'
                  : 'text-dimmed hover:text-toned'"
                :aria-label="$t('حالت تاریک')"
                :aria-pressed="isDark"
                @click="setPreference('dark')"
              >
                <UIcon name="i-tabler-moon" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Logout -->
        <template v-if="isLoggedIn">
          <div class="h-px bg-muted my-1.5 mx-3" />
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2 mb-0.5 text-sm text-start text-error hover:bg-error/10 transition"
            @click="onLogout"
          >
            <span class="size-8 rounded-lg grid place-items-center shrink-0 bg-error/10 text-error">
              <UIcon name="i-tabler-logout" class="size-4" />
            </span>
            <span class="flex-1 font-medium">{{ $t('خروج از حساب') }}</span>
            <UIcon name="i-tabler-chevron-left" class="size-3.5 text-error/50 shrink-0" />
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
const { isDark, setPreference } = useColorModeTransition()

const menuOpen = ref(false)
const accountRef = ref<HTMLElement | null>(null)

const links = computed(() => [
  { label: t('پیشخوان'), icon: 'i-tabler-layout-dashboard', to: '/account' },
  { label: t('علاقه‌مندی‌ها'), icon: 'i-tabler-heart', to: '/account/wishlist' },
  { label: t('سفارش‌های من'), icon: 'i-tabler-package', to: '/account/orders' },
  { label: t('کیف پول'), icon: 'i-tabler-wallet', to: '/account/wallet' },
  { label: t('نظرات و پرسش‌ها'), icon: 'i-tabler-message-2', to: '/account/reviews' },
  { label: t('آدرس‌ها'), icon: 'i-tabler-map-pin', to: '/account/addresses' },
  { label: t('اطلاعات حساب'), icon: 'i-tabler-user', to: '/account/profile' },
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
