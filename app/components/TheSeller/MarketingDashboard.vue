<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('داشبورد بازاریابی')"
        :description="$t('نمای کلی تخفیف‌ها، کمپین‌ها، بنرها، کوپن‌ها و اعلان‌ها')"
      >
        <template #actions>
          <div class="flex items-end gap-2 flex-wrap">
            <div class="w-44 min-w-40">
              <TheIRDatePicker
                v-model="rangeStart"
                :header="$t('از تاریخ')"
                :placeholder="$t('انتخاب تاریخ')"
              />
            </div>
            <div class="w-44 min-w-40">
              <TheIRDatePicker
                v-model="rangeEnd"
                :header="$t('تا تاریخ')"
                :placeholder="$t('انتخاب تاریخ')"
              />
            </div>
            <UButton
              v-if="rangeStart || rangeEnd"
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-tabler-filter-off"
              class="cursor-pointer mb-1"
              @click="clearRange"
            >
              {{ $t('پاک کردن بازه') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>

      <p
        v-if="rangeStart || rangeEnd"
        class="text-[11px] text-muted mb-4"
      >
        {{ $t('شمارش‌ها فقط آیتم‌هایی را شامل می‌شود که بازه‌شان با فیلتر هم‌پوشانی دارد.') }}
      </p>

      <div
        v-if="loading || pending"
        class="grid grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <USkeleton
          v-for="n in 6"
          :key="n"
          class="h-28 rounded-2xl"
        />
      </div>

      <template v-else>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <NuxtLink
            v-for="card in kpiCards"
            :key="card.id"
            :to="card.to"
            class="bg-muted border border-muted rounded-2xl p-4 hover:bg-accented/40 transition-all  cursor-pointer"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <div
                class="size-10 rounded-xl grid place-items-center shrink-0"
                :class="toneClass(card.tone)"
              >
                <UIcon
                  :name="card.icon"
                  class="size-5"
                />
              </div>
              <UBadge
                v-if="card.activeLabel"
                :color="card.tone === 'neutral' ? 'neutral' : 'success'"
                variant="subtle"
                size="xs"
              >
                {{ card.activeLabel }}
              </UBadge>
            </div>
            <div class="text-xl font-black text-highlighted num leading-none">
              {{ card.value.toLocaleString('fa-IR') }}
            </div>
            <div class="text-[11px] text-toned mt-2">
              {{ $t(card.label) }}
            </div>
            <div
              v-if="card.hint"
              class="text-[10px] text-muted mt-1"
            >
              {{ card.hint }}
            </div>
          </NuxtLink>
        </div>

        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-muted bg-muted/40 p-4">
            <h3 class="font-bold text-highlighted mb-1">
              {{ $t('مصرف کوپن‌ها') }}
            </h3>
            <p class="text-[11px] text-muted mb-4 leading-6">
              {{ $t('بر اساس سفارش‌های واقعی که کد تخفیف داشته‌اند') }}
            </p>
            <div
              v-if="!summary.coupons.top.length"
              class="text-sm text-muted py-6 text-center"
            >
              {{ $t('کوپنی برای نمایش نیست — یا هنوز داده‌ای ثبت نشده یا بازه فیلتر خالی است.') }}
            </div>
            <div
              v-else
              class="space-y-3"
            >
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="text-muted">{{ $t('کل استفاده‌ها') }}</span>
                <span class="font-bold num text-highlighted">
                  {{ summary.coupons.usageTotal.toLocaleString('fa-IR') }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="text-muted">{{ $t('مجموع مبلغ تخفیف') }}</span>
                <span class="font-bold num text-highlighted">
                  {{ formatPrice(summary.coupons.discountTotal) }} {{ $t('تومان') }}
                </span>
              </div>
              <USeparator />
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="code in summary.coupons.top"
                  :key="code.code"
                  class="flex items-center justify-between gap-2 text-xs"
                >
                  <span
                    class="num text-toned truncate"
                    dir="ltr"
                  >{{ code.code }}</span>
                  <span class="text-muted shrink-0 num">
                    {{ code.usageCount.toLocaleString('fa-IR') }}
                    ·
                    {{ formatPrice(code.totalDiscountAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-muted bg-muted/40 p-4">
            <h3 class="font-bold text-highlighted mb-1">
              {{ $t('دسترسی سریع') }}
            </h3>
            <p class="text-[11px] text-muted mb-4 leading-6">
              {{ $t('ایجاد یا مدیریت بخش‌های بازاریابی') }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UButton
                v-for="action in quickLinks"
                :key="action.to"
                :to="action.to"
                color="neutral"
                variant="soft"
                size="sm"
                :icon="action.icon"
                class="cursor-pointer justify-start"
              >
                {{ $t(action.label) }}
              </UButton>
            </div>
          </div>
        </div>

        <TheSellerEmptyState
          v-if="isCompletelyEmpty"
          class="mt-4"
          icon="i-tabler-chart-dots"
          :message="$t('هنوز هیچ دارایی بازاریابی ثبت نشده است. از لینک‌های سریع شروع کنید.')"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { sellerPermissionCatalog, type SellerPermission } from '~/data/seller-permissions'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { summary, pending, fetchSummary } = useSellerMarketing()

const loading = ref(true)
const rangeStart = ref<string | null>(null)
const rangeEnd = ref<string | null>(null)

function canPerm(key: string) {
  const known = sellerPermissionCatalog.some(p => p.key === key)
  if (!known) return true
  return can(key as SellerPermission)
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadSummary() {
  loading.value = true
  try {
    const { ok, error } = await fetchSummary({
      from: rangeStart.value,
      to: rangeEnd.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری داشبورد بازاریابی ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function clearRange() {
  rangeStart.value = null
  rangeEnd.value = null
}

watch([rangeStart, rangeEnd], () => {
  void loadSummary()
})

onMounted(() => {
  void loadSummary()
})

const kpiCards = computed(() => {
  const k = summary.value.kpis
  const activeLabel = (active: number) =>
    active > 0 ? `${active.toLocaleString('fa-IR')} ${t('فعال')}` : undefined

  return [
    {
      id: 'discounts',
      label: 'تخفیف‌ها',
      value: k.discounts.total,
      activeLabel: activeLabel(k.discounts.active),
      hint: undefined as string | undefined,
      to: '/seller/discounts',
      icon: 'i-tabler-discount',
      tone: 'primary' as const,
    },
    {
      id: 'campaigns',
      label: 'کمپین‌ها',
      value: k.campaigns.total,
      activeLabel: activeLabel(k.campaigns.active),
      hint: undefined as string | undefined,
      to: '/seller/campaigns',
      icon: 'i-tabler-speakerphone',
      tone: 'info' as const,
    },
    {
      id: 'banners',
      label: 'بنرها',
      value: k.banners.total,
      activeLabel: activeLabel(k.banners.active),
      to: '/seller/banners',
      icon: 'i-tabler-photo',
      tone: 'success' as const,
    },
    {
      id: 'deals',
      label: 'شگفت‌انگیزها',
      value: k.deals.total,
      activeLabel: activeLabel(k.deals.active),
      to: '/seller/deals',
      icon: 'i-tabler-bolt',
      tone: 'warning' as const,
    },
    {
      id: 'coupons',
      label: 'کدهای تخفیف',
      value: k.coupons.total,
      activeLabel: activeLabel(k.coupons.active),
      hint: `${summary.value.coupons.usageTotal.toLocaleString('fa-IR')} ${t('استفاده')}`,
      to: '/seller/promotions',
      icon: 'i-tabler-ticket',
      tone: 'primary' as const,
    },
    {
      id: 'promos',
      label: 'پروموهای محتوایی',
      value: k.promos.total,
      activeLabel: activeLabel(k.promos.active),
      to: '/seller/promotions',
      icon: 'i-tabler-ad-2',
      tone: 'neutral' as const,
    },
    {
      id: 'notifications',
      label: 'اعلان‌ها',
      value: k.notifications.total,
      to: '/seller/notifications',
      icon: 'i-tabler-bell',
      tone: 'error' as const,
    },
  ]
})

const isCompletelyEmpty = computed(() => {
  const k = summary.value.kpis
  return (
    !k.banners.total
    && !k.deals.total
    && !k.coupons.total
    && !k.promos.total
    && !k.notifications.total
  )
})

const quickLinks = computed(() => {
  const links = [
    { label: 'تخفیف جدید', to: '/seller/discounts/new', icon: 'i-tabler-plus', show: canPerm('discounts.create') },
    { label: 'کمپین جدید', to: '/seller/campaigns/new', icon: 'i-tabler-speakerphone', show: canPerm('campaigns.create') },
    { label: 'بنر جدید', to: '/seller/banners/new', icon: 'i-tabler-photo', show: canPerm('banners.create') },
    { label: 'شگفت‌انگیز جدید', to: '/seller/deals/new', icon: 'i-tabler-bolt', show: canPerm('deals.create') },
    { label: 'پروموشن‌ها', to: '/seller/promotions', icon: 'i-tabler-discount-2', show: canPerm('promotions.view') },
    { label: 'ارسال اعلان', to: '/seller/notifications/new', icon: 'i-tabler-bell', show: canPerm('notifications.create') },
  ]
  const visible = links.filter(l => l.show)
  if (visible.length) return visible
  return [
    { label: 'تخفیف‌ها', to: '/seller/discounts', icon: 'i-tabler-discount', show: true },
    { label: 'کمپین‌ها', to: '/seller/campaigns', icon: 'i-tabler-speakerphone', show: true },
    { label: 'بنرها', to: '/seller/banners', icon: 'i-tabler-photo', show: true },
    { label: 'پروموشن‌ها', to: '/seller/promotions', icon: 'i-tabler-discount-2', show: true },
  ]
})

function toneClass(tone: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral') {
  const map = {
    primary: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    error: 'bg-error/15 text-error',
    info: 'bg-info/15 text-info',
    neutral: 'bg-elevated text-toned',
  }
  return map[tone]
}
</script>
