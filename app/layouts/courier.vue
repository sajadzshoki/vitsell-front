<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col pt-[env(safe-area-inset-top)]">
    <header
      v-if="showHeader"
      class="sticky top-0 z-20 bg-default border-b border-muted"
    >
      <div class="max-w-[480px] mx-auto h-14 px-4 flex items-center gap-2">
        <UButton
          v-if="isDetail"
          to="/courier"
          color="neutral"
          variant="ghost"
          size="lg"
          icon="i-tabler-chevron-right"
          class="cursor-pointer min-h-11 min-w-11"
          :aria-label="$t('بازگشت')"
        />
        <h1 class="text-base font-bold text-highlighted truncate">
          {{ $t(title) }}
        </h1>
      </div>
    </header>

    <main
      class="flex-1 w-full max-w-[480px] mx-auto"
      :class="showTabs ? 'pb-24' : 'pb-6'"
    >
      <slot />
    </main>

    <nav
      v-if="showTabs"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-muted bg-default pb-[env(safe-area-inset-bottom)]"
    >
      <div class="max-w-[480px] mx-auto grid grid-cols-2 py-2">
        <NuxtLink
          to="/courier"
          class="min-h-11 flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer"
          :class="isOrders ? 'text-primary' : 'text-muted'"
        >
          <UIcon
            name="i-tabler-package"
            class="size-5"
          />
          {{ $t('سفارش‌ها') }}
        </NuxtLink>
        <NuxtLink
          to="/courier/profile"
          class="min-h-11 flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer"
          :class="isProfile ? 'text-primary' : 'text-muted'"
        >
          <UIcon
            name="i-tabler-user"
            class="size-5"
          />
          {{ $t('حساب') }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const isLogin = computed(() => route.path.startsWith('/courier/login'))
const isDetail = computed(() => /^\/courier\/orders\/[^/]+/.test(route.path))
const isProfile = computed(() => route.path.startsWith('/courier/profile'))
const isOrders = computed(() => !isLogin.value && !isDetail.value && !isProfile.value)
const showTabs = computed(() => !isLogin.value && !isDetail.value)
const showHeader = computed(() => !isLogin.value)
const title = computed(() => {
  if (isDetail.value) return 'جزئیات سفارش'
  if (isProfile.value) return 'حساب پیک'
  return 'سفارش‌های من'
})
</script>
