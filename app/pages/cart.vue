<template>
  <main class="w-full py-2 md:py-4">
    <TheCartStepSuccess v-if="placedOrderId" />

    <template v-else-if="cartLines.length === 0 && step === 0">
      <div class="py-12 md:py-16">
        <TheCartEmpty />
      </div>
    </template>

    <template v-else>
      <nav class="hidden md:flex items-center gap-2 text-xs text-muted mb-4 flex-wrap">
        <NuxtLink
          to="/"
          class="hover:text-primary transition"
        >
          {{ $t('خانه') }}
        </NuxtLink>
        <template
          v-for="crumb in crumbs"
          :key="crumb.id"
        >
          <span class="text-dimmed">/</span>
          <button
            v-if="crumb.clickable"
            type="button"
            class="hover:text-primary transition cursor-pointer"
            @click="store.goToStep(crumb.id)"
          >
            {{ $t(crumb.name) }}
          </button>
          <span
            v-else
            class="text-toned"
          >
            {{ $t(crumb.name) }}
          </span>
        </template>
      </nav>

      <TheCartStepper />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-8">
          <div
            v-if="step === 0"
            class="space-y-3"
          >
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-xl md:text-2xl font-bold text-highlighted">
                {{ $t('سبد خرید') }}
                <span class="text-sm font-normal text-muted num">
                  ({{ cartLines.length.toLocaleString('fa-IR') }} {{ $t('کالا') }})
                </span>
              </h1>
            </div>
            <TheCartStepItems />
          </div>

          <div
            v-else
            class="bg-default border border-muted rounded-2xl p-5 md:p-6"
          >
            <TheCartStepAddress v-if="step === 1" />
            <TheCartStepShipping v-else-if="step === 2" />
            <TheCartStepPayment v-else-if="step === 3" />
            <TheCartStepReview v-else-if="step === 4" />
          </div>

          <div
            v-if="step > 0"
            class="hidden md:flex items-center justify-between mt-4 gap-3"
          >
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="lg"
              leading-icon="i-tabler-arrow-right"
              @click="store.prevStep()"
            >
              {{ $t('مرحله قبل') }}
            </UButton>
            <UButton
              type="button"
              color="primary"
              size="lg"
              class="font-bold shadow-lg shadow-primary/25"
              :trailing-icon="step === 4 ? undefined : 'i-tabler-arrow-left'"
              :disabled="!canProceed"
              @click="onNext"
            >
              {{ step === 4 ? $t('ثبت نهایی سفارش') : $t('مرحله بعد') }}
            </UButton>
          </div>
        </div>

        <aside class="lg:col-span-4">
          <TheCartSummary v-if="step === 0" />
          <TheCartPaySummary v-else />
        </aside>
      </div>

      <TheCartMobileBar
        v-if="showMobileBar"
        :step="step"
        :total="total"
        :can-proceed="canProceed"
        @next="onNext"
        @prev="store.prevStep()"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import { checkoutSteps } from '~/data/checkout'

const { t } = useI18n()
const toast = useAppToast()

const store = useCheckoutStore()
const { step, placedOrderId } = storeToRefs(store)

const {
  cartLines,
  cartSubtotal,
  discountAmount,
  discountCode,
  clearCart,
  clearDiscount,
  hydrateShop,
  isLoggedIn,
} = useShop()

if (import.meta.client && isLoggedIn.value) {
  await Promise.all([hydrateShop(), store.fetchAddresses()])
}

const canProceed = computed(() => store.canGoNext(cartLines.value.length > 0))

const total = computed(() =>
  Math.max(0, cartSubtotal.value - discountAmount.value + store.shippingCost),
)

const showMobileBar = computed(() =>
  !placedOrderId.value && cartLines.value.length > 0,
)

const crumbs = computed(() =>
  checkoutSteps
    .filter(s => s.id <= step.value)
    .map(s => ({
      id: s.id,
      name: s.name,
      clickable: s.id < step.value,
    })),
)

async function onNext() {
  if (!canProceed.value) return
  if (step.value < 4) {
    store.nextStep()
    return
  }
  if (!store.selectedAddress) {
    toast.error(t('آدرس تحویل را انتخاب کنید'))
    return
  }
  const id = await store.placeOrder(total.value, discountCode.value)
  if (!id) {
    toast.error(t('ثبت سفارش ناموفق بود'))
    return
  }
  await clearCart()
  clearDiscount()
  toast.success(t('سفارش ثبت شد'))
}

useSeoMeta({
  title: () => t(checkoutSteps[step.value]?.name ?? 'سبد خرید'),
})
</script>
