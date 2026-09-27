<template>
  <main class="w-full py-2 md:py-4">
    <nav class="text-xs text-muted flex items-center gap-2 mb-4 flex-wrap">
      <NuxtLink to="/" class="hover:text-primary transition">{{ $t('خانه') }}</NuxtLink>
      <span class="text-dimmed">/</span>
      <NuxtLink to="/account/orders" class="hover:text-primary transition">{{ $t('سفارش‌های من') }}</NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned num" dir="ltr">{{ orderId }}</span>
    </nav>

    <TheOrderDetail :order-id="orderId" />
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const toast = useAppToast()

const orderId = computed(() => String(route.params.id ?? ''))

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('جزئیات سفارش'),
})

if (import.meta.client && route.query.payment === 'ok') {
  toast.success(t('پرداخت با موفقیت انجام شد'))
  navigateTo({ path: route.path, query: {} }, { replace: true })
}
</script>
