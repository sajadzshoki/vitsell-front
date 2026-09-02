<template>
  <div v-if="!ready">
    <TheSkeleton variant="dashboard" />
  </div>

  <div
    v-else
    class="space-y-4 sm:space-y-5"
  >
    <!-- Welcome -->
    <section class="relative overflow-hidden rounded-2xl bg-primary p-5 sm:p-6 text-inverted [--ui-text-inverted:white]">
      <div class="relative z-10 flex flex-col sm:(flex-row items-end justify-between) gap-4">
        <div class="min-w-0 max-w-xl">
          <h2 class="text-xl md:text-2xl font-bold mb-1.5">
            {{ $t('سلام') }}
            <span v-if="profile.firstName">{{ profile.firstName }}،</span>
            {{ $t('خوش آمدید') }}
          </h2>
          <p class="text-sm leading-7 text-inverted/85">
            {{ welcomeSubtitle }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <UButton
            to="/account/orders"
            color="neutral"
            variant="solid"
            size="sm"
            class="!bg-default !text-primary hover:!bg-default/90 font-bold"
            leading-icon="i-tabler-package"
          >
            {{ $t('سفارش‌ها') }}
          </UButton>
          <UButton
            to="/"
            color="neutral"
            variant="outline"
            size="sm"
            class="!border-default/35 !text-inverted !bg-default/10 font-medium"
            leading-icon="i-tabler-shopping-bag"
          >
            {{ $t('شروع خرید') }}
          </UButton>
        </div>
      </div>
      <UIcon
        name="i-tabler-sparkles"
        class="absolute -bottom-8 -start-6 size-40 text-inverted/10 pointer-events-none"
      />
    </section>

    <TheAccountStatCards />

    <TheAccountDashboardQuickActions />

    <TheAccountDashboardSummary />

    <!-- Recent orders -->
    <section class="bg-default border border-muted rounded-2xl p-4 sm:p-5">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="font-bold text-highlighted">
          {{ $t('آخرین سفارش‌های شما') }}
        </h3>
        <NuxtLink
          to="/account/orders"
          class="text-xs text-primary font-medium hover:underline cursor-pointer"
        >
          {{ $t('مشاهده همه') }}
          <UIcon
            name="i-tabler-chevron-left"
            class="size-3.5 inline-block align-[-2px]"
          />
        </NuxtLink>
      </div>

      <div
        v-if="orders.length === 0"
        class="text-center py-10"
      >
        <UIcon
          name="i-tabler-package-off"
          class="size-12 text-dimmed mx-auto mb-3"
        />
        <p class="text-sm text-muted mb-4">{{ $t('هنوز سفارشی ثبت نکرده‌اید') }}</p>
        <UButton
          to="/"
          color="primary"
          size="md"
          class="font-bold"
        >
          {{ $t('شروع خرید') }}
        </UButton>
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <TheAccountOrderRow
          v-for="order in recentOrders"
          :key="order.id"
          :order="order"
        />
      </div>
    </section>

    <TheAccountDashboardWishlist />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const {
  profile,
  orders,
  ordersLoaded,
  activeOrdersCount,
  fetchOrders,
  fetchProfile,
  profileLoaded,
} = useAccount()
const checkoutStore = useCheckoutStore()
const { fetchWallet } = useAccountWallet()
const { fetchMyReviews } = useAccountReviews()
const { fetchWishlist, wishlistCount } = useShop()

const ready = ref(false)

const recentOrders = computed(() => orders.value.slice(0, 3))

const welcomeSubtitle = computed(() => {
  if (activeOrdersCount.value > 0) {
    const n = activeOrdersCount.value.toLocaleString('fa-IR')
    return `${t('شما')} ${n} ${t('سفارش در جریان دارید؛ از اینجا وضعیت را پیگیری کنید.')}`
  }
  if (wishlistCount.value > 0) {
    return t('علاقه‌مندی‌ها و کیف پولتان آماده‌اند؛ هر وقت خواستید خرید را ادامه دهید.')
  }
  return t('از اینجا سفارش‌ها، کیف پول، آدرس‌ها و علاقه‌مندی‌های خود را مدیریت کنید.')
})

onMounted(async () => {
  ready.value = false
  try {
    await Promise.all([
      ordersLoaded.value ? Promise.resolve() : fetchOrders(),
      profileLoaded.value ? Promise.resolve() : fetchProfile(),
      checkoutStore.addressesLoaded ? Promise.resolve() : checkoutStore.fetchAddresses(),
      fetchWallet(),
      fetchMyReviews(),
      fetchWishlist(),
    ])
  }
  finally {
    ready.value = true
  }
})
</script>
