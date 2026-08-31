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

    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="n in 3"
        :key="n"
        class="h-36 rounded-2xl"
      />
    </div>

    <template v-else>
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        variant="pill"
        color="primary"
        size="sm"
        class="w-full"
        :ui="{
          list: 'bg-muted/60 p-1 rounded-xl w-full sm:w-auto',
          trigger: 'flex-1 sm:flex-none font-medium',
          content: 'pt-4',
        }"
      >
        <template #reviews>
          <div
            v-if="reviews.length === 0"
            class="text-center py-12"
          >
            <UIcon name="i-tabler-message-2" class="size-16 text-dimmed mx-auto mb-4" />
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
        </template>

        <template #questions>
          <div
            v-if="questions.length === 0"
            class="text-center py-12"
          >
            <UIcon name="i-tabler-message-question" class="size-16 text-dimmed mx-auto mb-4" />
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
        </template>
      </UTabs>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { reviews, questions, fetchMyReviews } = useAccountReviews()

const loading = ref(true)
const activeTab = ref('reviews')

const tabItems = computed(() => [
  {
    label: `${t('نظرات من')} (${reviews.value.length.toLocaleString('fa-IR')})`,
    value: 'reviews',
    slot: 'reviews' as const,
    icon: 'i-tabler-star',
  },
  {
    label: `${t('پرسش و پاسخ')} (${questions.value.length.toLocaleString('fa-IR')})`,
    value: 'questions',
    slot: 'questions' as const,
    icon: 'i-tabler-message-question',
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
