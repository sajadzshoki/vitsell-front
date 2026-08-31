<template>
  <div>
    <div
      v-if="!item"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-megaphone-off"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('پرومو پیدا نشد') }}
      </p>
      <UButton
        to="/seller/promotions?tab=promos"
        color="primary"
        variant="soft"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>
    <TheSellerContentPromoForm
      v-else
      :initial="item"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getPromo } = useSellerPromotions()

definePageMeta({
  layout: 'seller',
  middleware: 'auth',
})

ensureLoaded()

const id = computed(() => String(route.params.id ?? ''))
const item = computed(() => getPromo(id.value) ?? null)

useSeoMeta({
  title: () => item.value
    ? `${t('ویرایش پرومو')} · ${item.value.title}`
    : t('ویرایش پرومو'),
})
</script>
