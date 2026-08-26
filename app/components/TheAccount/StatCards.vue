<template>
  <div class="bg-default border border-muted rounded-2xl overflow-hidden shadow-sm">
    <div class="grid grid-cols-4 divide-x !divide-muted ">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="group flex flex-col items-center gap-1  p-2 sm:(gap-2 p-3) lg:(gap-2.5 p-4) text-center transition hover:bg-muted/60 min-w-0"
      >
        <div
          class="size-8 sm:size-10 lg:size-12 rounded-xl lg:rounded-2xl grid place-items-center transition group-hover:scale-105 shrink-0"
          :class="stat.iconWrap"
        >
          <UIcon :name="stat.icon" class="size-4 sm:size-5 lg:size-6" />
        </div>
        <span class="text-base sm:text-xl lg:text-2xl font-black text-highlighted num leading-none">
          {{ stat.value }}
        </span>
        <span class="text-[8px] sm:text-[10px] lg:text-[11px] text-toned leading-tight px-0.5 line-clamp-2">
          {{ $t(stat.label) }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { orders, activeOrdersCount } = useAccount()
const { wishlistCount } = useShop()
const checkoutStore = useCheckoutStore()

const stats = computed(() => [
  {
    label: 'سفارش‌های در جریان',
    value: activeOrdersCount.value.toLocaleString('fa-IR'),
    icon: 'i-tabler-truck-delivery',
    iconWrap: 'bg-info/15 text-info',
    to: '/account/orders',
  },
  {
    label: 'کل سفارش‌ها',
    value: orders.value.length.toLocaleString('fa-IR'),
    icon: 'i-tabler-shopping-bag',
    iconWrap: 'bg-success/15 text-success',
    to: '/account/orders',
  },
  {
    label: 'علاقه‌مندی‌ها',
    value: wishlistCount.value.toLocaleString('fa-IR'),
    icon: 'i-tabler-heart',
    iconWrap: 'bg-primary/15 text-primary',
    to: '/wishlist',
  },
  {
    label: 'آدرس‌های ذخیره‌شده',
    value: checkoutStore.addresses.length.toLocaleString('fa-IR'),
    icon: 'i-tabler-map-pin',
    iconWrap: 'bg-warning/15 text-warning',
    to: '/account/addresses',
  },
])
</script>
