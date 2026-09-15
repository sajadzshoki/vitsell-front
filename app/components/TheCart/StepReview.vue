<template>
  <div class="space-y-5">
    <div>
      <h2 class="font-bold text-highlighted mb-1">
        {{ $t('بازبینی نهایی سفارش') }}
      </h2>
      <p class="text-xs text-muted leading-7">
        {{ $t('لطفاً قبل از تایید نهایی، اطلاعات سفارش خود را بررسی کنید.') }}
      </p>
    </div>

    <div class="bg-muted rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-bold text-default">
          {{ $t('آدرس تحویل') }}
        </h4>
        <UButton
          type="button"
          color="primary"
          variant="link"
          size="xs"
          @click="store.goToStep(1)"
        >
          {{ $t('ویرایش') }}
        </UButton>
      </div>
      <div
        v-if="selectedAddress"
        class="text-xs text-toned leading-6"
      >
        <div class="font-medium text-default mb-1">
          {{ selectedAddress.fullName }} — {{ selectedAddress.phone }}
        </div>
        <div>
          {{ selectedAddress.province }}، {{ selectedAddress.city }}، {{ selectedAddress.address }}
        </div>
      </div>
    </div>

    <div class="bg-muted rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-bold text-default">
          {{ $t('روش ارسال') }}
        </h4>
        <UButton
          type="button"
          color="primary"
          variant="link"
          size="xs"
          @click="store.goToStep(2)"
        >
          {{ $t('ویرایش') }}
        </UButton>
      </div>
      <div class="text-xs text-toned">
        {{ shippingOption ? $t(shippingOption.name) : '' }}
        —
        <span class="num">
          {{ shippingCost === 0
            ? $t('رایگان')
            : `${formatPrice(shippingCost)} ${$t('تومان')}` }}
        </span>
      </div>
    </div>

    <div class="bg-muted rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-bold text-default">
          {{ $t('روش پرداخت') }}
        </h4>
        <UButton
          type="button"
          color="primary"
          variant="link"
          size="xs"
          @click="store.goToStep(3)"
        >
          {{ $t('ویرایش') }}
        </UButton>
      </div>
      <div class="text-xs text-toned">
        {{ paymentOption ? $t(paymentOption.name) : '' }}
      </div>
    </div>

    <div class="bg-muted rounded-2xl p-4">
      <h4 class="text-sm font-bold text-default mb-3">
        {{ $t('کالاها') }}
        ({{ cartLines.length.toLocaleString('fa-IR') }})
      </h4>
      <div class="space-y-3">
        <div
          v-for="line in cartLines"
          :key="line.id"
          class="flex gap-3 items-center"
        >
          <TheIcon
            v-if="line.product.image"
            :name="line.product.image"
            icon-type="img"
            class="!size-14 rounded-lg object-cover bg-elevated shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-default line-clamp-1">
              {{ line.product.title }}
            </div>
            <div
              v-if="line.variantLabel"
              class="text-[10px] text-toned"
            >
              {{ line.variantLabel }}
            </div>
            <div class="text-[10px] text-dimmed num">
              {{ $t('تعداد') }}: {{ line.qty.toLocaleString('fa-IR') }}
            </div>
          </div>
          <div class="text-xs font-bold num text-default shrink-0">
            {{ formatPrice(line.product.price * line.qty) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const store = useCheckoutStore()
const {
  selectedAddress,
  shippingOption,
  paymentOption,
  shippingCost,
} = storeToRefs(store)

const { cartLines } = useShop()
</script>
