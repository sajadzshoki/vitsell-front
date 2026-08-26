<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">{{ $t('سفارش‌های فروشگاه') }}</h2>
      <div class="text-xs text-muted num">
        {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('سفارش') }}
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
      <UButton
        v-for="tab in statusTabs"
        :key="tab.id"
        :color="statusFilter === tab.id ? 'primary' : 'neutral'"
        :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0"
        @click="statusFilter = tab.id"
      >
        {{ $t(tab.label) }}
        <span
          v-if="tab.id !== 'all'"
          class="num ms-1"
        >
          {{ countBy(tab.id).toLocaleString('fa-IR') }}
        </span>
      </UButton>
    </div>

    <div
      v-if="filtered.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-tabler-shopping-bag" class="size-16 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted">{{ $t('سفارشی در این وضعیت نیست') }}</p>
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <TheSellerOrderRow
        v-for="order in filtered"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SellerOrderStatus } from '~/data/seller'

const { orders } = useSeller()

const statusFilter = ref<'all' | SellerOrderStatus>('all')

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'new' as const, label: 'جدید' },
  { id: 'packing' as const, label: 'آماده‌سازی' },
  { id: 'shipped' as const, label: 'ارسال شده' },
  { id: 'delivered' as const, label: 'تحویل شده' },
  { id: 'returned' as const, label: 'مرجوعی' },
]

function countBy(status: SellerOrderStatus) {
  return orders.value.filter(order => order.status === status).length
}

const filtered = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter(order => order.status === statusFilter.value)
})
</script>
