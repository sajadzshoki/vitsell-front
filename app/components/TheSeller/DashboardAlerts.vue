<template>
  <div class="bg-default border border-muted rounded-2xl p-5">
    <h3 class="font-bold text-highlighted mb-4">
      {{ $t('نیاز به توجه') }}
    </h3>
    <div
      v-if="!alerts.length"
      class="text-sm text-muted py-6 text-center"
    >
      {{ $t('مورد فوری برای رسیدگی وجود ندارد') }}
    </div>
    <div
      v-else
      class="space-y-2"
    >
      <NuxtLink
        v-for="alert in alerts"
        :key="alert.id"
        :to="alert.to"
        class="flex items-start gap-3 p-3 rounded-xl border border-muted hover:bg-muted/50 transition cursor-pointer"
      >
        <div
          class="size-9 rounded-xl grid place-items-center shrink-0"
          :class="severityClass(alert.severity)"
        >
          <UIcon
            :name="severityIcon(alert.severity)"
            class="size-4.5"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-highlighted">{{ $t(alert.title) }}</span>
            <UBadge
              v-if="alert.count != null"
              :color="alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'"
              variant="subtle"
              size="xs"
              class="num"
            >
              {{ alert.count.toLocaleString('fa-IR') }}
            </UBadge>
          </div>
          <p class="text-[11px] text-muted mt-0.5 leading-5">
            {{ $t(alert.description) }}
          </p>
        </div>
        <UIcon
          name="i-tabler-chevron-left"
          class="size-4 text-dimmed shrink-0 mt-1"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerDashboardAlert } from '~/data/seller-dashboard'

defineProps<{
  alerts: SellerDashboardAlert[]
}>()

function severityClass(severity: SellerDashboardAlert['severity']) {
  if (severity === 'error') return 'bg-error/15 text-error'
  if (severity === 'warning') return 'bg-warning/15 text-warning'
  return 'bg-info/15 text-info'
}

function severityIcon(severity: SellerDashboardAlert['severity']) {
  if (severity === 'error') return 'i-tabler-alert-circle'
  if (severity === 'warning') return 'i-tabler-alert-triangle'
  return 'i-tabler-info-circle'
}
</script>
