<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('شگفت‌انگیزها')"
        :description="$t('مدیریت پیشنهادهای شگفت‌انگیز و زمان‌بندی')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('مورد')}` : undefined"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-stack-2"
              class="cursor-pointer"
              @click="bulkCreateOpen = true"
            >
              {{ $t('ایجاد گروهی') }}
            </UButton>
            <UButton
              to="/seller/deals/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="font-medium cursor-pointer"
            >
              {{ $t('افزودن شگفت‌انگیز') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-stack-2"
        class="cursor-pointer"
        @click="bulkCreateOpen = true"
      >
        {{ $t('ایجاد گروهی') }}
      </UButton>
      <UButton
        to="/seller/deals/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="font-medium cursor-pointer"
      >
        {{ $t('افزودن شگفت‌انگیز') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی محصول، نام یا شناسه')"
      :has-active="hasActiveFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAllFilters"
    />

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
      v-if="(loading || pending) && !deals.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!deals.length"
      icon="i-tabler-bolt"
      :message="hasActiveFilters
        ? $t('موردی با این فیلتر پیدا نشد')
        : $t('هنوز شگفت‌انگیزی ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters"
        #actions
      >
        <UButton
          to="/seller/deals/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین شگفت‌انگیز') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="deal in deals"
        :key="deal.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            :model-value="selectedIds.includes(deal.id)"
            class="mt-1"
            @update:model-value="toggleSelect(deal.id, !!$event)"
          />
          <div class="size-16 rounded-xl bg-default border border-muted overflow-hidden shrink-0">
            <img
              v-if="productOf(deal)?.image"
              :src="productOf(deal)!.image"
              :alt="productOf(deal)!.title"
              class="size-full object-cover"
            >
            <div
              v-else
              class="size-full grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-7 opacity-60"
              />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/deals/${deal.id}`"
                  class="text-sm font-medium text-highlighted line-clamp-2 block hover:text-primary transition-all  cursor-pointer"
                >
                  {{ deal.name || productOf(deal)?.title || deal.productId }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ deal.id }}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  color="error"
                  variant="subtle"
                  size="sm"
                  class="font-medium num"
                >
                  {{ deal.discountPercent.toLocaleString('fa-IR') }}٪
                </UBadge>
                <UBadge
                  :color="scheduleBadge(deal).color"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t(scheduleBadge(deal).label) }}
                </UBadge>
              </div>
            </div>

            <div class="mt-2 text-[11px] text-muted num">
              {{ formatDealRange(deal.startsAt, deal.endsAt) }}
            </div>

            <div
              v-if="productOf(deal)"
              class="mt-1 text-xs text-toned"
            >
              <span class="line-through text-muted num me-2">
                {{ formatPrice(productOf(deal)!.price) }}
              </span>
              <span class="font-bold text-error num">
                {{
                  formatPrice(
                    deal.specialPrice != null
                      ? deal.specialPrice
                      : dealPriceFrom(productOf(deal)!.price, deal.discountPercent),
                  )
                }}
              </span>
              <span class="text-muted ms-1">{{ $t('تومان') }}</span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                :to="`/seller/deals/${deal.id}`"
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
                :color="deal.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
                class="cursor-pointer"
                :loading="togglingId === deal.id"
                :icon="deal.active ? 'i-tabler-player-pause' : 'i-tabler-player-play'"
                @click="toggleActive(deal)"
              >
                {{ deal.active ? $t('غیرفعال کردن') : $t('فعال کردن') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                class="cursor-pointer"
                icon="i-tabler-trash"
                @click="openDelete(deal)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <TheSellerPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="listMeta.total"
      />
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف شگفت‌انگیز')"
      :description="$t('در صورت تأیید، این شگفت‌انگیز از سرور حذف می‌شود.')"
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
            <span class="text-muted">{{ $t('محصول') }}</span>
            <span class="font-medium text-highlighted text-end line-clamp-1 ms-3">
              {{ productOf(pendingDelete)?.title || pendingDelete.productId }}
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

    <TheSellerDealBulkCreate
      v-model:open="bulkCreateOpen"
      @created="onBulkCreated"
    />
  </div>
</template>

<script setup lang="ts">
import {
  dealPriceFrom,
  formatDealRange,
  type SellerAmazingDeal,
} from '~/data/seller-deals'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'
import { formatPrice } from '~/data/products'


const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  deals,
  listMeta,
  pending,
  fetchList,
  deleteDeal,
  setActive,
  setActiveMany,
} = useSellerDeals()
const { resolveProduct, fetchSeller } = useSeller()
const { fetchProducts, getCachedProduct } = useProducts()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

const loading = ref(true)
const selectedIds = ref<string[]>([])
const bulkRunning = ref(false)
const bulkCreateOpen = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerAmazingDeal | null>(null)
const deleting = ref(false)
const togglingId = ref<string | null>(null)

async function clearAllFilters() {
  selectedIds.value = []
  await clearFilters()
}

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


function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function scheduleBadge(deal: SellerAmazingDeal) {
  const key = deriveScheduleStatus({
    startsAt: deal.startsAt,
    endsAt: deal.endsAt,
    active: deal.active,
  })
  return sellerScheduleStatusMeta[key]
}

function productOf(deal: SellerAmazingDeal) {
  return getCachedProduct(deal.productId) || resolveProduct(deal.productId)
}

async function loadList() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری شگفت‌انگیزها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function onBulkCreated() {
  await loadList()
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
    toast.success(active ? t('شگفت‌انگیزها فعال شدند') : t('شگفت‌انگیزها غیرفعال شدند'))
    selectedIds.value = []
    await loadList()
  }
  finally {
    bulkRunning.value = false
  }
}

async function toggleActive(deal: SellerAmazingDeal) {
  togglingId.value = deal.id
  try {
    const result = await setActive(deal.id, !deal.active)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(deal.active ? t('شگفت‌انگیز غیرفعال شد') : t('شگفت‌انگیز فعال شد'))
    await loadList()
  }
  finally {
    togglingId.value = null
  }
}

function openDelete(deal: SellerAmazingDeal) {
  pendingDelete.value = deal
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteDeal(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(t('شگفت‌انگیز حذف شد'))
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
  await Promise.all([
    fetchSeller(),
    fetchProducts({ pageSize: 100 }),
  ])
  void loadList()
})
</script>
