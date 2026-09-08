<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="flex flex-col items-center justify-center text-center lg:items-start lg:text-start">
        <div class="text-4xl md:text-5xl font-black text-highlighted num">
          {{ displayRating.toLocaleString('fa-IR') }}
        </div>
        <div class="flex gap-0.5 my-2">
          <UIcon
            v-for="star in 5"
            :key="star"
            name="i-tabler-star-filled"
            class="size-5"
            :class="star <= Math.round(displayRating) ? 'text-warning' : 'text-accented'"
          />
        </div>
        <div class="text-xs text-muted num">
          {{ displayReviewCount.toLocaleString('fa-IR') }} {{ $t('دیدگاه') }}
        </div>
      </div>

      <div class="space-y-2">
        <div
          v-for="row in reviewSummary.distribution"
          :key="row.stars"
          class="flex items-center gap-2"
        >
          <span class="text-[11px] text-muted w-3 num shrink-0">{{ row.stars }}</span>
          <UIcon name="i-tabler-star-filled" class="size-3 text-warning shrink-0" />
          <div class="flex-1 h-2 rounded-full bg-accented overflow-hidden">
            <div
              class="h-full rounded-full bg-warning transition-all"
              :style="{ width: `${row.percent}%` }"
            />
          </div>
          <span class="text-[11px] text-muted num w-16 text-end shrink-0">
            {{ row.percent.toLocaleString('fa-IR') }}٪
            <span class="text-dimmed">({{ row.count.toLocaleString('fa-IR') }})</span>
          </span>
        </div>
      </div>

      <div class="rounded-2xl bg-success/10 border border-success/20 p-4 md:p-5 flex flex-col justify-center">
        <div class="text-2xl md:text-3xl font-black text-success num">
          {{ reviewSummary.recommendPercent.toLocaleString('fa-IR') }}٪
        </div>
        <p class="text-xs text-toned leading-6 mt-1">
          {{ $t('از خریداران، خرید این محصول را به دیگران پیشنهاد کرده‌اند') }}
        </p>
      </div>
    </div>

    <!-- Criteria scores -->
    <div
      v-if="criteriaScores.length"
      class="rounded-2xl border border-muted bg-muted/30 p-4 md:p-5"
    >
      <h3 class="text-sm font-bold text-highlighted mb-4">
        {{ $t('امتیاز در معیارهای مختلف') }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        <div
          v-for="item in criteriaScores"
          :key="item.label"
          class="flex items-center gap-3"
        >
          <span class="text-xs text-muted w-20 shrink-0">{{ $t(item.label) }}</span>
          <div class="flex-1 h-2 rounded-full bg-accented overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: `${(item.score / 5) * 100}%` }"
            />
          </div>
          <span class="text-xs font-bold text-highlighted num w-6 text-end">
            {{ item.score.toLocaleString('fa-IR') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add review CTA -->
    <div class="rounded-2xl border border-muted bg-muted/30 p-4 md:p-5 flex flex-col sm:(flex-row items-center) gap-4">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <div class="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <UIcon name="i-tabler-message-plus" class="size-5" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('دیدگاه خود را بنویسید') }}
          </h3>
          <p class="text-xs text-muted leading-6 mt-1">
            {{ $t('با اشتراک‌گذاری تجربه خرید، به دیگران در انتخاب کمک کنید.') }}
          </p>
        </div>
      </div>
      <UButton
        color="primary"
        size="md"
        class="font-bold shrink-0 w-full sm:w-auto"
        trailing-icon="i-tabler-pencil"
        @click="openReviewForm"
      >
        {{ $t('افزودن نظر') }}
      </UButton>
    </div>

    <TheProductTabsReviewForm
      v-model:open="reviewFormOpen"
      :product="product"
    />

    <!-- Filters -->
    <div class="border-t border-muted pt-5 md:pt-6">
      <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h3 class="text-sm font-bold text-highlighted">
          {{ $t('دیدگاه خریداران') }}
          <span class="text-muted font-normal num">
            ({{ filteredReviews.length.toLocaleString('fa-IR') }})
          </span>
        </h3>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-3">
        <UButton
          v-for="opt in sortOptions"
          :key="opt.value"
          :color="reviewSort === opt.value ? 'neutral' : 'neutral'"
          :variant="reviewSort === opt.value ? 'solid' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="reviewSort = opt.value"
        >
          {{ $t(opt.label) }}
        </UButton>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
        <UButton
          :color="filterWithImage ? 'primary' : 'neutral'"
          :variant="filterWithImage ? 'soft' : 'outline'"
          size="xs"
          class="shrink-0"
          @click="filterWithImage = !filterWithImage"
        >
          {{ $t('دارای تصویر') }}
        </UButton>
        <UButton
          :color="filterVerified ? 'primary' : 'neutral'"
          :variant="filterVerified ? 'soft' : 'outline'"
          size="xs"
          class="shrink-0"
          @click="filterVerified = !filterVerified"
        >
          {{ $t('خریداران تأیید شده') }}
        </UButton>
        <UButton
          v-for="stars in 5"
          :key="stars"
          :color="filterStars === stars ? 'primary' : 'neutral'"
          :variant="filterStars === stars ? 'soft' : 'outline'"
          size="xs"
          class="shrink-0"
          @click="toggleStarFilter(stars)"
        >
          <UIcon name="i-tabler-star-filled" class="size-3 text-warning" />
          <span class="num">{{ stars.toLocaleString('fa-IR') }}</span>
        </UButton>
      </div>
    </div>

    <!-- Review list -->
    <div class="space-y-4">
      <TheProductTabsReviewCard
        v-for="review in filteredReviews"
        :key="review.id"
        :review="review"
        :all-reviews="allReviews"
        :official-images="officialImages"
        :product-title="product.title"
      />
      <div
        v-if="filteredReviews.length === 0"
        class="text-center py-10"
      >
        <UIcon name="i-tabler-message-2" class="size-12 text-dimmed mx-auto mb-3" />
        <p class="text-sm text-muted">
          {{
            allReviews.length === 0
              ? $t('هنوز دیدگاهی برای این محصول ثبت نشده است')
              : $t('دیدگاهی با این فیلتر یافت نشد')
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import type { ProductReviewSort } from '~/data/product-detail'

const props = defineProps<{
  product: Product
}>()

const {
  reviewSummary,
  criteriaScores,
  displayRating,
  displayReviewCount,
  allReviews,
  reviewSort,
  filterVerified,
  filterWithImage,
  filterStars,
  filteredReviews,
  toggleStarFilter,
  requireAuth,
} = useProductDetail(() => props.product)

const reviewFormOpen = ref(false)

function openReviewForm() {
  if (!requireAuth()) return
  reviewFormOpen.value = true
}

const sortOptions: { label: string, value: ProductReviewSort }[] = [
  { label: 'جدیدترین', value: 'newest' },
  { label: 'مفیدترین', value: 'helpful' },
  { label: 'بیشترین امتیاز', value: 'high' },
  { label: 'کمترین امتیاز', value: 'low' },
]

const officialImages = computed(() => {
  const gallery = props.product.gallery?.filter(Boolean) ?? []
  if (gallery.length) return gallery
  return props.product.image ? [props.product.image] : []
})
</script>
