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
      v-else-if="!campaign"
      class="bg-default border border-muted rounded-2xl p-8 text-center"
    >
      <UIcon
        name="i-tabler-speakerphone"
        class="size-14 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ $t('کمپین پیدا نشد') }}
      </p>
      <UButton
        to="/seller/campaigns"
        color="primary"
        variant="soft"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به کمپین‌ها') }}
      </UButton>
    </div>
    <TheSellerCampaignForm
      v-else
      :initial="campaign"
    />
  </div>
</template>

<script setup lang="ts">
import type { SellerCampaign } from '~/data/seller-campaigns'

const { t } = useI18n()
const route = useRoute()
const { fetchCampaign } = useSellerCampaigns()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

const loading = ref(true)
const campaign = ref<SellerCampaign | null>(null)
const campaignId = computed(() => String(route.params.id ?? ''))

async function load() {
  loading.value = true
  try {
    if (!campaignId.value) {
      campaign.value = null
      return
    }
    const result = await fetchCampaign(campaignId.value, { force: true })
    campaign.value = result.ok ? result.campaign : null
  }
  finally {
    loading.value = false
  }
}

watch(campaignId, () => {
  void load()
}, { immediate: true })

useSeoMeta({
  title: () => campaign.value
    ? `${t('ویرایش کمپین')} · ${campaign.value.name}`
    : t('ویرایش کمپین'),
})
</script>
