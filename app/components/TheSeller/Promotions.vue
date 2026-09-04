<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ $t('تخفیف و پروموشن') }}
          </h2>
          <p
            v-if="!loading"
            class="text-xs text-muted mt-1 num"
          >
            {{ listMeta.total.toLocaleString('fa-IR') }}
            {{ activeTab === 'codes' ? $t('کوپن') : $t('پرومو') }}
          </p>
        </div>
        <UButton
          :to="activeTab === 'codes' ? '/seller/promotions/codes/new' : '/seller/promotions/promos/new'"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium cursor-pointer"
        >
          {{ activeTab === 'codes' ? $t('افزودن کوپن') : $t('افزودن پرومو') }}
        </UButton>
      </div>

      <div class="lg:hidden mb-4">
        <UButton
          :to="activeTab === 'codes' ? '/seller/promotions/codes/new' : '/seller/promotions/promos/new'"
          color="primary"
          block
          icon="i-tabler-plus"
          class="font-medium cursor-pointer"
        >
          {{ activeTab === 'codes' ? $t('افزودن کوپن') : $t('افزودن پرومو') }}
        </UButton>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
        <UButton
          :color="activeTab === 'codes' ? 'primary' : 'neutral'"
          :variant="activeTab === 'codes' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="setTab('codes')"
        >
          {{ $t('کوپن‌ها') }}
          <span class="num ms-1">{{ (codesListMeta.statusCounts.all || 0).toLocaleString('fa-IR') }}</span>
        </UButton>
        <UButton
          :color="activeTab === 'promos' ? 'primary' : 'neutral'"
          :variant="activeTab === 'promos' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="setTab('promos')"
        >
          {{ $t('پروموها') }}
          <span class="num ms-1">{{ (promosListMeta.statusCounts.all || 0).toLocaleString('fa-IR') }}</span>
        </UButton>
      </div>

      <TheSellerListToolbar
        v-model:search="search"
        :status="status"
        :tabs="statusTabs"
        :search-placeholder="activeTab === 'codes' ? $t('جستجوی کد یا نام کوپن') : $t('جستجوی پرومو')"
        :has-active="hasActiveFilters"
        :clear-label="$t('پاک کردن فیلترها')"
        @update:status="status = $event"
        @clear="clearFilters"
      />

      <!-- Codes -->
      <div
        v-if="activeTab === 'codes'"
        class="space-y-3"
      >
        <div
          v-if="(loading || pending) && !codes.length"
          class="py-16 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-8 text-primary animate-spin"
          />
        </div>

        <TheSellerEmptyState
          v-else-if="!codes.length"
          icon="i-tabler-ticket"
          :message="hasActiveFilters ? $t('کوپنی با این فیلتر پیدا نشد') : $t('کوپنی پیدا نشد')"
        />

        <template v-else>
          <div
            v-for="item in codes"
            :key="item.code"
            class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
          >
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="min-w-0">
                <div
                  class="text-sm font-bold text-highlighted num"
                  dir="ltr"
                >
                  {{ item.code }}
                </div>
                <div
                  v-if="item.name"
                  class="text-xs text-toned mt-0.5"
                >
                  {{ item.name }}
                </div>
                <div class="mt-1 flex flex-wrap gap-2">
                  <UBadge
                    color="error"
                    variant="subtle"
                    size="sm"
                    class="font-medium num"
                  >
                    {{
                      item.discountType === 'fixed'
                        ? `${formatMoneyFa(item.fixedAmount || 0)} ${$t('تومان')}`
                        : `${item.percent.toLocaleString('fa-IR')}٪`
                    }}
                  </UBadge>
                  <UBadge
                    :color="scheduleBadge(item).color"
                    variant="subtle"
                    size="sm"
                  >
                    {{ $t(scheduleBadge(item).label) }}
                  </UBadge>
                  <UBadge
                    v-if="item.oncePerUser || item.perCustomerLimit === 1"
                    color="info"
                    variant="subtle"
                    size="sm"
                  >
                    {{ $t('یک‌بار برای هر کاربر') }}
                  </UBadge>
                </div>
                <div class="mt-2 text-[11px] text-muted num">
                  {{ formatPromoRange(item.startsAt, item.endsAt) }}
                </div>
                <div class="mt-1 text-[11px] text-muted">
                  {{ $t('حداقل مبلغ') }}:
                  <span class="font-bold num text-highlighted">
                    {{ formatMoneyFa(item.minAmount) }}
                  </span>
                  {{ $t('تومان') }}
                  <span
                    v-if="item.usageLimit != null"
                    class="ms-2"
                  >
                    · {{ $t('استفاده') }}:
                    <span class="num font-medium text-highlighted">
                      {{ (item.usageCount || 0).toLocaleString('fa-IR') }}/{{ item.usageLimit.toLocaleString('fa-IR') }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <UButton
                  :to="`/seller/promotions/codes/${item.code}`"
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
                  :color="item.active ? 'neutral' : 'success'"
                  variant="ghost"
                  size="xs"
                  class="cursor-pointer"
                  @click="toggleCode(item)"
                >
                  {{ item.active ? $t('غیرفعال') : $t('فعال') }}
                </UButton>
                <UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  class="cursor-pointer"
                  @click="openDeleteCode(item)"
                />
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
        </template>
      </div>

      <!-- Promos -->
      <div
        v-else
        class="space-y-3"
      >
        <div
          v-if="(loading || pending) && !promos.length"
          class="py-16 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-8 text-primary animate-spin"
          />
        </div>

        <TheSellerEmptyState
          v-else-if="!promos.length"
          icon="i-tabler-megaphone"
          :message="hasActiveFilters ? $t('پرومویی با این فیلتر پیدا نشد') : $t('پرومویی پیدا نشد')"
        />

        <template v-else>
          <div
            v-for="item in promos"
            :key="item.id"
            class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="size-11 rounded-xl grid place-items-center shrink-0"
                :class="item.tone === 'warning' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary'"
              >
                <UIcon
                  :name="`i-tabler-${item.icon}`"
                  class="size-5"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <div class="min-w-0">
                    <div class="text-[11px] text-muted">
                      {{ item.eyebrow }}
                    </div>
                    <div class="text-sm font-medium text-highlighted mt-0.5">
                      {{ item.title }}
                    </div>
                    <div class="text-xs text-muted mt-1 line-clamp-2 leading-5">
                      {{ item.subtitle }}
                    </div>
                  </div>
                  <UBadge
                    :color="item.active ? 'success' : 'neutral'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ item.active ? $t('فعال') : $t('غیرفعال') }}
                  </UBadge>
                </div>
                <div class="mt-3 flex items-center gap-2 flex-wrap">
                  <UButton
                    :to="`/seller/promotions/promos/${item.id}`"
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
                    :color="item.active ? 'neutral' : 'success'"
                    variant="ghost"
                    size="xs"
                    class="cursor-pointer"
                    @click="togglePromo(item)"
                  >
                    {{ item.active ? $t('غیرفعال') : $t('فعال') }}
                  </UButton>
                  <UButton
                    type="button"
                    color="error"
                    variant="ghost"
                    size="xs"
                    icon="i-tabler-trash"
                    class="cursor-pointer"
                    @click="openDeletePromo(item)"
                  />
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
        </template>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="deleteMode === 'code' ? $t('حذف کوپن') : $t('حذف پرومو')"
      :description="deleteMode === 'code'
        ? $t('این کوپن برای همیشه حذف می‌شود.')
        : $t('این پرومو برای همیشه حذف می‌شود.')"
    >
      <template #body>
        <div class="rounded-xl border border-muted bg-muted/40 p-4 text-sm font-medium text-highlighted">
          {{ deleteLabel }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            :disabled="actionBusy"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="actionBusy"
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
  formatMoneyFa,
  formatPromoRange,
  type SellerContentPromo,
  type SellerDiscountCode,
} from '~/data/seller-promotions'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  codes,
  promos,
  codesListMeta,
  promosListMeta,
  pending,
  fetchCodesList,
  fetchPromosList,
  deleteCode,
  setCodeActive,
  deletePromo,
  setPromoActive,
} = useSellerPromotions()
const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

