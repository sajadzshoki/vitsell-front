<template>
  <div class="bg-muted border border-muted rounded-2xl p-4 transition hover:(border-accented bg-elevated/50)">
    <NuxtLink
      :to="orderLink"
      class="block cursor-pointer"
    >
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div class="flex items-center gap-3 flex-wrap">
          <UBadge
            :color="statusMeta.color"
            variant="subtle"
            size="sm"
            class="font-bold inline-flex items-center gap-1"
          >
            <UIcon
              :name="statusMeta.icon"
              class="size-3.5 shrink-0"
            />
            {{ $t(statusMeta.label) }}
          </UBadge>
          <div class="text-[11px] text-muted num">
            {{ $t('شماره') }}:
            <span
              dir="ltr"
              class="text-toned font-medium"
            >{{ order.id }}</span>
          </div>
          <div class="text-[11px] text-muted num hidden sm:block">
            {{ order.date }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="!compact"
            class="text-xs text-muted hidden sm:block"
          >
            {{ order.customerName }}<template v-if="order.city"> · {{ $t(order.city) }}</template>
          </div>
          <span class="text-xs text-primary font-medium inline-flex items-center gap-0.5">
            {{ $t('جزئیات') }}
            <UIcon
              name="i-tabler-chevron-left"
              class="size-3.5"
            />
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex -space-x-2 space-x-reverse">
          <template
            v-for="item in visibleItems"
            :key="item.productId"
          >
            <img
              v-if="item.product?.image"
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

        <div class="flex-1 min-w-0 ms-2 text-xs text-muted">
          <div class="num">
            {{ totalQty.toLocaleString('fa-IR') }} {{ $t('کالا') }}
          </div>
          <div
            v-if="!compact"
            class="truncate mt-0.5"
          >
            <template v-if="order.shippingMethod">{{ $t(order.shippingMethod) }}</template>
            <template v-if="order.shippingMethod && order.paymentMethod"> · </template>
            <template v-if="order.paymentMethod">{{ $t(order.paymentMethod) }}</template>
          </div>
        </div>

        <div class="text-end shrink-0">
          <div class="text-[10px] text-muted">
            {{ $t('مبلغ') }}
          </div>
          <div class="text-sm font-bold text-highlighted num">
            {{ formatPrice(order.total) }} {{ $t('تومان') }}
          </div>
        </div>
      </div>
    </NuxtLink>

    <div
      v-if="canDelete"
      class="mt-3 pt-3 border-t border-muted flex justify-end"
    >
      <UButton
        type="button"
        color="error"
        variant="ghost"
        size="xs"
        icon="i-tabler-trash"
        class="cursor-pointer"
        @click.stop="emit('delete', order)"
      >
        {{ $t('حذف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  sellerOrderStatusMeta,
  type SellerOrder,
} from '~/data/seller'
import { formatPrice } from '~/data/products'

const props = defineProps<{
  order: SellerOrder
  compact?: boolean
  canDelete?: boolean
}>()

const emit = defineEmits<{
  delete: [order: SellerOrder]
}>()

const { resolveProduct } = useSeller()

const orderLink = computed(() => `/seller/orders/${encodeURIComponent(props.order.id)}`)

const statusMeta = computed(() =>
  sellerOrderStatusMeta[props.order.status]
  ?? sellerOrderStatusMeta.new,
)
const visibleItems = computed(() =>
  props.order.items.slice(0, 3).map(item => ({
    ...item,
    product: resolveProduct(item.productId),
  })),
)

const extraCount = computed(() =>
  Math.max(0, props.order.items.length - 3),
)

const totalQty = computed(() =>
  props.order.items.reduce((sum, item) => sum + item.qty, 0),
)
</script>
