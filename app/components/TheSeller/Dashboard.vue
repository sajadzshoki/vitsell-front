<template>
  <div class="space-y-5">
    <div
      v-if="loading"
      class="space-y-5"
    >
      <USkeleton class="h-28 rounded-2xl" />
      <USkeleton class="h-28 rounded-2xl" />
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <USkeleton
          v-for="n in 8"
          :key="n"
          class="h-28 rounded-2xl"
        />
      </div>
      <USkeleton class="h-72 rounded-2xl" />
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
        <div class="flex flex-col lg:(flex-row items-end justify-between) gap-4 relative z-10">
          <div>
            <h2 class="text-xl md:text-2xl font-bold mb-2 text-inverted">
              {{ $t('سلام') }} {{ profile.firstName }}، {{ $t('به پنل مدیریت خوش آمدید') }}
            </h2>
            <p class="text-sm leading-7 text-inverted/90 max-w-xl">
              {{ $t('نمای کلی فروش، سفارش‌ها، موجودی و موارد نیازمند توجه') }}
              {{ shop.name }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge
              color="neutral"
              variant="solid"
              class="bg-inverted/15 text-inverted border-0"
            >
              {{ $t(adminRoleLabel) }}
            </UBadge>
            <UButton
              to="/seller/account"
              color="neutral"
              variant="solid"
              class="bg-inverted/15 hover:bg-inverted/25 text-inverted border-0 cursor-pointer"
              size="sm"
              icon="i-tabler-user"
            >
              {{ $t('حساب ادمین') }}
            </UButton>
          </div>
        </div>
        <UIcon
          name="i-tabler-building-store"
          class="absolute -bottom-10 -start-10 size-44 text-inverted/15 pointer-events-none"
        />
      </div>

      <TheSellerDashboardKpis :items="kpis" />

      <TheSellerDashboardQuickActions :actions="quickActions" />

      <TheSellerDashboardCharts
        v-if="can('analytics.view') || can('dashboard.view')"
        v-model:range="range"
        :sales="salesSeries"
        :orders="ordersSeries"
        :status-distribution="orderStatusDistribution"
        :top-products="topProducts"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TheSellerDashboardAlerts :alerts="alerts" />
        <TheSellerDashboardActivity :items="activity" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3">
            {{ $t('مشتریان') }}
          </h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-muted text-[11px]">
                {{ $t('کل') }}
              </div>
              <div class="font-bold num text-highlighted">
                {{ customerStats.total.toLocaleString('fa-IR') }}
              </div>
            </div>
            <div>
              <div class="text-muted text-[11px]">
                {{ $t('جدید') }}
              </div>
              <div class="font-bold num text-highlighted">
                {{ customerStats.new.toLocaleString('fa-IR') }}
              </div>
            </div>
            <div>
              <div class="text-muted text-[11px]">
                {{ $t('فعال') }}
              </div>
              <div class="font-bold num text-highlighted">
                {{ customerStats.active.toLocaleString('fa-IR') }}
              </div>
            </div>
            <div>
              <div class="text-muted text-[11px]">
                {{ $t('بازگشتی') }}
              </div>
              <div class="font-bold num text-highlighted">
                {{ customerStats.returning.toLocaleString('fa-IR') }}
              </div>
            </div>
          </div>
          <p class="text-[10px] text-muted mt-3">
            {{ $t('تا راه‌اندازی ماژول مشتریان — داده نمونه') }}
          </p>
        </div>

        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3">
            {{ $t('بازاریابی فعال') }}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('بنرها') }}</span>
              <span class="num font-medium">{{ activeMarketing.activeBanners.toLocaleString('fa-IR') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('شگفت‌انگیزها') }}</span>
              <span class="num font-medium">{{ activeMarketing.activeDeals.toLocaleString('fa-IR') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('کد تخفیف') }}</span>
              <span class="num font-medium">{{ activeMarketing.activeCodes.toLocaleString('fa-IR') }}</span>
            </div>
          </div>
        </div>

        <div class="bg-default border border-muted rounded-2xl p-5">
          <h3 class="font-bold text-highlighted mb-3">
            {{ $t('موجودی') }}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('کل موجودی') }}</span>
              <span class="num font-medium">{{ totalStock.toLocaleString('fa-IR') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('ارزش تقریبی') }}</span>
              <span class="num font-medium">{{ formatPrice(inventoryValue) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{{ $t('هشدار کمبود') }}</span>
              <span class="num font-medium text-warning">{{ lowStockListings.length.toLocaleString('fa-IR') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="can('orders.view')"
        class="bg-default border border-muted rounded-2xl p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-highlighted">
            {{ $t('آخرین سفارش‌ها') }}
          </h3>
          <NuxtLink
            to="/seller/orders"
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

      <!-- Mobile nav is via hamburger drawer in seller layout -->
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { sellerSystemRoleMeta } from '~/data/seller-roles'

const { t } = useI18n()
const toast = useAppToast()
const { isMobile } = useDevice()
const { profile, profileLoaded, fetchProfile } = useAccount()
const { shop, shopInitial, orders, fetchSeller } = useSeller()
const { can, adminRole } = useSellerPermissions()
const {
  range,
  hydrateSideData,
  kpis,
  salesSeries,
  ordersSeries,
  orderStatusDistribution,
  topProducts,
  alerts,
  quickActions,
  activity,
  customerStats,
  activeMarketing,
  totalStock,
  inventoryValue,
  lowStockListings,
} = useSellerDashboard()

const loading = ref(true)
const recentOrders = computed(() => orders.value.slice(0, 3))

const adminRoleLabel = computed(() => {
  const key = adminRole.value
  if (key && key in sellerSystemRoleMeta) {
    return sellerSystemRoleMeta[key as keyof typeof sellerSystemRoleMeta].name
  }
  return 'ادمین'
})

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
    hydrateSideData()
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری پنل مدیریت ناموفق بود')))
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
