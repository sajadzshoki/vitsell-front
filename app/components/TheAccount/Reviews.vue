<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5">
      <h2 class="font-bold text-highlighted">{{ $t('نظرات و پرسش‌ها') }}</h2>
      <div
        v-if="!loading"
        class="text-xs text-muted"
      >
        <span class="num">{{ reviews.length.toLocaleString('fa-IR') }}</span>
        {{ $t('نظر') }}
        <span class="mx-1 text-dimmed">·</span>
        <span class="num">{{ questions.length.toLocaleString('fa-IR') }}</span>
        {{ $t('پرسش') }}
      </div>
    </div>

    <div v-if="loading">
      <TheSkeleton
        variant="list-card"
        :count="3"
      />
    </div>

    <template v-else>
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :color="activeTab === tab.id ? 'primary' : 'neutral'"
          :variant="activeTab === tab.id ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0 cursor-pointer"
          :leading-icon="tab.icon"
          @click="activeTab = tab.id"
        >
          {{ $t(tab.label) }}
          <span class="num ms-1">
            {{ tab.count.toLocaleString('fa-IR') }}
          </span>
        </UButton>
      </div>

      <div
        v-if="activeTab === 'reviews'"
      >
        <div
          v-if="reviews.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-message-2"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted mb-4">{{ $t('هنوز نظری ثبت نکرده‌اید') }}</p>
          <UButton
            to="/"
            color="primary"
            size="lg"
            class="font-bold"
          >
            {{ $t('مشاهده محصولات') }}
          </UButton>
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <TheAccountReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
          />
        </div>
      </div>

      <div
        v-else-if="activeTab === 'questions'"
      >
        <div
          v-if="questions.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-message-question"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted mb-4">{{ $t('هنوز پرسشی ثبت نکرده‌اید') }}</p>
          <UButton
            to="/"
            color="primary"
            size="lg"
            class="font-bold"
          >
            {{ $t('مشاهده محصولات') }}
          </UButton>
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <TheAccountQuestionCard
            v-for="question in questions"
            :key="question.id"
            :question="question"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { reviews, questions, fetchMyReviews } = useAccountReviews()

const loading = ref(true)
const activeTab = ref<'reviews' | 'questions'>('reviews')

const tabs = computed(() => [
  {
    id: 'reviews' as const,
    label: 'نظرات من',
    icon: 'i-tabler-star',
    count: reviews.value.length,
  },
  {
    id: 'questions' as const,
    label: 'پرسش و پاسخ',
    icon: 'i-tabler-message-question',
    count: questions.value.length,
  },
])

onMounted(async () => {
  loading.value = true
  try {
    await fetchMyReviews({ force: true })
  }
  finally {
    loading.value = false
  }
})
</script>
