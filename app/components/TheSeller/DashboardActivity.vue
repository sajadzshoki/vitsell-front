<template>
  <div class="bg-default border border-muted rounded-2xl p-5">
    <div class="flex items-center justify-between mb-4 gap-2">
      <h3 class="font-bold text-highlighted">
        {{ $t('فعالیت اخیر') }}
      </h3>
      <NuxtLink
        v-if="can('audit.view')"
        to="/seller/audit"
        class="text-xs text-primary font-medium hover:underline cursor-pointer"
      >
        {{ $t('مشاهده همه') }}
      </NuxtLink>
    </div>
    <div
      v-if="!items.length"
      class="text-sm text-muted py-6 text-center"
    >
      {{ $t('هنوز فعالیتی ثبت نشده') }}
    </div>
    <ul
      v-else
      class="space-y-3"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-3"
      >
        <div class="size-8 rounded-xl bg-muted grid place-items-center shrink-0 text-toned">
          <UIcon
            name="i-tabler-history"
            class="size-4"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-highlighted leading-6">
            {{ item.summary }}
          </p>
          <p class="text-[11px] text-muted mt-0.5">
            {{ item.actorName }}
            ·
            <span class="num">{{ formatRelative(item.createdAt) }}</span>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SellerAuditLog } from '~/data/seller-audit'

defineProps<{
  items: SellerAuditLog[]
}>()

const { can } = useSellerPermissions()

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diff / 60_000))
  if (mins < 60) return `${mins.toLocaleString('fa-IR')} دقیقه پیش`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `${hours.toLocaleString('fa-IR')} ساعت پیش`
  const days = Math.round(hours / 24)
  return `${days.toLocaleString('fa-IR')} روز پیش`
}
</script>
