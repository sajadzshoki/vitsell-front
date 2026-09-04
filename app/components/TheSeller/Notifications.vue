<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('اعلان‌ها')"
        :description="$t('کمپین‌های اعلان کاربران — ارسال، زمان‌بندی و لغو')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('اعلان')}` : undefined"
      >
        <template #actions>
          <UButton
            to="/seller/notifications/new"
            color="primary"
            size="sm"
            icon="i-tabler-send"
            class="font-medium cursor-pointer"
          >
            {{ $t('ارسال اعلان') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/notifications/new"
        color="primary"
        block
        icon="i-tabler-send"
        class="font-medium cursor-pointer"
      >
        {{ $t('ارسال اعلان') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی عنوان یا توضیحات')"
      :has-active="hasActiveFilters || typeFilter !== 'all'"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAllFilters"
    >
      <template #extra>
        <USelect
          :model-value="typeFilter"
          :items="typeFilterItems"
          value-key="value"
          class="w-44"
          :placeholder="$t('نوع')"
          @update:model-value="setType(String($event ?? 'all'))"
        />
      </template>
    </TheSellerListToolbar>

    <div
      v-if="(loading || pending) && !campaigns.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!campaigns.length"
      icon="i-tabler-bell"
      :message="hasActiveFilters || typeFilter !== 'all'
        ? $t('اعلانی با این فیلتر پیدا نشد')
        : $t('هنوز اعلانی ارسال نشده است')"
    >
      <template
        v-if="!hasActiveFilters && typeFilter === 'all'"
        #actions
      >
        <UButton
          to="/seller/notifications/new"
          color="primary"
          variant="soft"
          icon="i-tabler-send"
          class="cursor-pointer"
        >
          {{ $t('ارسال اولین اعلان') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <div class="size-11 rounded-xl bg-default border border-muted text-primary grid place-items-center shrink-0 overflow-hidden">
            <img
              v-if="campaign.image"
              :src="campaign.image"
              :alt="campaign.title"
              class="size-full object-cover"
            >
            <UIcon
              v-else
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
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  color="info"
                  variant="subtle"
                  size="sm"
                  class="font-medium shrink-0"
                >
                  {{ $t(sellerNotificationTypeMeta[campaign.type]?.label || campaign.type) }}
                </UBadge>
                <UBadge
                  :color="sellerNotificationStatusMeta[campaign.status].color"
                  variant="subtle"
                  size="sm"
                  class="font-medium shrink-0"
                >
                  {{ $t(sellerNotificationStatusMeta[campaign.status].label) }}
                </UBadge>
              </div>
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
                v-if="campaign.scheduledAt && campaign.status === 'scheduled'"
                class="num"
              >
                {{ $t('زمان‌بندی') }}: {{ formatTime(campaign.scheduledAt) }}
              </span>
              <span
                v-else-if="campaign.sentAt"
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
                class="cursor-pointer"
              >
                {{ $t('مشاهده لینک') }}
              </UButton>
              <UButton
                v-if="campaign.status === 'scheduled'"
                type="button"
                color="warning"
                variant="ghost"
                size="xs"
                icon="i-tabler-calendar-off"
                class="cursor-pointer"
                :loading="cancellingId === campaign.id"
                @click="onCancel(campaign)"
              >
                {{ $t('لغو زمان‌بندی') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(campaign)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="pageCount > 1"
        class="mt-5 flex justify-center"
      >
        <UPagination
          v-model:page="page"
          :total="listMeta.total"
          :items-per-page="listMeta.pageSize || pageSize"
        />
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
            class="cursor-pointer"
            :disabled="deleting"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
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
  sellerNotificationStatusMeta,
  sellerNotificationTypeMeta,
  type SellerNotificationCampaign,
  type SellerNotificationType,
} from '~/data/seller-notifications'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  campaigns,
  listMeta,
  pending,
  fetchList,
  deleteCampaign,
  cancelScheduled,
} = useSellerNotifications()
const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerNotificationCampaign | null>(null)
const deleting = ref(false)
const cancellingId = ref<string | null>(null)

const typeFilter = computed(() => String(route.query.type ?? 'all'))

const typeFilterItems = computed(() => [
  { label: t('همه انواع'), value: 'all' },
  ...(Object.keys(sellerNotificationTypeMeta) as SellerNotificationType[]).map(value => ({
    label: t(sellerNotificationTypeMeta[value].label),
    value,
  })),
])

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'draft', label: t(sellerNotificationStatusMeta.draft.label), count: Number(c.draft) || 0 },
    { id: 'scheduled', label: t(sellerNotificationStatusMeta.scheduled.label), count: Number(c.scheduled) || 0 },
    { id: 'sent', label: t(sellerNotificationStatusMeta.sent.label), count: Number(c.sent) || 0 },
    { id: 'failed', label: t(sellerNotificationStatusMeta.failed.label), count: Number(c.failed) || 0 },
    { id: 'cancelled', label: t(sellerNotificationStatusMeta.cancelled.label), count: Number(c.cancelled) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function setType(value: string) {
  await patchQuery({
    type: value && value !== 'all' ? value : undefined,
    page: undefined,
  })
}

async function clearAllFilters() {
  await clearFilters()
  await patchQuery({ type: undefined })
}

async function loadNotifications() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      type: typeFilter.value !== 'all' ? typeFilter.value : undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری اعلان‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

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

async function onCancel(campaign: SellerNotificationCampaign) {
  cancellingId.value = campaign.id
  try {
    const result = await cancelScheduled(campaign.id)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('زمان‌بندی لغو شد'))
    await loadNotifications()
  }
  finally {
    cancellingId.value = null
  }
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
    await loadNotifications()
  }
  finally {
    deleting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadNotifications()
  },
  { deep: true },
)

onMounted(() => {
  void loadNotifications()
})
</script>
