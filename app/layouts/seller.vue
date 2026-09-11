<template>
  <div class="min-h-dvh bg-muted text-default flex flex-col">
    <div
      class="mx-auto w-full px-3 py-4 sm:px-4 lg:px-6 flex-1"
      :class="isMobile ? 'pt-2' : ''"
    >
      <div class="flex items-center justify-between gap-3 mb-4">
        <nav class="hidden md:flex items-center gap-2 text-xs text-muted flex-wrap min-w-0">
          <NuxtLink
            to="/seller"
            class="hover:text-primary transition"
          >
            {{ $t('پنل مدیریت') }}
          </NuxtLink>
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
            <span class="text-toned">{{ $t(pageTitle || '') }}</span>
          </template>
          <template v-else-if="isMegaMenuCreate || isMegaMenuEdit">
            <span class="text-dimmed">/</span>
            <NuxtLink
              to="/seller/mega-menus"
              class="hover:text-primary transition"
            >
              {{ $t('مگا منو') }}
            </NuxtLink>
            <span class="text-dimmed">/</span>
            <span class="text-toned">{{ $t(pageTitle || '') }}</span>
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
            <span class="text-toned">{{ $t(pageTitle || '') }}</span>
          </template>
          <template v-else-if="isBlogCreate || isBlogEdit">
            <span class="text-dimmed">/</span>
            <NuxtLink
              to="/seller/blog"
              class="hover:text-primary transition"
            >
              {{ $t('وبلاگ') }}
            </NuxtLink>
            <span class="text-dimmed">/</span>
            <span class="text-toned">{{ $t(pageTitle || '') }}</span>
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
          <template v-else-if="isAdminChild">
            <span class="text-dimmed">/</span>
            <NuxtLink
              to="/seller/admins"
              class="hover:text-primary transition"
            >
              {{ $t('کاربران ادمین') }}
            </NuxtLink>
            <span class="text-dimmed">/</span>
            <span class="text-toned">{{ $t(pageTitle) }}</span>
          </template>
          <template v-else-if="isRoleChild">
            <span class="text-dimmed">/</span>
            <NuxtLink
              to="/seller/roles"
              class="hover:text-primary transition"
            >
              {{ $t('نقش‌ها و دسترسی‌ها') }}
            </NuxtLink>
            <span class="text-dimmed">/</span>
            <span class="text-toned">{{ $t(pageTitle) }}</span>
          </template>
          <template v-else-if="!isDashboard">
            <span class="text-dimmed">/</span>
            <span class="text-toned">{{ $t(pageTitle || '') }}</span>
          </template>
        </nav>

        <div class="flex items-center gap-2 ms-auto shrink-0">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            :icon="isDark ? 'i-tabler-moon-stars' : 'i-tabler-sun'"
            class="cursor-pointer"
            :aria-label="isDark ? $t('تغییر به حالت روشن') : $t('تغییر به حالت تاریک')"
            :title="isDark ? $t('حالت تاریک') : $t('حالت روشن')"
            @click="toggleColorMode"
          />
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-search"
            class="cursor-pointer"
            :aria-label="$t('جستجو در پنل')"
            @click="commandOpen = true"
          >
            <span class="hidden sm:inline">{{ $t('جستجو') }}</span>
            <kbd class="ms-2 text-[10px] text-muted num hidden lg:inline">Ctrl+K</kbd>
          </UButton>
        </div>
      </div>

      <TheSellerMobileHeader
        v-if="isMobile"
        :title="pageTitle"
      />

      <div
        class="grid grid-cols-1 gap-5"
        :class="showDesktopSidebar ? 'lg:grid-cols-10' : ''"
      >
        <aside
          v-if="showDesktopSidebar"
          class="hidden lg:(block col-span-2 sticky top-4 self-start)"
        >
          <TheSellerSidebar />
        </aside>
        <section
          class="min-w-0"
          :class="showDesktopSidebar ? 'lg:col-span-8' : ''"
        >
          <slot />
        </section>
      </div>
    </div>

    <TheSellerCommandPalette />

    <UDrawer
      v-model:open="mobileNavOpen"
      direction="right"
      :title="$t('منوی پنل')"
      :handle="false"
      close
      :ui="{ content: 'max-w-sm w-[min(88vw,22rem)]' }"
    >
      <template #body>
        <TheSellerSidebar
          embedded
          @navigate="mobileNavOpen = false"
        />
      </template>
    </UDrawer>
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
  isMegaMenuCreate,
  isMegaMenuEdit,
  isBannerCreate,
  isBannerEdit,
  isBlogCreate,
  isBlogEdit,
  isDealCreate,
  isDealEdit,
  isNotificationCreate,
  isPromotionChild,
  isAdminChild,
  isRoleChild,
  pageTitle,
  showDesktopSidebar,
} = useSellerLayout()
const { fetchSeller } = useSeller()
const route = useRoute()

const commandOpen = useState('seller-command-palette-open', () => false)
const mobileNavOpen = useState('seller-mobile-nav-open', () => false)
const { isDark, toggle: toggleColorMode } = useColorModeTransition()

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  },
)

// Always register useAsyncData (never behind a branch). fetchSeller short-circuits when loaded.
await useAsyncData('seller-panel', async () => {
  const { ok } = await fetchSeller()
  return ok
})
</script>
