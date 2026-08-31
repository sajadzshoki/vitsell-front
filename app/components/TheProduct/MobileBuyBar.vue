<template>
  <div
    class="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-muted bg-default/95 backdrop-blur-md px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px] shadow-inverted/10"
  >
    <div class="flex items-center justify-between gap-3 max-w-8xl mx-auto">
      <template v-if="outOfStock">
        <UButton
          type="button"
          :color="subscribed ? 'neutral' : 'primary'"
          :variant="subscribed ? 'soft' : 'solid'"
          size="xl"
          class="flex-1 font-bold h-12 rounded-xl"
          :icon="subscribed ? 'i-tabler-bell-check' : 'i-tabler-bell'"
          @click="emit('notify')"
        >
          {{ subscribed ? $t('اطلاع‌رسانی فعال شد') : $t('موجود شد بهم اطلاع بده') }}
        </UButton>
      </template>
      <template v-else-if="qty > 0">
        <div class="flex items-center gap-0.5 bg-default rounded-xl border border-muted p-1 shrink-0">
          <UButton
            type="button"
            color="primary"
            variant="ghost"
            size="sm"
            square
            class="size-9 text-primary"
            :aria-label="$t('افزایش تعداد')"
            @click="updateQty(product.id, qty + 1)"
          >
            +
          </UButton>
          <span class="min-w-8 px-1 text-center text-base font-bold text-highlighted num">
            {{ qty.toLocaleString('fa-IR') }}
          </span>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="sm"
            square
            class="size-9"
            :icon="qty === 1 ? 'i-tabler-trash' : undefined"
            :aria-label="qty === 1 ? $t('حذف از سبد') : $t('کاهش تعداد')"
            @click="updateQty(product.id, qty - 1)"
          >
            <span
              v-if="qty > 1"
              class="text-lg leading-none"
            >−</span>
          </UButton>
        </div>
      </template>
      <UButton
        v-else
        type="button"
        color="primary"
        size="xl"
        class="w-[62%] font-bold shadow-lg shadow-primary/25 h-12 rounded-xl"
        @click="emit('add')"
      >
        {{ $t('افزودن به سبد خرید') }}
      </UButton>

      <div class="shrink-0 text-end">
        <div
          v-if="product.oldPrice"
          class="flex items-center gap-1.5 justify-end mb-0.5"
        >
          <UBadge
            color="error"
            size="sm"
            class="font-bold num"
          >
            {{ discount.toLocaleString('fa-IR') }}٪
          </UBadge>
          <span class="text-[11px] text-dimmed line-through num">
            {{ formatPrice(product.oldPrice) }}
          </span>
        </div>
        <div class="flex items-baseline gap-1 justify-end">
          <span class="text-lg font-black text-highlighted num">
            {{ formatPrice(product.price) }}
          </span>
          <span class="text-[11px] text-muted">{{ $t('تومان') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = withDefaults(defineProps<{
  product: Product
  subscribed?: boolean
}>(), {
  subscribed: false,
})

const emit = defineEmits<{
  add: []
  notify: []
}>()

const { getCartQty, updateQty } = useShop()

const qty = computed(() => getCartQty(props.product.id))
const outOfStock = computed(() => props.product.inStock === false)

const discount = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})
</script>
