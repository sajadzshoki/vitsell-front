<template>
  <div class="flex items-stretch gap-3 py-3 border-b border-muted last:border-b-0">
    <div class="relative shrink-0">
      <NuxtLink
        :to="{ name: 'product-id', params: { id: product.id } }"
        class="block size-20 sm:size-24 rounded-xl overflow-hidden bg-muted cursor-pointer"
      >
        <TheIcon
          v-if="imageSrc"
          :name="imageSrc"
          icon-type="img"
          class="!w-full !h-full object-cover"
        />
        <TheIcon
          v-else
          name="noImage.png"
          icon-type="img"
          class="!w-full !h-full object-contain p-3 opacity-60"
        />
      </NuxtLink>
      <UButton
        type="button"
        color="error"
        variant="solid"
        size="xs"
        square
        class="absolute -bottom-1 -end-1 size-8 rounded-full shadow-md cursor-pointer"
        :icon="inCart ? 'i-tabler-check' : 'i-tabler-plus'"
        :loading="adding"
        :disabled="adding || !canPurchase"
        :aria-label="inCart ? $t('در سبد است') : $t('افزودن به سبد خرید')"
        @click="onQuickAdd"
      />
    </div>

    <div class="min-w-0 flex-1 flex flex-col gap-1.5 py-0.5">
      <NuxtLink
        :to="{ name: 'product-id', params: { id: product.id } }"
        class="text-sm text-highlighted line-clamp-2 leading-6 cursor-pointer hover:text-primary transition"
      >
        {{ product.title }}
      </NuxtLink>
      <div class="flex items-center gap-1">
        <UIcon
          name="i-tabler-star-filled"
          class="size-3.5 text-warning"
        />
        <span class="text-xs font-medium text-toned num">
          {{ product.rating.toLocaleString('fa-IR') }}
        </span>
      </div>
      <div class="mt-auto flex flex-wrap items-center gap-2">
        <template v-if="discount > 0">
          <span class="text-xs text-dimmed line-through num">
            {{ formatPrice(product.oldPrice!) }}
          </span>
          <UBadge
            color="error"
            size="sm"
            class="font-bold num"
          >
            {{ discount.toLocaleString('fa-IR') }}٪
          </UBadge>
        </template>
        <div class="flex items-baseline gap-1">
          <span class="text-sm font-bold text-highlighted num">
            {{ formatPrice(product.price) }}
          </span>
          <span class="text-[11px] text-muted">{{ currencyLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  added: [productId: string]
}>()

const { t } = useI18n()
const toast = useToast()
const { addToCart, getCartQty } = useShop()
const { currencyLabel, site, fetchSite } = useSiteSettings()
await fetchSite()

const adding = ref(false)
const inCart = computed(() => getCartQty(props.product.id) > 0)
const outOfStock = computed(() =>
  props.product.published === false || props.product.inStock === false,
)
const allowBackorder = computed(() => site.value.outOfStockBehavior === 'allow_backorder')
const canPurchase = computed(() => !outOfStock.value || allowBackorder.value)

const imageSrc = computed(() => props.product.image || props.product.gallery?.[0] || '')

const discount = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})

async function onQuickAdd() {
  if (!canPurchase.value || adding.value) return
  if (inCart.value) {
    toast.add({
      title: t('این کالا در سبد شماست'),
      color: 'info',
      icon: 'i-tabler-shopping-cart',
    })
    return
  }
  adding.value = true
  try {
    const ok = await addToCart(props.product.id, 1)
    if (ok === false) {
      toast.add({
        title: t('افزودن به سبد ممکن نیست'),
        description: t('محصول غیرفعال است یا موجودی کافی نیست'),
        color: 'warning',
        icon: 'i-tabler-alert-circle',
      })
      return
    }
    toast.add({
      title: t('کالا اضافه شد!'),
      color: 'success',
      icon: 'i-tabler-circle-check-filled',
    })
    emit('added', props.product.id)
  }
  finally {
    adding.value = false
  }
}
</script>
