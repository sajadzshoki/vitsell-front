<template>
  <div
    class="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-muted bg-default/95 backdrop-blur-md px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px] shadow-inverted/10"
  >
    <div class="flex items-center justify-between gap-3 max-w-8xl mx-auto">
      <template v-if="outOfStock && !allowBackorder">
        <UButton
          type="button"
          color="primary"
          size="xl"
          class="flex-1 font-bold h-12 rounded-xl"
          icon="i-tabler-phone-call"
          @click="onConsult"
        >
          {{ $t('دریافت مشاوره') }}
        </UButton>
      </template>
      <template v-else-if="qty > 0">
        <div class="flex items-center gap-1 bg-default rounded-xl border border-muted p-1 shrink-0">
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
          <span class="min-w-8 px-1 text-center text-base font-bold text-highlighted num">
            {{ qty.toLocaleString('fa-IR') }}
          </span>
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

      <div
        v-if="!(outOfStock && !allowBackorder)"
        class="shrink-0 text-end"
      >
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
  variantId?: string
}>()

const emit = defineEmits<{
  add: []
}>()

const { t } = useI18n()
const toast = useToast()
const { getCartQty, getCartLineId, updateQty } = useShop()
const { currencyLabel, site } = useSiteSettings()

const qty = computed(() => getCartQty(props.product.id, props.variantId))
const cartLineId = computed(() => getCartLineId(props.product.id, props.variantId))
const outOfStock = computed(() =>
  props.product.published === false || props.product.inStock === false,
)
const allowBackorder = computed(() => site.value.outOfStockBehavior === 'allow_backorder')
const maxStock = computed(() => {
  const stock = Number(props.product.stock)
  return Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : null
})
const atMaxStock = computed(() =>
  !allowBackorder.value
  && maxStock.value != null
  && qty.value >= maxStock.value,
)

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

const supportTelHref = computed(() => {
  const raw = site.value.supportPhone?.trim() || site.value.phone?.trim() || ''
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, '')
  return `tel:${digits || raw}`
})

const discount = computed(() => {
  const { oldPrice, price } = props.product
  if (!oldPrice) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})

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
</script>
