<template>
  <NuxtLink
    :to="orderLink"
    class="block bg-muted border border-muted rounded-2xl p-4 transition-all  hover:(border-accented bg-elevated/50)"
  >
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="flex items-center gap-3 flex-wrap">
        <UBadge
          :color="statusMeta.color"
          variant="subtle"
          size="sm"
          class="font-bold inline-flex items-center gap-1"
        >
          <UIcon :name="statusMeta.icon" class="size-3.5 shrink-0" />
          {{ $t(statusMeta.label) }}
        </UBadge>
        <div class="text-[11px] text-muted num">
          {{ $t('شماره') }}:
          <span dir="ltr" class="text-toned font-medium">{{ order.id }}</span>
        </div>
        <div class="text-[11px] text-muted num hidden md:block">
          {{ $t('تاریخ') }}: {{ order.date }}
        </div>
      </div>
      <span class="text-xs text-primary font-medium inline-flex items-center gap-0.5">
        {{ $t('جزئیات') }}
        <UIcon name="i-tabler-chevron-left" class="size-3.5" />
      </span>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex -space-x-2 space-x-reverse">
        <template
          v-for="item in visibleItems"
          :key="item.productId"
        >
          <img
            v-if="item.product"
            :src="item.product.image"
            :alt="item.product.title"
            class="size-12 rounded-xl border-2 border-default object-cover bg-default"
          >
          <div
            v-else
            class="size-12 rounded-xl border-2 border-default bg-elevated grid place-items-center"
          >
            <TheIcon
              icon-type="img"
              name="noImage.png"
              class="size-6 opacity-60"
            />
          </div>
        </template>
        <div
          v-if="extraCount > 0"
          class="size-12 rounded-xl border-2 border-default bg-accented grid place-items-center text-xs font-bold num text-toned"
        >
          +{{ extraCount.toLocaleString('fa-IR') }}
        </div>
      </div>

      <div class="flex-1 min-w-0 ms-2 text-xs text-muted num">
        {{ totalQty.toLocaleString('fa-IR') }} {{ $t('کالا') }}
      </div>

      <div class="text-end shrink-0">
        <div class="text-[10px] text-muted">{{ $t('مبلغ کل') }}</div>
        <div class="text-sm font-bold text-highlighted num">
          {{ formatPrice(order.total) }} {{ $t('تومان') }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { orderStatusMeta, type ShopOrder } from '~/data/account'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  order: ShopOrder
}>()

const { getCachedProduct } = useProducts()

const orderLink = computed(() => `/order/${encodeURIComponent(props.order.id)}`)

const statusMeta = computed(() => orderStatusMeta[props.order.status])

const visibleItems = computed(() =>
  props.order.items.slice(0, 3).map(item => ({
    ...item,
    product: getCachedProduct(item.productId),
  })),
)

const extraCount = computed(() =>
  Math.max(0, props.order.items.length - 3),
)

const totalQty = computed(() =>
  props.order.items.reduce((sum, item) => sum + item.qty, 0),
)
</script>