type TabId = 'codes' | 'promos'

const loading = ref(true)
const deleteOpen = ref(false)
const deleteMode = ref<'code' | 'promo'>('code')
const pendingCode = ref<SellerDiscountCode | null>(null)
const pendingPromo = ref<SellerContentPromo | null>(null)
const actionBusy = ref(false)

const activeTab = computed<TabId>(() =>
  route.query.tab === 'promos' ? 'promos' : 'codes',
)

const listMeta = computed(() =>
  activeTab.value === 'codes' ? codesListMeta.value : promosListMeta.value,
)

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  if (activeTab.value === 'codes') {
    return [
      { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
      { id: 'active', label: t('فعال'), count: Number(c.active) || 0 },
      { id: 'scheduled', label: t('زمان‌بندی‌شده'), count: Number(c.scheduled) || 0 },
      { id: 'paused', label: t('متوقف'), count: Number(c.paused) || 0 },
      { id: 'expired', label: t('منقضی'), count: Number(c.expired) || 0 },
    ]
  }
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'active', label: t('فعال'), count: Number(c.active) || 0 },
    { id: 'inactive', label: t('غیرفعال'), count: Number(c.inactive) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

const deleteLabel = computed(() => {
  if (deleteMode.value === 'code') return pendingCode.value?.code ?? ''
  return pendingPromo.value?.title ?? ''
})

function scheduleBadge(item: SellerDiscountCode) {
  const statusKey = deriveScheduleStatus({
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    active: item.active,
  })
  return sellerScheduleStatusMeta[statusKey]
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function setTab(tab: TabId) {
  await patchQuery({
    tab: tab === 'codes' ? undefined : tab,
    status: undefined,
    page: undefined,
    q: undefined,
  })
}

async function loadList() {
  loading.value = true
  try {
    const query = {
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize,
    }
    const { ok, error } = activeTab.value === 'codes'
      ? await fetchCodesList(query)
      : await fetchPromosList(query)
    if (!ok) {
      toast.error(apiErrorMessage(
        error,
        activeTab.value === 'codes'
          ? t('بارگذاری کوپن‌ها ناموفق بود')
          : t('بارگذاری پروموها ناموفق بود'),
      ))
    }
  }
  finally {
    loading.value = false
  }
}

async function toggleCode(item: SellerDiscountCode) {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    const result = await setCodeActive(item.code, !item.active)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(item.active ? t('کوپن غیرفعال شد') : t('کوپن فعال شد'))
    await loadList()
  }
  finally {
    actionBusy.value = false
  }
}

async function togglePromo(item: SellerContentPromo) {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    const result = await setPromoActive(item.id, !item.active)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(item.active ? t('پرومو غیرفعال شد') : t('پرومو فعال شد'))
    await loadList()
  }
  finally {
    actionBusy.value = false
  }
}

function openDeleteCode(item: SellerDiscountCode) {
  deleteMode.value = 'code'
  pendingCode.value = item
  pendingPromo.value = null
  deleteOpen.value = true
}

function openDeletePromo(item: SellerContentPromo) {
  deleteMode.value = 'promo'
  pendingPromo.value = item
  pendingCode.value = null
  deleteOpen.value = true
}

async function confirmDelete() {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    if (deleteMode.value === 'code' && pendingCode.value) {
      const result = await deleteCode(pendingCode.value.code)
      deleteOpen.value = false
      pendingCode.value = null
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(t('کوپن حذف شد'))
      await loadList()
      return
    }
    if (pendingPromo.value) {
      const result = await deletePromo(pendingPromo.value.id)
      deleteOpen.value = false
      pendingPromo.value = null
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(t('پرومو حذف شد'))
      await loadList()
    }
  }
  finally {
    actionBusy.value = false
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
  await loadList()
  // Warm the inactive tab so badge counts stay available
  if (activeTab.value === 'codes') {
    void fetchPromosList({ page: 1, pageSize }, { trackPending: false })
  }
  else {
    void fetchCodesList({ page: 1, pageSize }, { trackPending: false })
  }
})
</script>
