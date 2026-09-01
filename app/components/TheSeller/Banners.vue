<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('بنرها') }}
      </h2>
      <div class="flex items-center gap-3">
        <div class="text-xs text-muted num">
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('بنر') }}
        </div>
        <UButton
          to="/seller/banners/new"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium cursor-pointer"
        >
          {{ $t('افزودن بنر') }}
        </UButton>
      </div>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        to="/seller/banners/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="font-medium cursor-pointer"
      >
        {{ $t('افزودن بنر') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی عنوان، شناسه یا لینک')"
        class="flex-1 w-full"
      />
      <USelect
        v-model="placementFilter"
        :items="placementFilterItems"
        value-key="value"
        class="w-full sm:w-56"
      />
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
      <UButton
        v-for="tab in scheduleTabs"
        :key="tab.id"
        :color="scheduleFilter === tab.id ? 'primary' : 'neutral'"
        :variant="scheduleFilter === tab.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0 cursor-pointer"
        @click="scheduleFilter = tab.id"
      >
        {{ $t(tab.label) }}
      </UButton>
    </div>

    <div
      v-if="selectedIds.length"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <UButton
        type="button"
        color="success"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        :loading="bulkRunning"
        @click="runBulk(true)"
      >
        {{ $t('فعال‌سازی گروهی') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        :loading="bulkRunning"
        @click="runBulk(false)"
      >
        {{ $t('غیرفعال‌سازی گروهی') }}
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
      icon="i-tabler-photo"
      :title="query.trim() || placementFilter !== 'all' || scheduleFilter !== 'all' ? $t('نتیجه‌ای نیست') : $t('هنوز بنری نیست')"
      :message="query.trim() || placementFilter !== 'all' || scheduleFilter !== 'all'
        ? $t('بنری با این فیلتر پیدا نشد')
        : $t('هنوز بنری ثبت نشده است')"
    >
      <template
        v-if="!query.trim() && placementFilter === 'all' && scheduleFilter === 'all'"
        #actions
      >
        <UButton
          to="/seller/banners/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین بنر') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="banner in filtered"
        :key="banner.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            :model-value="selectedIds.includes(banner.id)"
            class="mt-1"
            @update:model-value="toggleSelect(banner.id, !!$event)"
          />
          <div class="size-20 sm:w-28 sm:h-20 rounded-xl bg-default border border-muted overflow-hidden shrink-0">
            <img
              v-if="banner.image"
              :src="banner.image"
              :alt="banner.alt || banner.title || banner.id"
              class="size-full object-cover"
            >
            <div
              v-else
              class="size-full grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-8 opacity-60"
              />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <div class="text-sm font-medium text-highlighted truncate">
                  {{ banner.title || banner.internalName || banner.id }}
                </div>
                <div
                  class="text-[11px] text-muted mt-0.5 truncate num"
                  dir="ltr"
                >
                  {{ banner.id }} · {{ banner.link || '—' }}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  :color="sellerBannerTypeMeta[banner.type].color"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(sellerBannerTypeMeta[banner.type].label) }}
                </UBadge>
                <UBadge
                  color="info"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(sellerBannerPlacementMeta[banner.placement]?.label || banner.placement) }}
                </UBadge>
                <UBadge
                  :color="scheduleBadge(banner).color"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(scheduleBadge(banner).label) }}
                </UBadge>
              </div>
            </div>

            <div class="mt-2 text-[11px] text-muted">
              {{ $t('دسته') }}:
              <span class="font-medium text-highlighted">
                {{ categoryLabel(banner.categoryId) }}
              </span>
              <span class="mx-2">·</span>
              {{ $t('اولویت') }}:
              <span class="font-medium num text-highlighted">{{ banner.priority }}</span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                :to="`/seller/banners/${banner.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                :color="banner.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
                class="cursor-pointer"
                :icon="banner.active ? 'i-tabler-player-pause' : 'i-tabler-player-play'"
                @click="toggleActive(banner)"
              >
                {{ banner.active ? $t('غیرفعال کردن') : $t('فعال کردن') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                class="cursor-pointer"
                icon="i-tabler-trash"
                @click="openDelete(banner)"
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
      :title="$t('حذف بنر')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود و قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شناسه') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نوع') }}</span>
            <span class="font-medium text-highlighted">
              {{ $t(sellerBannerTypeMeta[pendingDelete.type].label) }}
            </span>
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
import {
  sellerBannerPlacementMeta,
  sellerBannerTypeMeta,
  type SellerBanner,
  type SellerBannerPlacement,
} from '~/data/seller-banners'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
  type SellerScheduleStatus,
} from '~/data/seller-marketing-shared'

const { t } = useI18n()
const toast = useAppToast()
const { banners, ensureLoaded, deleteBanner, setActive, setActiveMany } = useSellerBanners()
const { categories, fetchCategories, getCategoryById } = useCategories()

const query = ref('')
const placementFilter = ref<'all' | SellerBannerPlacement>('all')
const scheduleFilter = ref<'all' | SellerScheduleStatus>('all')
const selectedIds = ref<string[]>([])
const bulkRunning = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBanner | null>(null)

const scheduleTabs = [
  { id: 'all' as const, label: 'همه وضعیت‌ها' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'scheduled' as const, label: 'زمان‌بندی‌شده' },
  { id: 'paused' as const, label: 'متوقف' },
  { id: 'expired' as const, label: 'منقضی' },
]

const placementFilterItems = computed(() => [
  { label: t('همه جایگاه‌ها'), value: 'all' },
  ...(Object.keys(sellerBannerPlacementMeta) as SellerBannerPlacement[]).map(value => ({
    label: t(sellerBannerPlacementMeta[value].label),
    value,
  })),
])

ensureLoaded()
await fetchCategories({ withCounts: false })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return banners.value.filter((banner) => {
    if (placementFilter.value !== 'all' && banner.placement !== placementFilter.value) return false
    const status = deriveScheduleStatus({
      startsAt: banner.startsAt,
      endsAt: banner.endsAt,
      active: banner.active,
    })
    if (scheduleFilter.value !== 'all' && status !== scheduleFilter.value) return false
    if (!q) return true
    const categoryName = categoryLabel(banner.categoryId).toLowerCase()
    return (
      banner.id.toLowerCase().includes(q)
      || banner.link.toLowerCase().includes(q)
      || (banner.title || '').toLowerCase().includes(q)
      || (banner.internalName || '').toLowerCase().includes(q)
      || (banner.categoryId ?? '').toLowerCase().includes(q)
      || categoryName.includes(q)
    )
  })
})

function scheduleBadge(banner: SellerBanner) {
  const status = deriveScheduleStatus({
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    active: banner.active,
  })
  return sellerScheduleStatusMeta[status]
}

function categoryLabel(categoryId: string | null) {
  if (!categoryId) return t('بدون دسته')
  return getCategoryById(categoryId)?.name
    || categories.value.find(c => c.id === categoryId)?.name
    || categoryId
}

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
    return
  }
  selectedIds.value = selectedIds.value.filter(x => x !== id)
}

function runBulk(active: boolean) {
  if (!selectedIds.value.length) return
  bulkRunning.value = true
  try {
    setActiveMany(selectedIds.value, active)
    toast.success(active ? t('بنرها فعال شدند') : t('بنرها غیرفعال شدند'))
    selectedIds.value = []
  }
  finally {
    bulkRunning.value = false
  }
}

function toggleActive(banner: SellerBanner) {
  const result = setActive(banner.id, !banner.active)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(banner.active ? t('بنر غیرفعال شد') : t('بنر فعال شد'))
}

function openDelete(banner: SellerBanner) {
  pendingDelete.value = banner
  deleteOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteBanner(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('بنر حذف شد'))
}
</script>
