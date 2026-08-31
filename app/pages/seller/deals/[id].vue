<template>
  <div>
    <div
      v-if="!deal"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-bolt-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('شگفت‌انگیز پیدا نشد') }}
      </p>
      <UButton
        to="/seller/deals"
        color="primary"
        variant="soft"
      >
        {{ $t('بازگشت به شگفت‌انگیزها') }}
      </UButton>
    </div>
    <TheSellerDealForm
      v-else
      :initial="deal"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerDeals()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

ensureLoaded()

const dealId = computed(() => String(route.params.id ?? ''))
const deal = computed(() => getById(dealId.value) ?? null)

useSeoMeta({
  title: () => deal.value
    ? `${t('ویرایش شگفت‌انگیز')} · ${deal.value.id}`
    : t('ویرایش شگفت‌انگیز'),
})
</script>
