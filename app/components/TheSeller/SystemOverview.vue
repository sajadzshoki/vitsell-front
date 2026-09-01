<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-6">
    <TheSellerPageHeader
      :title="$t('نمای سیستم')"
      :description="$t('خلاصه وضعیت پنل مدیریت، محتوا و یکپارچه‌سازی‌ها')"
    />

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
            <span class="num font-medium">{{ listings.length.toLocaleString('fa-IR') }}</span>
          </li>
          <li class="flex items-center justify-between gap-2">
            <span class="text-toned">{{ $t('سفارش‌ها') }}</span>
            <span class="num font-medium">{{ orders.length.toLocaleString('fa-IR') }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-muted border border-muted rounded-2xl p-4">
        <h3 class="font-bold text-highlighted mb-3">
          {{ $t('یکپارچه‌سازی') }}
        </h3>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium text-highlighted">
                {{ $t('زرین‌پال') }}
              </div>
              <div class="text-[11px] text-muted mt-0.5">
                {{ $t('وضعیت از تنظیمات درگاه‌ها خوانده می‌شود') }}
              </div>
            </div>
            <UBadge
              color="info"
              variant="subtle"
              size="xs"
            >
              {{ $t('زنده') }}
            </UBadge>
          </li>
          <li class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium text-highlighted">
                {{ $t('پیامک') }}
              </div>
            </div>
            <UBadge
              color="neutral"
              variant="subtle"
              size="xs"
            >
              {{ $t('پیکربندی نشده') }}
            </UBadge>
          </li>
          <li class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium text-highlighted">
                {{ $t('ایمیل تراکنشی') }}
              </div>
            </div>
            <UBadge
              color="neutral"
              variant="subtle"
              size="xs"
            >
              {{ $t('پیکربندی نشده') }}
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
        v-if="!recentLogs.length"
        icon="i-tabler-clipboard-list"
        :message="$t('رویدادی ثبت نشده')"
      />
      <ul
        v-else
        class="space-y-2"
      >
        <li
          v-for="log in recentLogs"
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
  </div>
</template>

<script setup lang="ts">
import { sellerAllPermissions } from '~/data/seller-permissions'

const { admins, ensureLoaded: ensureAdmins } = useSellerAdmins()
const { roles, ensureLoaded: ensureRoles } = useSellerRoles()
const { recent, ensureLoaded: ensureAudit } = useSellerAudit()
const { listings, orders } = useSeller()

ensureAdmins()
ensureRoles()
ensureAudit()

const recentLogs = computed(() => recent(6))

const activeAdmins = computed(() => admins.value.filter(a => a.status === 'active').length)

const statCards = computed(() => [
  {
    id: 'admins',
    label: 'ادمین‌ها',
    value: admins.value.length.toLocaleString('fa-IR'),
    hint: `${activeAdmins.value.toLocaleString('fa-IR')} فعال`,
  },
  {
    id: 'roles',
    label: 'نقش‌ها',
    value: roles.value.length.toLocaleString('fa-IR'),
    hint: '',
  },
  {
    id: 'perms',
    label: 'مجوزهای کاتالوگ',
    value: sellerAllPermissions.length.toLocaleString('fa-IR'),
    hint: '',
  },
  {
    id: 'audit',
    label: 'رویداد حسابرسی',
    value: recentLogs.value.length.toLocaleString('fa-IR'),
    hint: 'نمایش اخیر',
  },
])
</script>
