<template>
  <div class="grid grid-cols-3 lg:grid-cols-5 gap-3">
    <component
      :is="item.to ? NuxtLink : 'div'"
      v-for="item in items"
      :key="item.id"
      :to="item.to"
      class="bg-default border border-muted rounded-2xl p-4 transition"
      :class="item.to ? 'hover:bg-muted/50 cursor-pointer' : ''"
    >
      <div class="flex items-start justify-between gap-2 mb-3">
        <div
          class="size-10 rounded-xl grid place-items-center shrink-0"
          :class="toneClass(item.tone)"
        >
          <UIcon
            :name="item.icon"
            class="size-5"
          />
        </div>
        <span
          v-if="item.delta != null"
          class="text-[11px] font-medium num"
          :class="item.delta >= 0 ? 'text-success' : 'text-error'"
        >
          {{ item.delta >= 0 ? '+' : '' }}{{ item.delta.toLocaleString('fa-IR') }}٪
        </span>
      </div>
      <div class="text-lg sm:text-xl font-black text-highlighted num leading-none truncate">
        {{ item.value }}
      </div>
      <div class="text-[11px] text-toned mt-2 leading-5">
        {{ $t(item.label) }}
      </div>
      <div
        v-if="item.hint"
        class="text-[10px] text-muted mt-1"
      >
        {{ $t(item.hint) }}
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { SellerDashboardKpi } from '~/data/seller-dashboard'

defineProps<{
  items: SellerDashboardKpi[]
}>()

const NuxtLink = resolveComponent('NuxtLink')

function toneClass(tone: SellerDashboardKpi['tone']) {
  const map = {
    primary: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    error: 'bg-error/15 text-error',
    info: 'bg-info/15 text-info',
    neutral: 'bg-muted text-toned',
  }
  return map[tone]
}
</script>
