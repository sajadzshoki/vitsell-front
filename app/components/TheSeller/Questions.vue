<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
      <h2 class="font-bold text-highlighted">
        {{ $t('پرسش و پاسخ') }}
      </h2>
      <div class="text-xs text-muted">
        <span class="num">{{ unansweredCount.toLocaleString('fa-IR') }}</span>
        {{ $t('بدون پاسخ') }}
      </div>
    </div>

    <div class="flex flex-col sm:(flex-row items-center) gap-3 mb-4">
      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="$t('جستجوی پرسش یا محصول')"
        class="flex-1 w-full"
      />
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
        <UButton
          :color="statusFilter === 'all' ? 'primary' : 'neutral'"
          :variant="statusFilter === 'all' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="statusFilter = 'all'"
        >
          {{ $t('همه') }}
        </UButton>
        <UButton
          :color="statusFilter === 'unanswered' ? 'primary' : 'neutral'"
          :variant="statusFilter === 'unanswered' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="statusFilter = 'unanswered'"
        >
          {{ $t('بدون پاسخ') }}
          <span class="num ms-1">
            {{ unansweredCount.toLocaleString('fa-IR') }}
          </span>
        </UButton>
        <UButton
          :color="statusFilter === 'answered' ? 'primary' : 'neutral'"
          :variant="statusFilter === 'answered' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="statusFilter = 'answered'"
        >
          {{ $t('پاسخ‌داده‌شده') }}
        </UButton>
      </div>
    </div>

    <div
      v-if="pending && !questions.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="!filtered.length"
      class="text-center py-12"
    >
      <UIcon
        name="i-tabler-message-question"
        class="size-16 text-dimmed mx-auto mb-4"
      />
      <p class="text-sm text-muted">
        {{ query.trim() || statusFilter !== 'all'
          ? $t('پرسشی با این فیلتر پیدا نشد')
          : $t('پرسشی برای نمایش نیست') }}
      </p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <TheSellerQuestionCard
        v-for="item in filtered"
        :key="item.id"
        :question="item"
        @delete="openDelete"
      />
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف پرسش')"
      :description="$t('این پرسش برای همیشه حذف می‌شود.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="font-medium text-highlighted">
            {{ pendingDelete.name }}
          </div>
          <div class="text-xs text-muted leading-5">
            {{ pendingDelete.question }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            :disabled="deleting"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
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
import type { SellerProductQuestion } from '~/data/seller-questions'

const { t } = useI18n()
const toast = useAppToast()
const {
  questions,
  unansweredCount,
  pending,
  ensureLoaded,
  deleteQuestion,
} = useSellerQuestions()
const { resolveProduct } = useSeller()

const query = ref('')
const statusFilter = ref<'all' | 'unanswered' | 'answered'>('all')
const deleteOpen = ref(false)
const pendingDelete = ref<SellerProductQuestion | null>(null)
const deleting = ref(false)

await ensureLoaded({ force: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return questions.value.filter((item) => {
    if (statusFilter.value === 'unanswered' && item.answer) return false
    if (statusFilter.value === 'answered' && !item.answer) return false
    if (!q) return true
    const product = resolveProduct(item.productId)
    return (
      item.question.includes(query.value.trim())
      || item.name.includes(query.value.trim())
      || product.title.toLowerCase().includes(q)
      || item.productId.toLowerCase().includes(q)
    )
  })
})

function openDelete(question: SellerProductQuestion) {
  pendingDelete.value = question
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteQuestion(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('پرسش حذف شد'))
  }
  finally {
    deleting.value = false
  }
}
</script>
