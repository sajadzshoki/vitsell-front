<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('پرسش و پاسخ')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('پرسش')}` : undefined"
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
      :search-placeholder="$t('جستجوی پرسش یا محصول')"
      :has-active="hasActiveFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="(loading || pending) && !questions.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!questions.length"
      icon="i-tabler-message-question"
      :message="hasActiveFilters
        ? $t('پرسشی با این فیلتر پیدا نشد')
        : $t('پرسشی برای نمایش نیست')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <TheSellerQuestionCard
        v-for="item in questions"
        :key="item.id"
        :question="item"
        @delete="openDelete"
      />

      <div
        v-if="pageCount > 1"
        class="mt-5 flex justify-center"
      >
        <UPagination
          v-model:page="page"
          :total="listMeta.total"
          :items-per-page="listMeta.pageSize || pageSize"
        />
      </div>
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

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const {
  questions,
  listMeta,
  pending,
  fetchList,
  deleteQuestion,
} = useSellerQuestions()
const { can } = useSellerPermissions()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const exporting = ref(false)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerProductQuestion | null>(null)
const deleting = ref(false)

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'unanswered', label: t('بدون پاسخ'), count: Number(c.unanswered) || 0 },
    { id: 'answered', label: t('پاسخ‌داده‌شده'), count: Number(c.answered) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadQuestions() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری پرسش‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

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
    await loadQuestions()
  }
  finally {
    deleting.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      all: true,
      pageSize: 200,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('خروجی پرسش‌ها ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `questions-${Date.now()}`,
      ['id', 'productId', 'name', 'question', 'answered', 'date'],
      questions.value.map(q => [
        q.id,
        q.productId,
        q.name,
        q.question,
        Boolean(q.answer),
        q.date,
      ]),
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadQuestions()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadQuestions()
  },
  { deep: true },
)

onMounted(() => {
  void loadQuestions()
})
</script>
