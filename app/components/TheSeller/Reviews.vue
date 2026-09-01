<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('نظرات مشتریان')"
        :description="$t('مدیریت و پاسخ به نظرات محصولات')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('نظر')}`"
      >
        <template #actions>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-download"
            class="cursor-pointer"
            @click="exportCsv"
          >
            {{ $t('خروجی') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
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
          v-model="ratingFilter"
          :items="ratingItems"
          value-key="value"
          class="w-36"
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

    <TheSellerEmptyState
      v-if="filtered.length === 0"
      icon="i-tabler-message-2"
      :message="$t('نظری برای نمایش نیست')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="review in paged"
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
            :moderation="getModeration(review.id)"
            @moderate="onModerate"
          />
        </div>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 pt-2"
      >
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-chevron-right"
          class="cursor-pointer"
          :disabled="page <= 1"
          @click="page = page - 1"
        />
        <span class="text-xs text-muted num">
          {{ page.toLocaleString('fa-IR') }} / {{ totalPages.toLocaleString('fa-IR') }}
        </span>
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-tabler-chevron-left"
          class="cursor-pointer"
          :disabled="page >= totalPages"
          @click="page = page + 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'

type ReviewModeration = 'pending' | 'approved' | 'rejected' | 'hidden'

const PAGE_SIZE = 10

const { t } = useI18n()
const toast = useAppToast()
const { reviews, unansweredReviews, resolveProduct } = useSeller()
const { can } = useSellerPermissions()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const ratingFilter = ref('all')
const selectedIds = ref<string[]>([])
const moderationMap = useState<Record<string, ReviewModeration>>('seller-review-moderation', () => ({}))

const statusTabs = computed(() => [
  { id: 'all', label: t('همه') },
  { id: 'unanswered', label: t('بدون پاسخ'), count: unansweredReviews.value },
  { id: 'answered', label: t('پاسخ‌داده‌شده') },
  { id: 'pending', label: t('در انتظار تأیید') },
  { id: 'approved', label: t('تأییدشده') },
  { id: 'rejected', label: t('ردشده') },
])

const ratingItems = computed(() => [
  { value: 'all', label: t('همه امتیازها') },
  ...[5, 4, 3, 2, 1].map(n => ({ value: String(n), label: `${n.toLocaleString('fa-IR')} ★` })),
])

function getModeration(id: string): ReviewModeration {
  return moderationMap.value[id] ?? 'approved'
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return reviews.value.filter((review) => {
    const mod = getModeration(review.id)
    if (status.value === 'unanswered' && review.reply) return false
    if (status.value === 'answered' && !review.reply) return false
    if (status.value === 'pending' && mod !== 'pending') return false
    if (status.value === 'approved' && mod !== 'approved') return false
    if (status.value === 'rejected' && mod !== 'rejected') return false
    if (ratingFilter.value !== 'all' && review.rating !== Number(ratingFilter.value)) return false
    if (!q) return true
    const product = resolveProduct(review.productId)
    return review.name.toLowerCase().includes(q)
      || review.text.toLowerCase().includes(q)
      || product.title.toLowerCase().includes(q)
      || review.productId.toLowerCase().includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

function toggle(id: string, on: boolean) {
  if (on) selectedIds.value = [...new Set([...selectedIds.value, id])]
  else selectedIds.value = selectedIds.value.filter(x => x !== id)
}

function onModerate(payload: { id: string, status: ReviewModeration }) {
  moderationMap.value = { ...moderationMap.value, [payload.id]: payload.status }
  toast.success(t('وضعیت نظر به‌روز شد'))
}

function bulkModerate(statusValue: ReviewModeration) {
  const next = { ...moderationMap.value }
  for (const id of selectedIds.value) next[id] = statusValue
  moderationMap.value = next
  selectedIds.value = []
  toast.success(t('اقدام گروهی انجام شد'))
}

async function clearAll() {
  ratingFilter.value = 'all'
  selectedIds.value = []
  await clearFilters()
}

function exportCsv() {
  downloadSellerCsv(
    `reviews-${Date.now()}`,
    ['id', 'productId', 'name', 'rating', 'text', 'date', 'hasReply', 'moderation'],
    filtered.value.map(r => [
      r.id,
      r.productId,
      r.name,
      r.rating,
      r.text,
      r.date,
      Boolean(r.reply),
      getModeration(r.id),
    ]),
  )
  toast.success(t('فایل خروجی آماده شد'))
}
</script>
