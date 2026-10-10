<template>
  <div>
    <div class="hidden lg:block bg-default rounded-2xl border border-muted p-5 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="space-y-2.5 mb-4 pb-4">
          <!-- فعلاً «ناموجود» در جزئیات محصول نمایش داده نشود -->
          <div
            v-if="!(outOfStock && !allowBackorder)"
            class="flex items-center gap-2 text-xs text-toned"
          >
            <span
              class="size-2 rounded-full shrink-0"
              :class="allowBackorder && outOfStock ? 'bg-warning' : 'bg-success'"
            />
            {{ allowBackorder && outOfStock
              ? $t('قابل سفارش (پیش‌فروش)')
              : $t('موجود در انبار') }}
            <!--
            قبلاً:
            {{ outOfStock && !allowBackorder
              ? $t('ناموجود')
              : allowBackorder && outOfStock
                ? $t('قابل سفارش (پیش‌فروش)')
                : $t('موجود در انبار') }}
            -->
          </div>
        </div>
        <div
          v-if="canPurchase"
          class="flex flex-col gap-1"
        >
          <div
            v-if="product.oldPrice"
            class="flex items-center gap-2 mr-auto w-fit mb-1"
          >
            <span class="text-xs text-dimmed line-through num">
              {{ formatPrice(product.oldPrice) }}
            </span>
            <UBadge
              color="error"
              size="sm"
              class="font-bold num"
            >
              {{ discount.toLocaleString('fa-IR') }}٪
            </UBadge>
          </div>

          <div class="flex items-baseline gap-1 mb-5 mr-auto w-fit">
            <span class="text-2xl font-black text-highlighted num">
              {{ formatPrice(product.price) }}
            </span>
            <span class="text-xs text-muted">{{ currencyLabel }}</span>
          </div>
        </div>
      </div>

      <template v-if="outOfStock && !allowBackorder">
        <UButton
          type="button"
          color="primary"
          size="xl"
          block
          class="mb-1 font-bold"
          icon="i-tabler-phone-call"
          @click="onConsult"
        >
          {{ $t('دریافت مشاوره') }}
        </UButton>
      </template>
      <template v-else-if="canPurchase">
        <div
          v-if="qty > 0"
          class="flex items-center justify-between bg-default rounded-xl p-2 mb-3 border border-primary shadow-md shadow-primary/10"
        >
          <UButton
            type="button"
            :color="qty === 1 ? 'error' : 'neutral'"
            :variant="qty === 1 ? 'solid' : 'soft'"
            size="sm"
            square
            class="size-9 rounded-lg shrink-0"
            :icon="qty === 1 ? 'i-tabler-trash' : 'i-tabler-minus'"
            :aria-label="qty === 1 ? $t('حذف از سبد') : $t('کاهش تعداد')"
            @click="cartLineId && updateQty(cartLineId, qty - 1)"
          />
          <div class="flex flex-col items-center">
            <span class="text-sm font-bold text-primary num">
              {{ qty.toLocaleString('fa-IR') }}
            </span>
            <span class="text-[10px] text-dimmed">{{ $t('در سبد شما') }}</span>
          </div>
          <UButton
            type="button"
            color="primary"
            variant="solid"
            size="sm"
            square
            icon="i-tabler-plus"
            class="size-9 rounded-lg shrink-0"
            :aria-label="$t('افزایش تعداد')"
            :disabled="atMaxStock"
            @click="onIncreaseQty"
          />
        </div>

        <UButton
          v-else
          type="button"
          color="primary"
          size="xl"
          block
          class="mb-1 font-bold shadow-lg shadow-primary/25"
          @click="onAdd"
        >
          {{ $t('افزودن به سبد خرید') }}
        </UButton>
      </template>

      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        block
        class="mt-2 font-medium"
        :icon="inCompare ? 'i-tabler-check' : 'i-tabler-arrows-diff'"
        :class="inCompare ? 'bg-inverted text-inverted border-inverted hover:bg-inverted' : ''"
        @click="onToggleCompare"
      >
        {{ inCompare ? $t('در لیست مقایسه — برای حذف کلیک کنید') : $t('افزودن به مقایسه') }}
      </UButton>

      <div
        v-if="buyNotes.length"
        class="mt-4 pt-4 border-t border-accented space-y-2.5"
      >
        <div
          v-for="note in buyNotes"
          :key="note.text"
          class="flex items-center gap-2 text-[11px] text-toned"
        >
          <UIcon
            :name="`i-tabler-${note.icon}`"
            class="size-4 shrink-0 text-muted"
          />
          {{ $t(note.text) }}
        </div>
      </div>
    </div>

    <div class="lg:hidden mt-3 space-y-3">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        block
        class="font-medium"
        :icon="inCompare ? 'i-tabler-check' : 'i-tabler-arrows-diff'"
        :class="inCompare ? 'bg-inverted text-inverted border-inverted hover:bg-inverted' : ''"
        @click="onToggleCompare"
      >
        {{ inCompare ? $t('در لیست مقایسه — برای حذف کلیک کنید') : $t('افزودن به مقایسه') }}
      </UButton>

      <div
        v-if="buyNotes.length"
        class="bg-muted rounded-2xl p-4 space-y-2.5"
      >
        <div
          v-for="note in buyNotes"
          :key="note.text"
          class="flex items-center gap-2 text-[11px] text-toned"
        >
          <UIcon
            :name="`i-tabler-${note.icon}`"
            class="size-4 shrink-0 text-muted"
          />
          {{ $t(note.text) }}
        </div>
      </div>
    </div>

    <TheProductMobileBuyBar
      :product="product"
      :variant-id="variantId"
      @add="onAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = defineProps<{
  product: Product
  variantId?: string
}>()

