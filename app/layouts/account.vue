<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col">
    <TheNavbar />
    <div
      class="mx-auto max-w-8xl w-full px-3 py-4 sm:px-4 lg:px-6 flex-1 pb-4"
      :class="isMobile ? 'pt-2' : ''"
    >
      <nav class="hidden md:flex items-center gap-2 text-xs text-muted mb-4 flex-wrap">
        <NuxtLink
          to="/"
          class="hover:text-primary transition"
        >
          {{ $t('خانه') }}
        </NuxtLink>
        <span class="text-dimmed">/</span>
        <NuxtLink
          v-if="!isDashboard"
          to="/account"
          class="hover:text-primary transition"
        >
          {{ $t('حساب کاربری') }}
        </NuxtLink>
        <template v-else>
          <span class="text-toned">{{ $t('حساب کاربری') }}</span>
        </template>
        <template v-if="!isDashboard">
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="pageTitle">
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
      </nav>

      <TheAccountMobileHeader
        v-if="isMobile"
        :title="pageTitle"
      />

      <div
        class="grid grid-cols-1 gap-5"
        :class="showDesktopSidebar ? 'lg:grid-cols-12' : ''"
      >
        <aside
          v-if="showDesktopSidebar"
          class="hidden lg:(block col-span-3 sticky top-36 self-start)"
        >
          <TheAccountSidebar />
        </aside>
        <section
          class="min-w-0"
          :class="showDesktopSidebar ? 'lg:col-span-9' : ''"
        >
          <slot />
        </section>
      </div>
    </div>

    <TheFooter class="pb-20 md:pb-0" />
    <TheBottomNav />

    <UDrawer
      v-model:open="mobileNavOpen"
      direction="right"
      :title="$t('منوی حساب')"
      :handle="false"
      close
      :ui="{ content: 'max-w-sm w-[min(88vw,22rem)]' }"
    >
      <template #body>
        <TheAccountSidebar
          embedded
          @navigate="mobileNavOpen = false"
        />
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
const { isMobile, isDashboard, pageTitle, showDesktopSidebar } = useAccountLayout()
const mobileNavOpen = useState('account-mobile-nav-open', () => false)

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  },
)
</script>
