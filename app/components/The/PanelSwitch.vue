<template>
  <div class="grid grid-cols-2 gap-2">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border text-center transition"
      :class="isActive(item.to)
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-muted bg-muted/40 text-toned hover:(border-primary/40 bg-primary/5 text-primary)'"
    >
      <div
        class="size-8 rounded-lg grid place-items-center shrink-0"
        :class="isActive(item.to) ? 'bg-primary text-inverted' : 'bg-elevated'"
      >
        <UIcon :name="item.icon" class="size-4" />
      </div>
      <span class="text-[11px] font-medium leading-tight">
        {{ $t(item.label) }}
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const items = [
  { label: 'حساب کاربری', icon: 'i-tabler-user', to: '/account' },
  { label: 'پنل مدیریت', icon: 'i-tabler-settings', to: '/seller' },
] as const

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>
