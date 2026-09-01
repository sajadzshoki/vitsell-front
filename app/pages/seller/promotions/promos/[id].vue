<template>
  <div>
    <div
      v-if="loading"
      class="space-y-5"
    >
      <USkeleton class="h-40 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>
    <div
      v-else-if="!item"
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
import type { SellerContentPromo } from '~/data/seller-promotions'

const { t } = useI18n()
const route = useRoute()
const { fetchPromo } = useSellerPromotions()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const promoId = computed(() => String(route.params.id ?? ''))
const item = ref<SellerContentPromo | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const { ok, item: fetched } = await fetchPromo(promoId.value, { force: true })
    item.value = ok ? fetched : null
  }
  finally {
    loading.value = false
  }
}

watch(promoId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => item.value
    ? `${t('ویرایش پرومو')} · ${item.value.title}`
    : t('ویرایش پرومو'),
})
</script>
