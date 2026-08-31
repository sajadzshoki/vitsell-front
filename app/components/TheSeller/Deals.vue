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
          class="font-medium"
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
        class="font-medium"
      >
        {{ $t('افزودن شگفت‌انگیز') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی محصول یا شناسه')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          v-for="tab in statusTabs"
          :key="tab.id"
          :color="statusFilter === tab.id ? 'primary' : 'neutral'"
          :variant="statusFilter === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="statusFilter = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>
    </div>

    <div
      v-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-bolt"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted mb-4">
        {{ query.trim() || statusFilter !== 'all'
          ? $t('موردی با این فیلتر پیدا نشد')
          : $t('هنوز شگفت‌انگیزی ثبت نشده است') }}
      </p>
      <UButton
        v-if="!query.trim() && statusFilter === 'all'"
        to="/seller/deals/new"
        color="primary"
        variant="soft"
        icon="i-tabler-plus"
      >
        {{ $t('افزودن اولین شگفت‌انگیز') }}
      </UButton>
    </div>

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
                  {{ productOf(deal)?.title || deal.productId }}
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
                  :color="deal.active ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ deal.active ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
                <UBadge
                  v-if="isDealLive(deal)"
                  color="warning"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ $t('در حال اجرا') }}
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
                {{ productOf(deal)!.price.toLocaleString('fa-IR') }}
              </span>
              <span class="font-bold text-error num">
                {{ dealPriceFrom(productOf(deal)!.price, deal.discountPercent).toLocaleString('fa-IR') }}
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
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                :color="deal.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
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
  dealPriceFrom,
  formatDealRange,
  isDealLive,
  type SellerAmazingDeal,
} from '~/data/seller-deals'

const { t } = useI18n()
const toast = useAppToast()
const { deals, ensureLoaded, deleteDeal, setActive } = useSellerDeals()
const { resolveProduct, fetchSeller } = useSeller()
const { fetchProducts, getCachedProduct } = useProducts()

const query = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive' | 'live'>('all')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerAmazingDeal | null>(null)

const statusTabs = [
  { id: 'all' as const, label: 'همه' },
  { id: 'live' as const, label: 'در حال اجرا' },
  { id: 'active' as const, label: 'فعال' },
  { id: 'inactive' as const, label: 'غیرفعال' },
]

ensureLoaded()
await Promise.all([
  fetchSeller(),
  fetchProducts({ pageSize: 100 }),
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return deals.value.filter((deal) => {
    if (statusFilter.value === 'active' && !deal.active) return false
    if (statusFilter.value === 'inactive' && deal.active) return false
    if (statusFilter.value === 'live' && !isDealLive(deal)) return false
    if (!q) return true
    const product = productOf(deal)
    return (
      deal.id.toLowerCase().includes(q)
      || deal.productId.toLowerCase().includes(q)
      || (product?.title.toLowerCase().includes(q) ?? false)
    )
  })
})

function productOf(deal: SellerAmazingDeal) {
  return getCachedProduct(deal.productId) || resolveProduct(deal.productId)
}

function toggleActive(deal: SellerAmazingDeal) {
  const result = setActive(deal.id, !deal.active)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(deal.active ? t('شگفت‌انگیز غیرفعال شد') : t('شگفت‌انگیز فعال شد'))
}

function openDelete(deal: SellerAmazingDeal) {
  pendingDelete.value = deal
  deleteOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteDeal(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('شگفت‌انگیز حذف شد'))
}
</script>
