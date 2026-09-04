<template>
  <div>
    <div
      v-if="loading"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>
    <div
      v-else-if="!discount"
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
import type { SellerDiscount } from '~/data/seller-discounts'

const { t } = useI18n()
const route = useRoute()
const { fetchDiscount } = useSellerDiscounts()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const loading = ref(true)
const discount = ref<SellerDiscount | null>(null)
const discountId = computed(() => String(route.params.id ?? ''))

async function load() {
  loading.value = true
  try {
    if (!discountId.value) {
      discount.value = null
      return
    }
    const result = await fetchDiscount(discountId.value, { force: true })
    discount.value = result.ok ? result.discount : null
  }
  finally {
    loading.value = false
  }
}

watch(discountId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => discount.value
    ? `${t('ویرایش تخفیف')} · ${discount.value.name}`
    : t('ویرایش تخفیف'),
})
</script>
