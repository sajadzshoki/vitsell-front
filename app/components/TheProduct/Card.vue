<template>
  <NuxtLink
    class="group card-hover flex flex-col w-full text-start bg-default border border-muted rounded-2xl p-3 cursor-pointer"
    :class="compact ? '' : 'h-full'"
    :to="{ name: 'product-id', params: { id: product.id } }"
  >
    <div class="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
      <TheIcon
        v-if="imageSrc"
        :name="imageSrc"
        icon-type="img"
        class="!w-full !h-full object-cover transition duration-500 group-hover:scale-105"
      />
      <TheIcon
        v-else
        name="noImage.png"
        icon-type="img"
        class="!w-full !h-full object-contain p-6 opacity-60"
      />

      <span
        v-if="product.badge"
        class="absolute top-2 inset-e-2 bg-inverted text-inverted text-[10px] font-semibold px-2 py-1 rounded-lg"
      >
        {{ $t(product.badge) }}
      </span>

      <span
        v-if="discount > 0"
        class="absolute top-2 inset-s-2 bg-error text-inverted text-[11px] font-bold px-2 py-1 rounded-lg num shadow-lg shadow-error/30"
      >
        {{ discount.toLocaleString('fa-IR') }}٪
      </span>

      <div
        class="absolute bottom-2 inset-s-2 flex flex-col gap-2 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100"
        :class="{ 'sm:opacity-100': liked }"
      >
        <UButton
          type="button"
          :icon="liked ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
          color="neutral"
          variant="solid"
          size="sm"
          square
          class="rounded-full shadow-md backdrop-blur"
          :class="liked
            ? 'bg-error text-inverted hover:bg-error'
            : 'bg-default/95 text-toned hover:text-error'"
          :aria-label="liked ? $t('حذف از علاقه‌مندی‌ها') : $t('افزودن به علاقه‌مندی‌ها')"
          @click.prevent.stop="onToggleWishlist"
        />
        <UButton
          type="button"
          icon="i-tabler-shopping-cart"
          color="neutral"
          variant="solid"
          size="sm"
          square
          class="rounded-full shadow-md backdrop-blur bg-default/95 text-toned hover:bg-primary hover:text-inverted"
          :aria-label="$t('افزودن به سبد خرید')"
          @click.prevent.stop="onAddToCart"
        />
      </div>
    </div>

    <div class="text-[10px] text-dimmed tracking-wider mb-1 uppercase">
      {{ product.brand }}
    </div>

    <h3 class="text-[13px] leading-6 text-default line-clamp-2 min-h-12 mb-2 transition group-hover:text-primary">
      {{ product.title }}
    </h3>

    <div class="flex items-center gap-1 mb-3">
      <div class="flex items-center gap-0.5 bg-warning/10 text-warning rounded-md px-1.5 py-0.5">
        <UIcon name="i-tabler-star-filled" class="size-3" />
        <span class="text-[11px] font-semibold num">
          {{ product.rating.toLocaleString('fa-IR') }}
        </span>
      </div>
      <span class="text-[11px] text-dimmed num">
        ({{ product.reviews.toLocaleString('fa-IR') }} {{ $t('نظر') }})
      </span>
    </div>

    <div class="mt-auto flex items-end justify-between gap-2">
      <div class="flex flex-col">
        <span
          v-if="product.oldPrice"
          class="text-[11px] text-dimmed line-through num"
        >
          {{ formatPrice(product.oldPrice) }}
        </span>
        <div class="flex items-baseline gap-1">
          <span class="text-base font-extrabold text-highlighted num">
            {{ formatPrice(product.price) }}
          </span>
          <span class="text-[10px] text-muted">{{ $t('تومان') }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = withDefaults(defineProps<{
  product: Product
  compact?: boolean
}>(), {
  compact: false,
})

const { isInWishlist, toggleWishlist, addToCart } = useShop()

const liked = computed(() => isInWishlist(props.product.id))

const discount = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round(
    ((props.product.oldPrice - props.product.price) / props.product.oldPrice) * 100,
  )
})

const imageSrc = computed(() => {
  const src = props.product.image?.trim()
  return src || ''
})

function onToggleWishlist() {
  toggleWishlist(props.product.id)
}

function onAddToCart() {
  addToCart(props.product.id)
}
</script>
