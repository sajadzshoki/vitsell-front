<template>
  <div>
    <div
      v-if="!campaign"
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
const { t } = useI18n()
const route = useRoute()
const { ensureLoaded, getById } = useSellerCampaigns()

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'admin'],
})

ensureLoaded()

const campaignId = computed(() => String(route.params.id ?? ''))
const campaign = computed(() => getById(campaignId.value) ?? null)

useSeoMeta({
  title: () => campaign.value
    ? `${t('ویرایش کمپین')} · ${campaign.value.name}`
    : t('ویرایش کمپین'),
})
</script>
