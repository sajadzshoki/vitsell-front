<template>
  <div class="max-w-2xl mx-auto py-12 md:py-16">
    <div class="bg-default border border-muted rounded-3xl p-8 md:p-12 text-center">
      <div class="size-20 mx-auto mb-6 rounded-full bg-success/15 grid place-items-center">
        <UIcon
          name="i-tabler-check"
          class="size-10 text-success"
        />
      </div>
      <h1 class="text-2xl font-bold text-highlighted mb-2">
        {{ $t('سفارش شما با موفقیت ثبت شد') }}
      </h1>
      <p class="text-sm text-muted mb-6 leading-7">
        {{ $t('از خرید شما سپاسگزاریم. جزئیات سفارش برای شما پیامک شد.') }}
      </p>
      <div class="bg-muted rounded-2xl p-5 mb-6 flex flex-col sm:(flex-row gap-8) gap-4 justify-center">
        <div>
          <div class="text-[11px] text-muted mb-1">
            {{ $t('شماره سفارش') }}
          </div>
          <div
            class="text-sm font-bold text-highlighted num"
            dir="ltr"
          >
            {{ placedOrderId }}
          </div>
        </div>
        <div class="hidden sm:block w-px bg-accented" />
        <div>
          <div class="text-[11px] text-muted mb-1">
            {{ $t('مبلغ پرداختی') }}
          </div>
          <div class="text-sm font-bold text-highlighted num">
            {{ formatPrice(lastOrderTotal) }} {{ $t('تومان') }}
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold"
          @click="onHome"
        >
          {{ $t('بازگشت به فروشگاه') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'

const store = useCheckoutStore()
const { placedOrderId, lastOrderTotal } = storeToRefs(store)

function onHome() {
  store.resetAfterOrder()
  navigateTo('/')
}
</script>
