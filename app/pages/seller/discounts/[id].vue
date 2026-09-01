<template>
  <div>
    <div
      v-if="!discount"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-discount"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('تخفیف پیدا نشد') }}
      </p>
      <UButton
        to="/seller/discounts"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به تخفیف‌ها') }}
      </UButton>
    </div>
    <TheSellerDiscountForm
      v-else
      :initial="discount"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerDiscounts()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureLoaded()

const discountId = computed(() => String(route.params.id ?? ''))
const discount = computed(() => getById(discountId.value) ?? null)

useSeoMeta({
  title: () => discount.value
    ? `${t('ویرایش تخفیف')} · ${discount.value.name}`
    : t('ویرایش تخفیف'),
})
</script>
