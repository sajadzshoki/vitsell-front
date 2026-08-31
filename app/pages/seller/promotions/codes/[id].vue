<template>
  <div>
    <div
      v-if="!item"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-ticket-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('کد تخفیف پیدا نشد') }}
      </p>
      <UButton
        to="/seller/promotions?tab=codes"
        color="primary"
        variant="soft"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>
    <TheSellerDiscountCodeForm
      v-else
      :initial="item"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getCode } = useSellerPromotions()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

ensureLoaded()

const code = computed(() => String(route.params.id ?? ''))
const item = computed(() => getCode(code.value) ?? null)

useSeoMeta({
  title: () => item.value
    ? `${t('ویرایش کد تخفیف')} · ${item.value.code}`
    : t('ویرایش کد تخفیف'),
})
</script>
