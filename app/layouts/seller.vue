<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col">
    <TheNavbar />
    <div
      class="mx-auto max-w-8xl w-full px-3 py-4 sm:px-4 lg:px-6 flex-1 pb-24 md:pb-4"
      :class="isMobile && !isDashboard ? 'pt-2' : ''"
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
          to="/seller"
          class="hover:text-primary transition"
        >
          {{ $t('پنل فروشنده') }}
        </NuxtLink>
        <template v-else>
          <span class="text-toned">{{ $t('پنل فروشنده') }}</span>
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

      <TheSellerMobileHeader
        v-if="isMobile && !isDashboard"
        :title="pageTitle"
      />

      <ThePanelSwitch
        v-if="isMobile"
        class="mb-4 p-3 bg-default border border-muted rounded-2xl"
      />

      <div
        class="grid grid-cols-1 gap-5"
        :class="showDesktopSidebar ? 'lg:grid-cols-12' : ''"
      >
        <aside
          v-if="showDesktopSidebar"
          class="hidden lg:(block col-span-3 sticky top-36 self-start)"
        >
          <TheSellerSidebar />
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
  </div>
</template>

<script setup lang="ts">
const { isMobile, isDashboard, pageTitle, showDesktopSidebar } = useSellerLayout()
</script>
