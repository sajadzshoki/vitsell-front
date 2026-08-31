<template>
  <div>
    <div class="md:hidden mb-3">
      <UButton
        to="/seller/orders"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت به سفارش‌ها') }}
      </UButton>
    </div>

    <TheSellerOrderDetail :order-id="orderId" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const orderId = computed(() => String(route.params.id ?? ''))

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

useSeoMeta({
  title: () => `${t('جزئیات سفارش')} ${orderId.value}`,
})
</script>
