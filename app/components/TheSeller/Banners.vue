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
          class="font-medium"
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
        class="font-medium"
      >
        {{ $t('افزودن بنر') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی بنر، لینک یا دسته')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          v-for="tab in typeTabs"
          :key="tab.id"
          :color="typeFilter === tab.id ? 'primary' : 'neutral'"
          :variant="typeFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="typeFilter = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
      <UButton
        v-for="tab in activeTabs"
        :key="tab.id"
        :color="activeFilter === tab.id ? 'primary' : 'neutral'"
        :variant="activeFilter === tab.id ? 'soft' : 'ghost'"
        size="sm"
        class="shrink-0"
        @click="activeFilter = tab.id"
      >
        {{ $t(tab.label) }}
      </UButton>
    </div>

    <div
      v-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-photo"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ query.trim() || typeFilter !== 'all' || activeFilter !== 'all'
          ? $t('بنری با این فیلتر پیدا نشد')
          : $t('هنوز بنری ثبت نشده است') }}
      </p>
      <UButton
        v-if="!query.trim() && typeFilter === 'all' && activeFilter === 'all'"
        to="/seller/banners/new"
        color="primary"
        variant="soft"
        icon="i-tabler-plus"
      >
        {{ $t('افزودن اولین بنر') }}
      </UButton>
    </div>

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
          <div class="size-20 sm:w-28 sm:h-20 rounded-xl bg-default border border-muted overflow-hidden shrink-0">
            <img
              v-if="banner.image"
              :src="banner.image"
              :alt="banner.id"
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
                <div
                  class="text-sm font-medium text-highlighted truncate num"
                  dir="ltr"
                >
                  {{ banner.id }}
                </div>
                <div
                  class="text-[11px] text-muted mt-0.5 truncate num"
                  dir="ltr"
                >
                  {{ banner.link }}
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
                  :color="banner.active ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ banner.active ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
              </div>
            </div>

            <div class="mt-2 text-[11px] text-muted">
              {{ $t('دسته') }}:
              <span class="font-medium text-highlighted">
                {{ categoryLabel(banner.categoryId) }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                :to="`/seller/banners/${banner.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                :color="banner.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
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
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
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
  sellerBannerTypeMeta,
  type SellerBanner,
  type SellerBannerType,
} from '~/data/seller-banners'

const { t } = useI18n()
const toast = useAppToast()
const { banners, ensureLoaded, deleteBanner, setActive } = useSellerBanners()
const { categories, fetchCategories, getCategoryById } = useCategories()

const query = ref('')
const typeFilter = ref<'all' | SellerBannerType>('all')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBanner | null>(null)

const typeTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'main' as const, label: 'بنر اصلی' },
  { id: 'secondary' as const, label: 'بنر فرعی' },
]

const activeTabs = [
  { id: 'all' as const, label: 'همه وضعیت‌ها' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'inactive' as const, label: 'غیرفعال' },
]

ensureLoaded()
await fetchCategories({ withCounts: false })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return banners.value.filter((banner) => {
    if (typeFilter.value !== 'all' && banner.type !== typeFilter.value) return false
    if (activeFilter.value === 'active' && !banner.active) return false
    if (activeFilter.value === 'inactive' && banner.active) return false
    if (!q) return true
    const categoryName = categoryLabel(banner.categoryId).toLowerCase()
    return (
      banner.id.toLowerCase().includes(q)
      || banner.link.toLowerCase().includes(q)
      || (banner.categoryId ?? '').toLowerCase().includes(q)
      || categoryName.includes(q)
    )
  })
})

function categoryLabel(categoryId: string | null) {
  if (!categoryId) return t('بدون دسته')
  return getCategoryById(categoryId)?.name
    || categories.value.find(c => c.id === categoryId)?.name
    || categoryId
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
