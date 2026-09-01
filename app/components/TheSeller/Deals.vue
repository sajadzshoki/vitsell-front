<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('شگفت‌انگیزها') }}
      </h2>
      <div class="flex items-center gap-3">
        <div class="text-xs text-muted num">
          {{ filtered.length.toLocaleString('fa-IR') }} {{ $t('مورد') }}
        </div>
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
    </div>

    <div class="lg:hidden mb-4">
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

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی محصول، نام یا شناسه')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          v-for="tab in statusTabs"
          :key="tab.id"
          :color="statusFilter === tab.id ? 'primary' : 'neutral'"
          :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          @click="statusFilter = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>
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

    <div
      v-if="pending && !deals.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!filtered.length"
      icon="i-tabler-bolt"
      :message="query.trim() || statusFilter !== 'all'
        ? $t('موردی با این فیلتر پیدا نشد')
        : $t('هنوز شگفت‌انگیزی ثبت نشده است')"
    >
      <template
        v-if="!query.trim() && statusFilter === 'all'"
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
        v-for="deal in filtered"
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
                <div class="text-sm font-medium text-highlighted line-clamp-2">
                  {{ deal.name || productOf(deal)?.title || deal.productId }}
                </div>
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
  dealPriceFrom,
  formatDealRange,
  type SellerAmazingDeal,
} from '~/data/seller-deals'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
  type SellerScheduleStatus,
} from '~/data/seller-marketing-shared'
import { formatPrice } from '~/data/products'

const { t } = useI18n()
const toast = useAppToast()
const { deals, pending, ensureLoaded, deleteDeal, setActive, setActiveMany } = useSellerDeals()
const { resolveProduct, fetchSeller } = useSeller()
const { fetchProducts, getCachedProduct } = useProducts()

const query = ref('')
const statusFilter = ref<'all' | SellerScheduleStatus>('all')
const selectedIds = ref<string[]>([])
const bulkRunning = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerAmazingDeal | null>(null)
const deleting = ref(false)
const togglingId = ref<string | null>(null)

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'scheduled' as const, label: 'زمان‌بندی‌شده' },
  { id: 'paused' as const, label: 'متوقف' },
  { id: 'expired' as const, label: 'منقضی' },
]

await Promise.all([
  ensureLoaded({ force: true }),
  fetchSeller(),
  fetchProducts({ pageSize: 100 }),
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return deals.value.filter((deal) => {
    const status = deriveScheduleStatus({
      startsAt: deal.startsAt,
      endsAt: deal.endsAt,
      active: deal.active,
    })
    if (statusFilter.value !== 'all' && status !== statusFilter.value) return false
    if (!q) return true
    const product = productOf(deal)
    return (
      deal.id.toLowerCase().includes(q)
      || deal.productId.toLowerCase().includes(q)
      || (deal.name || '').toLowerCase().includes(q)
      || (product?.title.toLowerCase().includes(q) ?? false)
    )
  })
})

function scheduleBadge(deal: SellerAmazingDeal) {
  const status = deriveScheduleStatus({
    startsAt: deal.startsAt,
    endsAt: deal.endsAt,
    active: deal.active,
  })
  return sellerScheduleStatusMeta[status]
}

function productOf(deal: SellerAmazingDeal) {
  return getCachedProduct(deal.productId) || resolveProduct(deal.productId)
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
  }
  finally {
    deleting.value = false
  }
}
</script>
