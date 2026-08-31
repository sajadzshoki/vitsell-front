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
          {{ $t('پنل مدیریت') }}
        </NuxtLink>
        <template v-else>
          <span class="text-toned">{{ $t('پنل مدیریت') }}</span>
        </template>
        <template v-if="isOrderDetail">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/orders"
            class="hover:text-primary transition"
          >
            {{ $t('سفارش‌ها') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t('جزئیات سفارش') }}</span>
        </template>
        <template v-else-if="isProductCreate || isProductDetail">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/products"
            class="hover:text-primary transition"
          >
            {{ $t('محصولات') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="isCategoryCreate || isCategoryEdit">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/categories"
            class="hover:text-primary transition"
          >
            {{ $t('دسته‌بندی‌ها') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="isBannerCreate || isBannerEdit">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/banners"
            class="hover:text-primary transition"
          >
            {{ $t('بنرها') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="isDealCreate || isDealEdit">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/deals"
            class="hover:text-primary transition"
          >
            {{ $t('شگفت‌انگیزها') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="isNotificationCreate">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/notifications"
            class="hover:text-primary transition"
          >
            {{ $t('اعلان‌ها') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="isPromotionChild">
          <span class="text-dimmed">/</span>
          <NuxtLink
            to="/seller/promotions"
            class="hover:text-primary transition"
          >
            {{ $t('تخفیف و پروموشن') }}
          </NuxtLink>
          <span class="text-dimmed">/</span>
          <span class="text-toned">{{ $t(pageTitle) }}</span>
        </template>
        <template v-else-if="!isDashboard">
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

      <!-- <ThePanelSwitch
        v-if="isMobile"
        class="mb-4 p-3 bg-default border border-muted rounded-2xl"
      /> -->

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
const {
  isMobile,
  isDashboard,
  isOrderDetail,
  isProductCreate,
  isProductDetail,
  isCategoryCreate,
  isCategoryEdit,
  isBannerCreate,
  isBannerEdit,
  isDealCreate,
  isDealEdit,
  isNotificationCreate,
  isPromotionChild,
  pageTitle,
  showDesktopSidebar,
} = useSellerLayout()
const { fetchSeller } = useSeller()

// Prefetch for all seller subpages; dashboard does its own force refresh + loading UI.
if (!sellerLoaded.value) {
  await useAsyncData('seller-panel', () => fetchSeller())
}
</script>
