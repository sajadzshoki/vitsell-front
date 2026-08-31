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
      v-else-if="!deal"
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
import type { SellerAmazingDeal } from '~/data/seller-deals'

const { t } = useI18n()
const route = useRoute()
const { fetchDeal } = useSellerDeals()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const dealId = computed(() => String(route.params.id ?? ''))
const deal = ref<SellerAmazingDeal | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const { ok, deal: fetched } = await fetchDeal(dealId.value, { force: true })
    deal.value = ok ? fetched : null
  }
  finally {
    loading.value = false
  }
}

watch(dealId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => deal.value
    ? `${t('ویرایش شگفت‌انگیز')} · ${deal.value.id}`
    : t('ویرایش شگفت‌انگیز'),
})
</script>