const { t } = useI18n()
const toast = useToast()
const { addToCart, getCartQty, getCartLineId, updateQty } = useShop()
const { currencyLabel, site, fetchSite } = useSiteSettings()
await fetchSite()
const compareStore = useCompareStore()
const { toggleCompare } = useCompareActions()

const buyNotes = computed(() => {
  const notes = [...(props.product.buyNotes ?? [])]
  const eta = site.value.deliveryEstimateText?.trim()
  if (eta && !notes.some(n => n.text.includes(eta))) {
    notes.unshift({ icon: 'truck-delivery', text: eta })
  }
  return notes
})
const outOfStock = computed(() =>
  props.product.published === false || props.product.inStock === false,
)
const allowBackorder = computed(() => site.value.outOfStockBehavior === 'allow_backorder')
const canPurchase = computed(() => !outOfStock.value || allowBackorder.value)
const qty = computed(() => getCartQty(props.product.id, props.variantId))
const cartLineId = computed(() => getCartLineId(props.product.id, props.variantId))
const maxStock = computed(() => {
  const stock = Number(props.product.stock)
  return Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : null
})
const atMaxStock = computed(() =>
  !allowBackorder.value
  && maxStock.value != null
  && qty.value >= maxStock.value,
)

const supportTelHref = computed(() => {
  const raw = site.value.supportPhone?.trim() || site.value.phone?.trim() || ''
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, '')
  return `tel:${digits || raw}`
})
const inCompare = computed(() => compareStore.isInCompare(props.product.id))

const discount = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})

function notifyAdded() {
  toast.add({
    title: t('کالا اضافه شد!'),
    color: 'success',
    icon: 'i-tabler-circle-check-filled',
    orientation: 'horizontal',
    duration: 4500,
    ui: {
      root: 'mb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:mb-0',
    },
    actions: [{
      label: t('برو به سبد خرید'),
      color: 'neutral',
      variant: 'soft',
      size: 'sm',
      trailingIcon: 'i-tabler-chevron-left',
      class: 'rounded-full',
      onClick: () => {
        navigateTo('/cart')
      },
    }],
  })
}

async function onAdd() {
  if (outOfStock.value) return
  if (atMaxStock.value) {
    toast.add({
      title: t('موجودی کافی نیست'),
      color: 'warning',
      icon: 'i-tabler-package-off',
    })
    return
  }
  const ok = await addToCart(props.product.id, 1, props.variantId)
  if (ok === false) {
    toast.add({
      title: t('افزودن به سبد ممکن نیست'),
      description: t('محصول غیرفعال است یا موجودی کافی نیست'),
      color: 'warning',
      icon: 'i-tabler-alert-circle',
    })
    return
  }
  notifyAdded()
}

async function onIncreaseQty() {
  if (!cartLineId.value || atMaxStock.value) {
    if (atMaxStock.value) {
      toast.add({
        title: t('بیشتر از موجودی نمی‌توان افزود'),
        color: 'warning',
        icon: 'i-tabler-package-off',
      })
    }
    return
  }
  const ok = await updateQty(cartLineId.value, qty.value + 1)
  if (ok === false) {
    toast.add({
      title: t('بیشتر از موجودی نمی‌توان افزود'),
      color: 'warning',
      icon: 'i-tabler-package-off',
    })
  }
}

function onConsult() {
  if (!supportTelHref.value) {
    toast.add({
      title: t('شماره پشتیبانی تنظیم نشده است'),
      color: 'warning',
      icon: 'i-tabler-phone-off',
    })
    return
  }
  window.location.href = supportTelHref.value
}

function onToggleCompare() {
  toggleCompare(props.product.id)
}
</script>
