<template>
  <div class="space-y-5">
    <div
      v-if="loading"
      class="space-y-5"
    >
      <USkeleton class="h-28 rounded-2xl" />
      <USkeleton class="h-24 rounded-2xl" />
      <USkeleton class="h-52 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <div
        v-if="isMobile"
        class="flex items-center gap-3 pb-1"
      >
        <div
          class="size-14 rounded-2xl bg-primary text-inverted grid place-items-center text-xl font-bold shrink-0"
        >
          {{ shopInitial }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold text-highlighted truncate">
            {{ shop.name }}
          </div>
          <div class="text-xs text-muted">
            {{ $t(shop.city || '') }} · {{ $t('از') }} {{ shop.joinDate }}
          </div>
        </div>
      </div>

      <div class="rounded-2xl p-5 sm:p-6 relative overflow-hidden bg-primary">
        <h2 class="text-xl md:text-2xl font-bold mb-2 text-inverted">
          {{ $t('سلام') }} {{ profile.firstName }}، {{ $t('به پنل فروشنده خوش آمدید') }}
        </h2>
        <p class="text-sm leading-7 text-inverted/90 max-w-xl">
          {{ $t('از اینجا محصولات، سفارش‌ها، نظرات و تسویه حساب فروشگاه') }}
          {{ shop.name }}
          {{ $t('را مدیریت کنید.') }}
        </p>
        <UIcon
          name="i-tabler-building-store"
          class="absolute -bottom-10 -start-10 size-44 text-inverted/15 pointer-events-none"
        />
      </div>

      <TheSellerStatCards />

      <TheSellerSalesChart />

      <div
        v-if="lowStockListings.length"
        class="bg-default border border-muted rounded-2xl p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-highlighted">
            {{ $t('موجودی رو به اتمام') }}
          </h3>
          <NuxtLink
            to="/seller/products"
            class="text-xs text-primary font-medium hover:underline cursor-pointer"
          >
            {{ $t('مدیریت موجودی') }}
            <UIcon name="i-tabler-chevron-left" class="size-3.5 inline-block align-[-2px]" />
          </NuxtLink>
        </div>
        <div class="space-y-2">
          <NuxtLink
            v-for="item in lowStockItems"
            :key="item.productId"
            :to="`/product/${item.productId}`"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition cursor-pointer"
          >
            <img
              v-if="item.product.image"
              :src="item.product.image"
              :alt="item.product.title"
              class="size-11 rounded-xl object-cover bg-elevated shrink-0"
            >
            <div class="flex-1 min-w-0">
              <div class="text-sm text-highlighted truncate">
                {{ item.product.title }}
              </div>
              <div class="text-[11px] text-warning num">
                {{ item.stock.toLocaleString('fa-IR') }} {{ $t('عدد باقی‌مانده') }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div class="bg-default border border-muted rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-highlighted">
            {{ $t('آخرین سفارش‌های فروشگاه') }}
          </h3>
          <NuxtLink
            to="/seller/orders"
            class="text-xs text-primary font-medium hover:underline cursor-pointer"
          >
            {{ $t('مشاهده همه') }}
            <UIcon name="i-tabler-chevron-left" class="size-3.5 inline-block align-[-2px]" />
          </NuxtLink>
        </div>

        <div
          v-if="recentOrders.length === 0"
          class="text-center py-8 text-sm text-muted"
        >
          {{ $t('هنوز سفارشی برای فروشگاه ثبت نشده') }}
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <TheSellerOrderRow
            v-for="order in recentOrders"
            :key="order.id"
            :order="order"
            compact
          />
        </div>
      </div>

      <TheSellerMobileMenu v-if="isMobile" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useAppToast()
const { isMobile } = useDevice()
const { profile, profileLoaded, fetchProfile } = useAccount()
const { shop, shopInitial, orders, lowStockListings, resolveProduct, fetchSeller } = useSeller()

const loading = ref(true)

const recentOrders = computed(() => orders.value.slice(0, 3))

const lowStockItems = computed(() =>
  lowStockListings.value.map(item => ({
    ...item,
    product: resolveProduct(item.productId),
  })),
)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || error?.message || fallback
}

async function loadDashboard() {
  loading.value = true
  try {
    if (!profileLoaded.value || !profile.value.firstName) {
      await fetchProfile()
    }
    const { ok, error } = await fetchSeller({ force: true })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری پنل فروشنده ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
