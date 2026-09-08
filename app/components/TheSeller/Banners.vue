<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('بنرها')"
        :description="$t('مدیریت بنرهای صفحه اصلی و دسته‌ها')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('بنر')}` : undefined"
      >
        <template #actions>
          <UButton
            to="/seller/banners/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="font-medium cursor-pointer"
          >
            {{ $t('افزودن بنر') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
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

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی عنوان، شناسه یا لینک')"
      :has-active="hasActiveFilters || placementFilter !== 'all'"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAllFilters"
    >
      <template #extra>
        <USelect
          :model-value="placementFilter"
          :items="placementFilterItems"
          value-key="value"
          class="w-full sm:w-56"
          :placeholder="$t('جایگاه')"
          @update:model-value="setPlacement(String($event ?? 'all'))"
        />
      </template>
    </TheSellerListToolbar>

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

    <div
      v-if="(loading || pending) && !banners.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!banners.length"
      icon="i-tabler-photo"
      :title="hasActiveFilters || placementFilter !== 'all' ? $t('نتیجه‌ای نیست') : $t('هنوز بنری نیست')"
      :message="hasActiveFilters || placementFilter !== 'all'
        ? $t('بنری با این فیلتر پیدا نشد')
        : $t('هنوز بنری ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && placementFilter === 'all'"
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
        v-for="banner in banners"
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
                <NuxtLink
                  :to="`/seller/banners/${banner.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition-all  cursor-pointer"
                >
                  {{ banner.title || banner.internalName || banner.id }}
                </NuxtLink>
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
      :title="$t('حذف بنر')"
      :description="$t('در صورت تأیید، این بنر از سرور حذف می‌شود.')"
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
  sellerBannerPlacementMeta,
  sellerBannerTypeMeta,
  type SellerBanner,
  type SellerBannerPlacement,
} from '~/data/seller-banners'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  banners,
  listMeta,
  pending,
  fetchList,
  deleteBanner,
  setActive,
  setActiveMany,
} = useSellerBanners()
const { categories, fetchCategories, getCategoryById } = useCategories()
const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const selectedIds = ref<string[]>([])
const bulkRunning = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBanner | null>(null)
const deleting = ref(false)

const placementFilter = computed(() => String(route.query.placement ?? 'all'))

const placementFilterItems = computed(() => [
  { label: t('همه جایگاه‌ها'), value: 'all' },
  ...(Object.keys(sellerBannerPlacementMeta) as SellerBannerPlacement[]).map(value => ({
    label: t(sellerBannerPlacementMeta[value].label),
    value,
  })),
])

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'active', label: t('فعال'), count: Number(c.active) || 0 },
    { id: 'scheduled', label: t('زمان‌بندی‌شده'), count: Number(c.scheduled) || 0 },
    { id: 'paused', label: t('متوقف'), count: Number(c.paused) || 0 },
    { id: 'expired', label: t('منقضی'), count: Number(c.expired) || 0 },
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

function scheduleBadge(banner: SellerBanner) {
  const key = deriveScheduleStatus({
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    active: banner.active,
  })
  return sellerScheduleStatusMeta[key]
}

function categoryLabel(categoryId: string | null) {
  if (!categoryId) return t('بدون دسته')
  return getCategoryById(categoryId)?.name
    || categories.value.find(c => c.id === categoryId)?.name
    || categoryId
}

async function setPlacement(value: string) {
  await patchQuery({
    placement: value && value !== 'all' ? value : undefined,
    page: undefined,
  })
}

async function clearAllFilters() {
  selectedIds.value = []
  await clearFilters()
  await patchQuery({ placement: undefined })
}

async function loadList() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      placement: placementFilter.value !== 'all' ? placementFilter.value : undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری بنرها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
    return
  }
  selectedIds.value = selectedIds.value.filter(x => x !== id)
}

async function runBulk(active: boolean) {
  if (!selectedIds.value.length) return
  bulkRunning.value = true
  try {
    await setActiveMany(selectedIds.value, active)
    toast.success(active ? t('بنرها فعال شدند') : t('بنرها غیرفعال شدند'))
    selectedIds.value = []
    await loadList()
  }
  finally {
    bulkRunning.value = false
  }
}

async function toggleActive(banner: SellerBanner) {
  const result = await setActive(banner.id, !banner.active)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(result.banner.active ? t('بنر فعال شد') : t('بنر غیرفعال شد'))
  await loadList()
}

function openDelete(banner: SellerBanner) {
  pendingDelete.value = banner
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteBanner(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('بنر حذف شد'))
    await loadList()
  }
  finally {
    deleting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadList()
  },
  { deep: true },
)

onMounted(async () => {
  await fetchCategories({ withCounts: false })
  void loadList()
})
</script>
