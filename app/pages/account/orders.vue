<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">{{ $t('سفارش‌های من') }}</h2>
      <div
        v-if="!loading"
        class="text-xs text-muted num"
      >
        {{ orders.length.toLocaleString('fa-IR') }} {{ $t('سفارش') }}
      </div>
    </div>

    <div v-if="loading">
      <TheSkeleton
        variant="list-card"
        :count="3"
      />
    </div>

    <div
      v-else-if="orders.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-tabler-package" class="size-16 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted mb-4">{{ $t('هنوز سفارشی ثبت نکرده‌اید') }}</p>
      <UButton
        to="/"
        color="primary"
        size="lg"
        class="font-bold"
      >
        {{ $t('شروع خرید') }}
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <TheAccountOrderRow
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useAppToast()
const { orders, fetchOrders } = useAccount()

const loading = ref(true)

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function loadOrders() {
  loading.value = true
  try {
    const { error } = await fetchOrders()
    if (error) {
      toast.error(apiErrorMessage(error, t('بارگذاری سفارش‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('سفارش‌های من'),
})
</script>
