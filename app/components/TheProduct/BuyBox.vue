<template>
  <div>
    <div class="hidden lg:block bg-muted rounded-2xl p-5 lg:sticky lg:top-36 lg:z-10">
      <div class="flex items-start justify-between">
        <div class="space-y-2.5 mb-4 pb-4">
          <div class="flex items-center gap-2 text-xs text-toned">
            <span class="size-2 rounded-full bg-success shrink-0" />
            {{ product.inStock === false ? $t('ناموجود') : $t('موجود در انبار') }}
          </div>
        </div>
        <div class="flex flex-col gap-1">
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
            <span class="text-xs text-muted">{{ $t('تومان') }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="qty > 0"
        class="flex items-center justify-between bg-default rounded-xl p-2 mb-3 border border-primary shadow-md shadow-primary/10"
      >
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          square
          :icon="qty === 1 ? 'i-tabler-trash' : undefined"
          :aria-label="qty === 1 ? $t('حذف از سبد') : $t('کاهش تعداد')"
          @click="updateQty(product.id, qty - 1)"
        >
          <span v-if="qty > 1">−</span>
        </UButton>
        <div class="flex flex-col items-center">
          <span class="text-sm font-bold text-primary num">
            {{ qty.toLocaleString('fa-IR') }}
          </span>
          <span class="text-[10px] text-dimmed">{{ $t('در سبد شما') }}</span>
        </div>
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
      @add="onAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { formatPrice, type Product } from '~/data/products'

const props = defineProps<{
  product: Product
}>()

const { t } = useI18n()
const toast = useToast()
const { addToCart, getCartQty, updateQty } = useShop()
const compareStore = useCompareStore()
const { toggleCompare } = useCompareActions()

const buyNotes = computed(() => props.product.buyNotes ?? [])

const qty = computed(() => getCartQty(props.product.id))
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

function onAdd() {
  addToCart(props.product.id, 1)
  notifyAdded()
}

function onToggleCompare() {
  toggleCompare(props.product.id)
}
</script>
