<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('اعلان‌ها') }}
      </h2>
      <div class="flex items-center gap-3">
        <div class="text-xs text-muted num">
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('اعلان') }}
        </div>
        <UButton
          to="/seller/notifications/new"
          color="primary"
          size="sm"
          icon="i-tabler-send"
          class="font-medium"
        >
          {{ $t('ارسال اعلان') }}
        </UButton>
      </div>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/notifications/new"
        color="primary"
        block
        icon="i-tabler-send"
        class="font-medium"
      >
        {{ $t('ارسال اعلان') }}
      </UButton>
    </div>

    <TheFormInput
      v-model="query"
      icon="i-tabler-search"
      :placeholder="$t('جستجوی عنوان یا توضیحات')"
      class="mb-4"
    />

    <div
      v-if="pending && !campaigns.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-bell"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ query.trim()
          ? $t('اعلانی با این جستجو پیدا نشد')
          : $t('هنوز اعلانی ارسال نشده است') }}
      </p>
      <UButton
        v-if="!query.trim()"
        to="/seller/notifications/new"
        color="primary"
        variant="soft"
        icon="i-tabler-send"
      >
        {{ $t('ارسال اولین اعلان') }}
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="campaign in filtered"
        :key="campaign.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-11 rounded-xl bg-default border border-muted text-primary grid place-items-center shrink-0">
            <UIcon
              :name="campaign.icon"
              class="size-5"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <div class="text-sm font-medium text-highlighted line-clamp-1">
                  {{ campaign.title }}
                </div>
                <div class="text-xs text-muted mt-1 line-clamp-2 leading-5">
                  {{ campaign.description }}
                </div>
              </div>
              <UBadge
                color="success"
                variant="subtle"
                size="sm"
                class="font-medium shrink-0"
              >
                {{ $t('ارسال‌شده') }}
              </UBadge>
            </div>

            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
              <span>
                {{ $t('مخاطب') }}:
                <span class="font-medium text-highlighted">
                  {{ $t(audienceSummary(campaign)) }}
                </span>
              </span>
              <span>
                {{ $t('گیرندگان') }}:
                <span class="font-bold num text-highlighted">
                  {{ campaign.recipientCount.toLocaleString('fa-IR') }}
                </span>
              </span>
              <span
                v-if="campaign.sentAt"
                class="num"
              >
                {{ formatTime(campaign.sentAt) }}
              </span>
            </div>

            <div
              v-if="campaign.link"
              class="mt-1 text-[11px] text-primary num truncate"
              dir="ltr"
            >
              {{ campaign.link }}
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="campaign.link"
                :to="campaign.link"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-external-link"
              >
                {{ $t('مشاهده لینک') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                @click="openDelete(campaign)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف اعلان')"
      :description="$t('با حذف کمپین، اعلان‌های مربوط در صندوق کاربران هم حذف می‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="font-medium text-highlighted">
            {{ pendingDelete.title }}
          </div>
          <div class="text-xs text-muted line-clamp-2">
            {{ pendingDelete.description }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
            :loading="deleting"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  audienceSummary,
  type SellerNotificationCampaign,
} from '~/data/seller-notifications'

const { t } = useI18n()
const toast = useAppToast()
const { campaigns, pending, ensureLoaded, deleteCampaign } = useSellerNotifications()

const query = ref('')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerNotificationCampaign | null>(null)
const deleting = ref(false)

await ensureLoaded({ force: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return campaigns.value
  return campaigns.value.filter(
    c =>
      c.title.includes(query.value.trim())
      || c.description.includes(query.value.trim())
      || (c.link ?? '').toLowerCase().includes(q),
  )
})

function formatTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openDelete(campaign: SellerNotificationCampaign) {
  pendingDelete.value = campaign
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteCampaign(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(t('اعلان حذف شد'))
  }
  finally {
    deleting.value = false
  }
}
</script>
