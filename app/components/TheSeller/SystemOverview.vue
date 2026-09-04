<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('نمای سیستم')"
      :description="$t('خلاصه وضعیت پنل مدیریت، محتوا و یکپارچه‌سازی‌ها')"
    />

    <div
      v-if="loading && !seededOnce"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="card in statCards"
          :key="card.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="text-[11px] text-muted">
            {{ $t(card.label) }}
          </div>
          <div class="text-xl font-bold text-highlighted mt-1 num">
            {{ card.value }}
          </div>
          <div
            v-if="card.hint"
            class="text-[11px] text-toned mt-1"
          >
            {{ $t(card.hint) }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-muted border border-muted rounded-2xl p-4">
          <h3 class="font-bold text-highlighted mb-3">
            {{ $t('محتوا') }}
          </h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('محصولات') }}</span>
              <span class="num font-medium">{{ stats.products.total.toLocaleString('fa-IR') }}</span>
            </li>
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('سفارش‌ها') }}</span>
              <span class="num font-medium">{{ stats.orders.total.toLocaleString('fa-IR') }}</span>
            </li>
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('وبلاگ') }}</span>
              <span class="num font-medium">{{ stats.blog.total.toLocaleString('fa-IR') }}</span>
            </li>
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('صفحات') }}</span>
              <span class="num font-medium">{{ stats.pages.total.toLocaleString('fa-IR') }}</span>
            </li>
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('رسانه') }}</span>
              <span class="num font-medium">{{ stats.media.total.toLocaleString('fa-IR') }}</span>
            </li>
            <li class="flex items-center justify-between gap-2">
              <span class="text-toned">{{ $t('بنرها') }}</span>
              <span class="num font-medium">{{ stats.banners.total.toLocaleString('fa-IR') }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-muted border border-muted rounded-2xl p-4">
          <h3 class="font-bold text-highlighted mb-3">
            {{ $t('یکپارچه‌سازی') }}
          </h3>
          <ul class="space-y-3 text-sm">
            <li
              v-for="item in overview.integrations"
              :key="item.id"
              class="flex items-start justify-between gap-3"
            >
              <div>
                <div class="font-medium text-highlighted">
                  {{ $t(item.label) }}
                </div>
                <div
                  v-if="item.hint"
                  class="text-[11px] text-muted mt-0.5"
                >
                  {{ $t(item.hint) }}
                </div>
              </div>
              <UBadge
                :color="integrationColor(item.status)"
                variant="subtle"
                size="xs"
              >
                {{ $t(integrationLabel(item.status)) }}
              </UBadge>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-muted border border-muted rounded-2xl p-4">
        <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 class="font-bold text-highlighted">
            {{ $t('رویدادهای اخیر') }}
          </h3>
          <UButton
            to="/seller/audit"
            color="primary"
            variant="soft"
            size="xs"
            class="cursor-pointer"
          >
            {{ $t('لاگ حسابرسی') }}
          </UButton>
        </div>
        <TheSellerEmptyState
          v-if="!displayEvents.length"
          icon="i-tabler-clipboard-list"
          :message="$t('رویدادی ثبت نشده')"
        />
        <ul
          v-else
          class="space-y-2"
        >
          <li
            v-for="log in displayEvents"
            :key="log.id"
            class="text-sm flex items-start justify-between gap-3 flex-wrap"
          >
            <div class="min-w-0">
              <div class="text-highlighted">
                {{ log.summary }}
              </div>
              <div class="text-[11px] text-muted mt-0.5">
                {{ log.actorName }}
              </div>
            </div>
            <div
              class="text-[11px] text-muted num shrink-0"
              dir="ltr"
            >
              {{ log.createdAt.slice(0, 16).replace('T', ' ') }}
            </div>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/seller/settings"
          color="primary"
          variant="soft"
          icon="i-tabler-settings"
          class="cursor-pointer"
        >
          {{ $t('تنظیمات') }}
        </UButton>
        <UButton
          to="/seller/admins"
          color="neutral"
          variant="soft"
          icon="i-tabler-user-shield"
          class="cursor-pointer"
        >
          {{ $t('ادمین‌ها') }}
        </UButton>
        <UButton
          to="/seller/imports"
          color="neutral"
          variant="soft"
          icon="i-tabler-file-import"
          class="cursor-pointer"
        >
          {{ $t('ورود داده') }}
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SellerSystemIntegrationStatus } from '~/composables/useSellerSystem'

const { t } = useI18n()
const toast = useAppToast()
const { overview, fetchOverview } = useSellerSystem()
const { recent, ensureLoaded: ensureAudit } = useSellerAudit()

const loading = ref(false)
const seededOnce = ref(false)

const stats = computed(() => overview.value.stats)

const auditRecent = computed(() => {
  return recent(6).map(log => ({
    id: log.id,
    summary: log.summary,
    actorName: log.actorName,
    createdAt: log.createdAt,
  }))
})

const displayEvents = computed(() => {
  if (overview.value.recentEvents.length) {
    return overview.value.recentEvents.slice(0, 6)
  }
  return auditRecent.value
})

const statCards = computed(() => [
  {
    id: 'admins',
    label: 'ادمین‌ها',
    value: stats.value.admins.total.toLocaleString('fa-IR'),
    hint: `${stats.value.admins.active.toLocaleString('fa-IR')} فعال`,
  },
  {
    id: 'roles',
    label: 'نقش‌ها',
    value: stats.value.roles.total.toLocaleString('fa-IR'),
    hint: '',
  },
  {
    id: 'perms',
    label: 'مجوزهای کاتالوگ',
    value: stats.value.permissions.total.toLocaleString('fa-IR'),
    hint: '',
  },
  {
    id: 'orders',
    label: 'سفارش‌ها',
    value: stats.value.orders.total.toLocaleString('fa-IR'),
    hint: '',
  },
])

function integrationColor(status: SellerSystemIntegrationStatus) {
  if (status === 'live') return 'success' as const
  if (status === 'sandbox' || status === 'mock') return 'info' as const
  return 'neutral' as const
}

function integrationLabel(status: SellerSystemIntegrationStatus) {
  if (status === 'live') return 'زنده'
  if (status === 'sandbox') return 'سندباکس'
  if (status === 'mock') return 'mock'
  return 'پیکربندی نشده'
}

onMounted(async () => {
  loading.value = true
  try {
    const { ok, error } = await fetchOverview({ force: true })
    if (!ok) {
      toast.error(t(error || 'بارگذاری نمای سیستم ناموفق بود'))
      await ensureAudit({ force: true })
    }
    else {
      seededOnce.value = true
    }
  }
  finally {
    loading.value = false
    seededOnce.value = true
  }
})
</script>
