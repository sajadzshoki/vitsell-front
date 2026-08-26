<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">{{ $t('نظرات مشتریان') }}</h2>
      <div class="text-xs text-muted">
        <span class="num">{{ unansweredReviews.toLocaleString('fa-IR') }}</span>
        {{ $t('بدون پاسخ') }}
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
      <UButton
        :color="onlyUnanswered ? 'neutral' : 'primary'"
        :variant="onlyUnanswered ? 'ghost' : 'soft'"
        size="sm"
        @click="onlyUnanswered = false"
      >
        {{ $t('همه نظرات') }}
      </UButton>
      <UButton
        :color="onlyUnanswered ? 'primary' : 'neutral'"
        :variant="onlyUnanswered ? 'soft' : 'ghost'"
        size="sm"
        @click="onlyUnanswered = true"
      >
        {{ $t('بدون پاسخ') }}
      </UButton>
    </div>

    <div
      v-if="filtered.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-tabler-message-2" class="size-16 text-dimmed mx-auto mb-4" />
      <p class="text-sm text-muted">{{ $t('نظری برای نمایش نیست') }}</p>
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <TheSellerReviewCard
        v-for="review in filtered"
        :key="review.id"
        :review="review"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { reviews, unansweredReviews } = useSeller()

const onlyUnanswered = ref(false)

const filtered = computed(() => {
  if (!onlyUnanswered.value) return reviews.value
  return reviews.value.filter(review => !review.reply)
})
</script>
