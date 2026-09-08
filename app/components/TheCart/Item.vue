<template>
  <div class="bg-default border border-muted rounded-2xl p-4 flex gap-3 md:gap-4">
    <div class="shrink-0 flex flex-col gap-2">
      <NuxtLink
        :to="`/product/${product.id}`"
        class="size-24 md:size-28 rounded-xl bg-muted overflow-hidden"
      >
        <TheIcon
          v-if="product.image"
          :name="product.image"
          icon-type="img"
          class="!w-full !h-full object-cover transition-all  hover:scale-105"
        />
        <TheIcon
          v-else
          name="noImage.png"
          icon-type="img"
          class="!w-full !h-full object-contain p-4 opacity-60"
        />
      </NuxtLink>

      <div class="md:hidden flex items-center justify-center bg-muted rounded-xl border border-muted p-0.5">
        <UButton
          type="button"
          color="primary"
          size="sm"
          square
          class="size-8"
          :aria-label="$t('افزایش تعداد')"
          @click="updateQty(product.id, qty + 1)"
        >
          +
        </UButton>
        <span class="w-8 text-center text-sm font-bold num">
          {{ qty.toLocaleString('fa-IR') }}
        </span>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="sm"
          square
          class="size-8"
          :icon="qty === 1 ? 'i-tabler-trash' : undefined"
          :class="qty === 1 ? 'text-error' : ''"
          :aria-label="qty === 1 ? $t('حذف از سبد') : $t('کاهش تعداد')"
          @click="updateQty(product.id, qty - 1)"
        >
          <span v-if="qty > 1">−</span>
        </UButton>
      </div>
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <div class="min-w-0">
        <div class="text-[10px] text-dimmed mb-1 uppercase">
          {{ product.brand }}
        </div>
        <NuxtLink
          :to="`/product/${product.id}`"
          class="text-sm font-medium text-default hover:text-primary transition-all  text-start line-clamp-2"
        >
          {{ product.title }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2 mt-2 text-[11px]">
        <span class="flex items-center gap-1 text-success">
          <UIcon
            name="i-tabler-check"
            class="size-3.5"
          />
          {{ product.inStock === false ? $t('ناموجود') : $t('موجود در انبار') }}
        </span>
        <span class="text-dimmed">|</span>
        <span class="text-muted">{{ $t('تحویل ۲۴ ساعته') }}</span>
      </div>

      <div class="mt-auto flex items-end justify-between pt-3 gap-3">
        <div class="hidden md:flex items-center bg-muted rounded-xl border border-muted p-1">
          <UButton
            type="button"
            color="primary"
            size="sm"
            square
            :aria-label="$t('افزایش تعداد')"
            @click="updateQty(product.id, qty + 1)"
          >
            +
          </UButton>
          <span class="w-10 text-center text-sm font-bold num">
            {{ qty.toLocaleString('fa-IR') }}
          </span>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            square
            :icon="qty === 1 ? 'i-tabler-trash' : undefined"
            :class="qty === 1 ? 'text-error' : ''"
            :aria-label="qty === 1 ? $t('حذف از سبد') : $t('کاهش تعداد')"
            @click="updateQty(product.id, qty - 1)"
          >
            <span v-if="qty > 1">−</span>
          </UButton>
        </div>

        <div class="text-end ms-auto">
          <div
            v-if="product.oldPrice"
            class="flex items-center gap-2 justify-end"
          >
            <span class="text-[10px] bg-error text-inverted px-1.5 py-0.5 rounded num font-bold">
              {{ discountPct.toLocaleString('fa-IR') }}٪
            </span>
            <span class="text-[11px] text-dimmed line-through num">
              {{ formatPrice(product.oldPrice * qty) }}
            </span>
          </div>
          <div class="flex items-baseline gap-1 justify-end">
            <span class="text-base font-extrabold text-highlighted num">
              {{ formatPrice(product.price * qty) }}
            </span>
            <span class="text-[10px] text-muted">{{ $t('تومان') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = defineProps<{
  product: Product
  qty: number
}>()

const { updateQty } = useShop()

const discountPct = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})
</script>
