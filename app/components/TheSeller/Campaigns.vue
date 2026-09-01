<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('کمپین‌ها')"
        :description="$t('کمپین‌های بازاریابی ترکیبی — بنر، تخفیف، کوپن و شگفت‌انگیز')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('کمپین')}`"
      >
        <template #actions>
          <UButton
            v-if="canPerm('campaigns.create')"
            to="/seller/campaigns/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('افزودن کمپین') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        v-if="canPerm('campaigns.create')"
        to="/seller/campaigns/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن کمپین') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام، شناسه یا اسلاگ')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="selectedIds.length && canBulk"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <USelect
        v-model="bulkAction"
        :items="bulkActionItems"
        value-key="value"
        class="w-44"
        :placeholder="$t('اقدام گروهی')"
      />
      <UButton
        type="button"
        color="primary"
        size="xs"
        class="cursor-pointer"
        :disabled="!bulkAction || bulkRunning"
        :loading="bulkRunning"
        @click="runBulk"
      >
        {{ $t('اجرا') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو انتخاب') }}
      </UButton>
    </div>

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-speakerphone"
      :message="hasActiveFilters
        ? $t('کمپینی با این فیلتر پیدا نشد')
        : $t('هنوز کمپینی ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && canPerm('campaigns.create')"
        #actions
      >
        <UButton
          to="/seller/campaigns/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین کمپین') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-if="canBulk"
        class="flex items-center gap-2 text-xs text-muted"
      >
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
      </div>

      <div
        v-for="campaign in paged"
        :key="campaign.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(campaign.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(campaign.id, !!$event)"
          />

          <div class="size-16 rounded-xl bg-default border border-muted overflow-hidden shrink-0 grid place-items-center">
            <img
              v-if="campaign.image"
              :src="campaign.image"
              :alt="campaign.name"
              class="size-full object-cover"
            >
            <TheIcon
              v-else
              icon-type="img"
              name="noImage.png"
              class="size-8 opacity-60"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/campaigns/${campaign.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition cursor-pointer"
                >
                  {{ campaign.name }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ campaign.slug || campaign.id }}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  :color="lifecycleMeta(campaign).color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(lifecycleMeta(campaign).label) }}
                </UBadge>
              </div>
            </div>

            <p
              v-if="campaign.description"
              class="text-[11px] text-muted mt-2 line-clamp-2"
            >
              {{ campaign.description }}
            </p>

            <div class="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-muted">
              <span class="num">
                {{ $t('اولویت') }}: {{ campaign.priority.toLocaleString('fa-IR') }}
              </span>
              <span>·</span>
              <span>
                {{ campaign.discountIds.length.toLocaleString('fa-IR') }} {{ $t('تخفیف') }}
              </span>
              <span>·</span>
              <span>
                {{ campaign.couponCodes.length.toLocaleString('fa-IR') }} {{ $t('کوپن') }}
              </span>
              <span>·</span>
              <span>
                {{ campaign.dealIds.length.toLocaleString('fa-IR') }} {{ $t('شگفت‌انگیز') }}
              </span>
              <span>·</span>
              <span>
                {{ campaign.bannerIds.length.toLocaleString('fa-IR') }} {{ $t('بنر') }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="canPerm('campaigns.update')"
                :to="`/seller/campaigns/${campaign.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="canPerm('campaigns.update') && campaign.manualStatus === 'active'"
                type="button"
                color="warning"
                variant="ghost"
                size="xs"
                icon="i-tabler-player-pause"
                class="cursor-pointer"
                @click="setStatus(campaign.id, 'paused')"
              >
                {{ $t('توقف') }}
              </UButton>
              <UButton
                v-if="canPerm('campaigns.update') && campaign.manualStatus !== 'active' && campaign.manualStatus !== 'archived'"
                type="button"
                color="success"
                variant="ghost"
                size="xs"
                icon="i-tabler-player-play"
                class="cursor-pointer"
                @click="setStatus(campaign.id, 'active')"
              >
                {{ $t('فعال کردن') }}
              </UButton>
              <UButton
                v-if="canPerm('campaigns.delete')"
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
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف کمپین')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود و قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شناسه') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
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
import type { SellerPermission } from '~/data/seller-permissions'
import { sellerPermissionCatalog } from '~/data/seller-permissions'
import type { SellerCampaign, SellerCampaignManualStatus } from '~/data/seller-campaigns'
import { sellerScheduleStatusMeta } from '~/data/seller-marketing-shared'

const { t } = useI18n()
const toast = useAppToast()
const { can, canAny } = useSellerPermissions()
const {
  campaigns,
  ensureLoaded,
  deleteCampaign,
  setManualStatus,
  campaignLifecycle,
} = useSellerCampaigns()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

ensureLoaded()

function canPerm(key: string) {
  const known = sellerPermissionCatalog.some(p => p.key === key)
  if (!known) return true
  return can(key as SellerPermission)
}

const pageSize = 10
const deleteOpen = ref(false)
const pendingDelete = ref<SellerCampaign | null>(null)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)

const canBulk = computed(() => {
  if (!sellerPermissionCatalog.some(p => p.key === 'campaigns.update' || p.key === 'campaigns.delete')) {
    return true
  }
  return canAny('campaigns.update' as SellerPermission, 'campaigns.delete' as SellerPermission)
})

const bulkActionItems = computed(() => {
  const items: { value: string, label: string }[] = []
  if (canPerm('campaigns.update')) {
    items.push(
      { value: 'activate', label: t('فعال‌سازی') },
      { value: 'pause', label: t('توقف') },
      { value: 'archive', label: t('بایگانی') },
    )
  }
  if (canPerm('campaigns.delete')) {
    items.push({ value: 'delete', label: t('حذف') })
  }
  return items
})

const statusTabs = computed(() => {
  const list = campaigns.value
  return [
    { id: 'all', label: t('همه'), count: list.length },
    { id: 'active', label: t('فعال'), count: list.filter(c => campaignLifecycle(c) === 'active').length },
    { id: 'draft', label: t('پیش‌نویس'), count: list.filter(c => c.manualStatus === 'draft').length },
    { id: 'paused', label: t('متوقف'), count: list.filter(c => c.manualStatus === 'paused').length },
    { id: 'archived', label: t('بایگانی'), count: list.filter(c => c.manualStatus === 'archived').length },
  ]
})

function lifecycleMeta(campaign: SellerCampaign) {
  return sellerScheduleStatusMeta[campaignLifecycle(campaign)]
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return campaigns.value.filter((campaign) => {
    if (status.value !== 'all') {
      if (status.value === 'active' || status.value === 'scheduled' || status.value === 'expired') {
        if (campaignLifecycle(campaign) !== status.value) return false
      }
      else if (campaign.manualStatus !== status.value) {
        return false
      }
    }
    if (!q) return true
    return (
      campaign.name.toLowerCase().includes(q)
      || campaign.id.toLowerCase().includes(q)
      || campaign.slug.toLowerCase().includes(q)
      || campaign.description.includes(search.value.trim())
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const allPageSelected = computed(() =>
  paged.value.length > 0 && paged.value.every(c => selectedIds.value.includes(c.id)),
)

const somePageSelected = computed(() =>
  paged.value.some(c => selectedIds.value.includes(c.id)),
)

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = paged.value.map(c => c.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

function setStatus(id: string, manualStatus: SellerCampaignManualStatus) {
  const result = setManualStatus(id, manualStatus)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('کمپین به‌روزرسانی شد'))
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    if (bulkAction.value === 'delete') {
      for (const id of selectedIds.value) deleteCampaign(id)
      toast.success(t('کمپین‌ها حذف شدند'))
    }
    else {
      const map: Record<string, SellerCampaignManualStatus> = {
        activate: 'active',
        pause: 'paused',
        archive: 'archived',
      }
      const target = map[bulkAction.value]
      if (target) {
        for (const id of selectedIds.value) setManualStatus(id, target)
        toast.success(t('کمپین‌ها به‌روزرسانی شدند'))
      }
    }
    selectedIds.value = []
    bulkAction.value = ''
  }
  finally {
    bulkRunning.value = false
  }
}

function openDelete(campaign: SellerCampaign) {
  pendingDelete.value = campaign
  deleteOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteCampaign(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('کمپین حذف شد'))
}
</script>
