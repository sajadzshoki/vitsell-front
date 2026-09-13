<template>
  <NuxtLink
    class="group card-hover text-start bg-default border border-muted rounded-2xl p-3 <md:(p-2 rounded-xl) cursor-pointer"
    :class="isHorizontal
      ? 'flex flex-row gap-3 sm:gap-4 items-stretch'
      : 'flex flex-col w-full h-full'"
    :to="{ name: 'product-id', params: { id: product.id } }"
  >
    <div
      class="relative overflow-hidden bg-muted rounded-xl shrink-0"
      :class="isHorizontal
        ? 'w-28 sm:w-36 md:w-40 aspect-square'
        : 'aspect-square mb-3'"
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
        class="!w-full !h-full object-contain p-6 opacity-60"
      />

      <span
        v-if="categoryLabel"
        class="absolute top-2 right-2 bg-inverted text-inverted text-[10px] font-semibold px-2 py-1 rounded-lg"
      >
        {{ $t(categoryLabel) }}
      </span>

      <div
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
        <!-- <UButton
          type="button"
          icon="i-tabler-shopping-cart"
          color="neutral"
          variant="solid"
          size="sm"
          square
          class="rounded-full shadow-md backdrop-blur bg-default/95 text-toned hover:bg-primary hover:text-inverted"
          :aria-label="$t('افزودن به سبد خرید')"
          @click.prevent.stop="onAddToCart"
        /> -->
      </div>
    </div>

    <div
      class="flex flex-col min-w-0 flex-1"
      :class="isHorizontal ? 'py-0.5' : ''"
    >
      <h3
        class="text-[13px] leading-6 text-default line-clamp-2 mb-2 transition-all  group-hover:text-primary"
        :class="isHorizontal ? '' : 'min-h-12'"
      >
        {{ product.title }}
      </h3>

      <div class="flex items-center gap-1 mb-2 sm:mb-3 flex-wrap min-h-6">
        <div class="flex items-center gap-0.5 bg-warning/10 text-warning rounded-md px-1.5 py-0.5">
          <UIcon name="i-tabler-star-filled" class="size-3" />
          <span class="text-[11px] font-semibold num">
            {{ product.rating.toLocaleString('fa-IR') }}
          </span>
        </div>
        <span class="text-[11px] text-dimmed num">
          ({{ product.reviews.toLocaleString('fa-IR') }} {{ $t('نظر') }})
        </span>
        <span
          v-if="product.fastDelivery"
          class="inline-flex items-center gap-1 text-[10px] text-warning"
        >
          <UIcon name="i-tabler-truck-delivery" class="size-3.5" />
          {{ $t('ارسال سریع') }}
        </span>
      </div>

      <p
        v-if="product.inStock === false"
        class="mt-auto text-sm font-bold text-error"
      >
        {{ $t('ناموجود') }}
      </p>

      <div
        v-else
        class="mt-auto flex flex-col items-end gap-0.5"
      >
        <p
          v-if="product.reviews % 7 === 0"
          class="text-[9px] text-error ms-auto"
        >
          {{ $t('تنها ۱ عدد در انبار باقی مانده') }}
        </p>
        <div class="flex items-center gap-1.5">
          <span
            v-if="product.oldPrice"
            class="text-[11px] text-dimmed line-through num"
          >
            {{ formatPrice(product.oldPrice) }}
          </span>
          <span
            v-if="discount > 0"
            class="bg-error text-inverted text-[11px] font-bold px-1.5 py-0.5 rounded-md num"
          >
            {{ discount.toLocaleString('fa-IR') }}٪
          </span>
        </div>
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
import { categoryLabels, formatPrice, type Product } from '~/data/products'

const props = withDefaults(defineProps<{
  product: Product
  compact?: boolean
  layout?: 'vertical' | 'horizontal'
}>(), {
  compact: false,
  layout: 'vertical',
})

const { isInWishlist, toggleWishlist, addToCart } = useShop()
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

function onAddToCart() {
  addToCart(props.product.id)
}

function onToggleCompare() {
  toggleCompare(props.product.id)
}
</script>
