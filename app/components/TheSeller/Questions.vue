<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('پرسش و پاسخ')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('پرسش')}`"
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
      :search-placeholder="$t('جستجوی پرسش یا محصول')"
      :has-active="hasActiveFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="pending && !questions.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!filtered.length"
      icon="i-tabler-message-question"
      :message="search.trim() || status !== 'all'
        ? $t('پرسشی با این فیلتر پیدا نشد')
        : $t('پرسشی برای نمایش نیست')"
    />

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
import { downloadSellerCsv } from '~/data/seller-export'

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
const { can } = useSellerPermissions()
const { search, status, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const deleteOpen = ref(false)
const pendingDelete = ref<SellerProductQuestion | null>(null)
const deleting = ref(false)

await ensureLoaded({ force: true })

const statusTabs = computed(() => [
  { id: 'all', label: t('همه') },
  { id: 'unanswered', label: t('بدون پاسخ'), count: unansweredCount.value },
  { id: 'answered', label: t('پاسخ‌داده‌شده') },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return questions.value.filter((item) => {
    if (status.value === 'unanswered' && item.answer) return false
    if (status.value === 'answered' && !item.answer) return false
    if (!q) return true
    const product = resolveProduct(item.productId)
    return (
      item.question.includes(search.value.trim())
      || item.name.includes(search.value.trim())
      || product.title.toLowerCase().includes(q)
      || item.productId.toLowerCase().includes(q)
    )
  })
})

function openDelete(question: SellerProductQuestion) {
  if (!can('questions.delete')) return
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

function exportCsv() {
  downloadSellerCsv(
    `questions-${Date.now()}`,
    ['id', 'productId', 'name', 'question', 'answered', 'date'],
    filtered.value.map(q => [
      q.id,
      q.productId,
      q.name,
      q.question,
      Boolean(q.answer),
      q.date,
    ]),
  )
  toast.success(t('فایل خروجی آماده شد'))
}
</script>
