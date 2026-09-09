<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('نظرات مشتریان')"
        :description="$t('مدیریت و پاسخ به نظرات محصولات')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('نظر')}` : undefined"
      >
        <template #actions>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-download"
            class="cursor-pointer"
            :loading="exporting"
            @click="exportCsv"
          >
            {{ $t('خروجی') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-download"
        class="cursor-pointer"
        :loading="exporting"
        @click="exportCsv"
      >
        {{ $t('خروجی CSV') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام، متن یا محصول')"
      :has-active="hasActiveFilters || ratingFilter !== 'all'"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAll"
    >
      <template #extra>
        <USelect
          :model-value="ratingFilter"
          :items="ratingItems"
          value-key="value"
          class="w-36"
          @update:model-value="setRating(String($event ?? 'all'))"
        />
      </template>
    </TheSellerListToolbar>

    <div
      v-if="selectedIds.length && can('reviews.moderate')"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs num">{{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}</span>
      <UButton
        type="button"
        color="success"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        :loading="bulkSaving"
        @click="bulkModerate('approved')"
      >
        {{ $t('تأیید') }}
      </UButton>
      <UButton
        type="button"
        color="error"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        :loading="bulkSaving"
        @click="bulkModerate('rejected')"
      >
        {{ $t('رد') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو') }}
      </UButton>
    </div>

    <div
      v-if="(loading || pending) && !reviews.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!reviews.length"
      icon="i-tabler-message-2"
      :message="hasActiveFilters || ratingFilter !== 'all'
        ? $t('نظری با این فیلتر پیدا نشد')
        : $t('نظری برای نمایش نیست')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="review in reviews"
        :key="review.id"
        class="relative"
      >
        <div
          v-if="can('reviews.moderate')"
          class="absolute top-3 start-3 z-10"
        >
          <UCheckbox
            :model-value="selectedIds.includes(review.id)"
            @update:model-value="toggle(review.id, !!$event)"
          />
        </div>
        <div :class="can('reviews.moderate') ? 'ps-8' : ''">
          <TheSellerReviewCard
            :review="review"
            :moderation="review.moderation || 'approved'"
            @moderate="onModerate"
            @replied="loadReviews"
          />
        </div>
      </div>

      <TheSellerPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="listMeta.total"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import type { SellerReview, SellerReviewModeration } from '~/data/seller'


const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const { fetchProduct, getCachedProduct } = useProducts()
const {
  reviews,
  listMeta,
  pending,
  fetchList,
  setModeration,
  bulkSetModeration,
} = useSellerReviews()
const { search, status, page, pageSize, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

const loading = ref(true)
const exporting = ref(false)
const bulkSaving = ref(false)
const selectedIds = ref<string[]>([])

const ratingFilter = computed(() => String(route.query.rating ?? 'all'))

async function hydrateReviewProducts(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  await Promise.all(
    unique
      .filter(id => !getCachedProduct(id))
      .map(id => fetchProduct(id)),
  )
}

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'unanswered', label: t('بدون پاسخ'), count: Number(c.unanswered) || 0 },
    { id: 'answered', label: t('پاسخ‌داده‌شده'), count: Number(c.answered) || 0 },
    { id: 'pending', label: t('در انتظار تأیید'), count: Number(c.pending) || 0 },
    { id: 'approved', label: t('تأییدشده'), count: Number(c.approved) || 0 },
    { id: 'rejected', label: t('ردشده'), count: Number(c.rejected) || 0 },
  ]
})

const ratingItems = computed(() => [
  { value: 'all', label: t('همه امتیازها') },
  ...[5, 4, 3, 2, 1].map(n => ({ value: String(n), label: `${n.toLocaleString('fa-IR')} ★` })),
])


function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toggle(id: string, on: boolean) {
  if (on) selectedIds.value = [...new Set([...selectedIds.value, id])]
  else selectedIds.value = selectedIds.value.filter(x => x !== id)
}

async function setRating(value: string) {
  await patchQuery({
    rating: value && value !== 'all' ? value : undefined,
    page: undefined,
  })
}

async function clearAll() {
  selectedIds.value = []
  await clearFilters()
  await patchQuery({ rating: undefined })
}

async function loadReviews() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      rating: ratingFilter.value !== 'all' ? ratingFilter.value : undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری نظرات ناموفق بود')))
      return
    }
    await hydrateReviewProducts(reviews.value.map(r => r.productId))
  }
  finally {
    loading.value = false
  }
}

async function onModerate(payload: { id: string, status: SellerReviewModeration }) {
  const result = await setModeration(payload.id, payload.status)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('وضعیت نظر به‌روز شد'))
  await loadReviews()
}

async function bulkModerate(statusValue: SellerReviewModeration) {
  if (!selectedIds.value.length) return
  bulkSaving.value = true
  try {
    const result = await bulkSetModeration(selectedIds.value, statusValue)
    selectedIds.value = []
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('اقدام گروهی انجام شد'))
    await loadReviews()
  }
  finally {
    bulkSaving.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      rating: ratingFilter.value !== 'all' ? ratingFilter.value : undefined,
      all: true,
      pageSize: 200,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('خروجی نظرات ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `reviews-${Date.now()}`,
      ['id', 'productId', 'name', 'rating', 'text', 'date', 'hasReply', 'moderation'],
      reviews.value.map((r: SellerReview) => [
        r.id,
        r.productId,
        r.name,
        r.rating,
        r.text,
        r.date,
        Boolean(r.reply),
        r.moderation || 'approved',
      ]),
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadReviews()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadReviews()
  },
  { deep: true },
)

onMounted(() => {
  void loadReviews()
})
</script>
