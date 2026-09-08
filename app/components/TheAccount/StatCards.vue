<template>
  <div class="bg-default border border-muted rounded-2xl overflow-hidden">
    <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-muted">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="group flex flex-col items-center gap-1.5 p-3 sm:(gap-2 p-4) lg:p-5 text-center transition-all  hover:bg-muted/60 min-w-0 cursor-pointer"
      >
        <div
          class="size-9 sm:size-10 lg:size-12 rounded-xl lg:rounded-2xl grid place-items-center transition-all  group-hover:scale-105 shrink-0"
          :class="stat.iconWrap"
        >
          <UIcon
            :name="stat.icon"
            class="size-4 sm:size-5 lg:size-6"
          />
        </div>
        <span class="text-base sm:text-xl lg:text-2xl font-black text-highlighted num leading-none">
          {{ stat.value }}
        </span>
        <span class="text-[10px] sm:text-[11px] text-toned leading-tight px-0.5 line-clamp-2">
          {{ $t(stat.label) }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const { activeOrdersCount } = useAccount()
const { wishlistCount } = useShop()
const { summary } = useAccountWallet()
const checkoutStore = useCheckoutStore()

const stats = computed(() => [
  {
    label: 'سفارش در جریان',
    value: activeOrdersCount.value.toLocaleString('fa-IR'),
    icon: 'i-tabler-truck-delivery',
    iconWrap: 'bg-info/15 text-info',
    to: '/account/orders',
  },
  {
    label: 'موجودی کیف پول',
    value: formatPrice(summary.value.balance),
    icon: 'i-tabler-wallet',
    iconWrap: 'bg-success/15 text-success',
    to: '/account/wallet',
  },
  {
    label: 'علاقه‌مندی‌ها',
    value: wishlistCount.value.toLocaleString('fa-IR'),
    icon: 'i-tabler-heart',
    iconWrap: 'bg-primary/15 text-primary',
    to: '/account/wishlist',
  },
  {
    label: 'آدرس‌ها',
    value: checkoutStore.addresses.length.toLocaleString('fa-IR'),
    icon: 'i-tabler-map-pin',
    iconWrap: 'bg-warning/15 text-warning',
    to: '/account/addresses',
  },
])
</script>
