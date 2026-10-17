<template>
  <NuxtLink
    class="group card-hover text-start bg-default border border-muted cursor-pointer"
    :class="[
      compact ? 'rounded-xl p-1.5' : 'rounded-2xl p-3 <md:(p-2 rounded-xl)',
      isHorizontal
        ? 'flex flex-row gap-3 sm:gap-4 items-stretch'
        : 'flex flex-col w-full h-full',
    ]"
    :to="{ name: 'product-id', params: { id: product.id } }"
  >
    <div
      class="relative overflow-hidden bg-muted shrink-0"
      :class="[
        compact ? 'rounded-lg' : 'rounded-xl',
        isHorizontal
          ? 'w-28 sm:w-36 md:w-40 aspect-square'
          : (compact ? 'aspect-square mb-1.5' : 'aspect-square mb-3'),
      ]"
    >
      <TheIcon
        v-if="imageSrc"
        :name="imageSrc"
        icon-type="img"
        class="!w-full !h-full object-cover transition-all duration-300 group-hover:scale-105"
      />
      <TheIcon
        v-else
        name="noImage.png"
        icon-type="img"
        class="!w-full !h-full object-contain opacity-60"
        :class="compact ? 'p-3' : 'p-6'"
      />

      <span
        v-if="categoryLabel && !compact"
        class="absolute top-2 right-2 bg-inverted text-inverted text-[10px] font-semibold px-2 py-1 rounded-lg"
      >
        {{ $t(categoryLabel) }}
      </span>

      <div
        v-if="!compact"
        class="absolute bottom-2 inset-s-2 flex flex-col gap-2 transition-all  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100"
        :class="{ 'sm:opacity-100': liked || inCompare }"
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
          :icon="inCompare ? 'i-tabler-check' : 'i-tabler-arrows-diff'"
          color="neutral"
          variant="solid"
          size="sm"
          square
          class="rounded-full shadow-md backdrop-blur"
          :class="inCompare
            ? 'bg-inverted text-inverted hover:bg-inverted'
            : 'bg-default/95 text-toned hover:bg-inverted hover:text-inverted'"
          :aria-label="inCompare ? $t('حذف از مقایسه') : $t('افزودن به مقایسه')"
          @click.prevent.stop="onToggleCompare"
        />
      </div>
    </div>

    <div
      class="flex flex-col min-w-0 flex-1"
      :class="isHorizontal ? 'py-0.5' : ''"
    >
      <h3
        class="text-default line-clamp-2 transition-all group-hover:text-primary"
        :class="compact
          ? 'text-[11px] leading-4 mb-1 min-h-8'
          : (isHorizontal ? 'text-[13px] leading-6 mb-2' : 'text-[13px] leading-6 mb-2 min-h-12')"
      >
        {{ product.title }}
      </h3>

      <div
        class="flex items-center gap-1 flex-wrap"
        :class="compact ? 'mb-1 min-h-0' : 'mb-2 sm:mb-3 min-h-6'"
      >
        <div class="flex items-center gap-0.5 bg-warning/10 text-warning rounded-md px-1 py-0.5">
          <UIcon
            name="i-tabler-star-filled"
            :class="compact ? 'size-2.5' : 'size-3'"
          />
          <span
            class="font-semibold num"
            :class="compact ? 'text-[10px]' : 'text-[11px]'"
          >
            {{ product.rating.toLocaleString('fa-IR') }}
          </span>
        </div>
        <span
          v-if="!compact"
          class="text-[11px] text-dimmed num"
        >
          ({{ product.reviews.toLocaleString('fa-IR') }} {{ $t('نظر') }})
        </span>
        <span
          v-if="product.fastDelivery && !compact"
          class="inline-flex items-center gap-1 text-[10px] text-warning"
        >
          <UIcon name="i-tabler-truck-delivery" class="size-3.5" />
          {{ $t('ارسال سریع') }}
        </span>
      </div>

      <div
        v-if="showPrice"
        class="mt-auto flex flex-col items-end gap-0.5"
      >
        <p
          v-if="isLowStock && !compact"
          class="text-[10px] text-error ms-auto"
        >
          {{ (stockCount ?? 0).toLocaleString('fa-IR') }} {{ $t('محصول در انبار باقی مانده') }}
        </p>
        <div class="flex items-center gap-1">
          <span
            v-if="product.oldPrice"
            class="text-dimmed line-through num"
            :class="compact ? 'text-[9px]' : 'text-[11px]'"
          >
            {{ formatPrice(product.oldPrice) }}
          </span>
          <span
            v-if="discount > 0"
            class="bg-error text-inverted font-bold rounded-md num"
            :class="compact ? 'text-[9px] px-1 py-px' : 'text-[11px] px-1.5 py-0.5'"
          >
            {{ discount.toLocaleString('fa-IR') }}٪
          </span>
        </div>
        <div class="flex items-baseline gap-0.5">
          <span
            class="font-extrabold text-highlighted num"
            :class="compact ? 'text-sm' : 'text-base'"
          >
            {{ formatPrice(product.price) }}
          </span>
          <span
            class="text-muted"
            :class="compact ? 'text-[9px]' : 'text-[10px]'"
          >{{ $t('تومان') }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { categoryLabels, formatPrice, type Product } from '~/data/products'

const props = withDefaults(defineProps<{
  product: Product
  compact?: boolean
  layout?: 'vertical' | 'horizontal'
}>(), {
  compact: false,
  layout: 'vertical',
})

const { isInWishlist, toggleWishlist, addToCart, getCartQty } = useShop()
const compareStore = useCompareStore()
const { toggleCompare, hasCompareItems } = useCompareActions()

const liked = computed(() => isInWishlist(props.product.id))
const inCompare = computed(() => compareStore.isInCompare(props.product.id))
const showCompareButton = computed(() => hasCompareItems.value)
const isHorizontal = computed(() => props.layout === 'horizontal')

const discount = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round(
    ((props.product.oldPrice - props.product.price) / props.product.oldPrice) * 100,
  )
})

const inStock = computed(() =>
  props.product.published !== false && props.product.inStock !== false,
)
const showPrice = computed(() => inStock.value)

const stockCount = computed(() => {
  const n = props.product.stock
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null
})

const lowStockThreshold = computed(() => {
  const n = props.product.lowStockThreshold
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 5
})

/** موجود و تعداد ≤ آستانه کم‌موجودی (هم‌راستا با پنل انبار) */
const isLowStock = computed(() =>
  inStock.value
  && stockCount.value != null
  && stockCount.value > 0
  && stockCount.value <= lowStockThreshold.value,
)

const categoryLabel = computed(() =>
  props.product.categoryLabel
  || categoryLabels[props.product.category]
  || '',
)

const colorMode = useColorMode()

const imageSrc = computed(() => {
  const dark = props.product.imageDark?.trim()
  if (colorMode.value === 'dark' && dark) return dark
  const src = props.product.image?.trim()
  return src || ''
})

function onToggleWishlist() {
  toggleWishlist(props.product.id)
}

async function onAddToCart() {
  if (!inStock.value) return
  const stock = Number(props.product.stock)
  const maxQty = Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : null
  if (maxQty != null && getCartQty(props.product.id) >= maxQty) return
  await addToCart(props.product.id)
}

function onToggleCompare() {
  toggleCompare(props.product.id)
}
</script>
