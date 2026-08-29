<template>
  <div>
    <div class="md:hidden mb-3">
      <UButton
        to="/seller/products"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت به محصولات') }}
      </UButton>
    </div>

    <TheSellerProductForm />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

useSeoMeta({
  title: () => t('افزودن محصول'),
})
</script>
