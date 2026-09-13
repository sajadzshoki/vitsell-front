<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <TheSellerPageHeader
      :title="mode === 'activity' ? $t('لاگ فعالیت') : $t('لاگ حسابرسی')"
      :description="mode === 'activity'
        ? $t('فعالیت‌های عملیاتی بدون رویدادهای ورود')
        : $t('ردیابی اقدامات مهم ادمین‌ها — فقط خواندنی')"
      :count-label="`${(listMeta.total || 0).toLocaleString('fa-IR')} ${$t('رویداد')}`"
    />

    <TheSellerListToolbar
      v-model:search="search"
      :show-clear="false"
      :search-placeholder="$t('جستجو در خلاصه یا عامل')"
    >
      <template #extra>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto items-end">
          <USelect
            v-model="actorFilter"
            :items="actorItems"
            value-key="value"
            class="min-w-40"
            :placeholder="$t('عامل')"
          />
          <USelect
            v-model="actionFilter"
            :items="actionItems"
            value-key="value"
            class="min-w-36"
          />
          <USelect
            v-model="entityFilter"
            :items="entityItems"
            value-key="value"
            class="min-w-36"
          />
          <div class="w-40 min-w-36">
            <TheIRDatePicker
              :model-value="dateFrom || null"
              :header="$t('از تاریخ')"
              :placeholder="$t('انتخاب تاریخ')"
              @update:model-value="dateFrom = $event || ''"
            />
          </div>
          <div class="w-40 min-w-36">
            <TheIRDatePicker
              :model-value="dateTo || null"
              :header="$t('تا تاریخ')"
              :placeholder="$t('انتخاب تاریخ')"
              @update:model-value="dateTo = $event || ''"
            />
          </div>
          <UButton
            v-if="hasFilters"
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            @click="clearFilters"
          >
            {{ $t('پاک کردن') }}
          </UButton>
        </div>
      </template>
    </TheSellerListToolbar>

    <div
      v-if="loading"
      class="text-sm text-muted py-10 text-center"
    >
      {{ $t('در حال بارگذاری…') }}
    </div>

    <TheSellerEmptyState
      v-else-if="!logs.length"
      icon="i-tabler-clipboard-list"
      :message="$t('رویدادی یافت نشد')"
    />

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="log in logs"
        :key="log.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="text-sm font-medium text-highlighted">
              {{ log.summary }}
            </div>
            <div class="text-[11px] text-muted mt-1 flex flex-wrap gap-x-2 gap-y-1">
              <span>{{ log.actorName }}</span>
              <span>·</span>
              <span>{{ $t(sellerAuditActionMeta[log.action]?.label || log.action) }}</span>
              <span>·</span>
              <span>{{ $t(sellerAuditEntityMeta[log.entity]?.label || log.entity) }}</span>
              <span
                v-if="log.entityId"
                class="num"
                dir="ltr"
              >#{{ log.entityId }}</span>
            </div>
            <div
              v-if="log.previousValue || log.newValue"
              class="text-[11px] text-toned mt-2 num"
              dir="ltr"
            >
              {{ log.previousValue || '—' }} → {{ log.newValue || '—' }}
            </div>
          </div>
          <div
            class="text-[11px] text-muted num shrink-0"
            dir="ltr"
          >
            {{ formatWhen(log.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="listMeta.total"
      :page-size-options="[12, 24, 50, 100]"
    />
  </div>
</template>

<script setup lang="ts">
import {
  sellerAuditActionMeta,
  sellerAuditEntityMeta,
} from '~/data/seller-audit'

const props = withDefaults(defineProps<{
  mode?: 'audit' | 'activity'
}>(), {
  mode: 'audit',
})

const { t } = useI18n()
const toast = useAppToast()
const {
  logs,
  listMeta,
  fetchList,
  apiErrorMessage,
} = useSellerAudit()

const search = ref('')
const actorFilter = ref('all')
const actionFilter = ref('all')
const entityFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const pageSize = ref(12)
const loading = ref(false)

const actorItems = computed(() => [
  { value: 'all', label: t('همه عامل‌ها') },
  ...listMeta.value.actors
    .filter(a => a.id)
    .map(a => ({ value: a.id, label: a.name || a.id })),
])

const actionItems = computed(() => [
  { value: 'all', label: t('همه اقدامات') },
  ...Object.entries(sellerAuditActionMeta).map(([value, meta]) => ({
    value,
    label: t(meta.label),
  })),
])

const entityItems = computed(() => [
  { value: 'all', label: t('همه موجودیت‌ها') },
  ...Object.entries(sellerAuditEntityMeta).map(([value, meta]) => ({
    value,
    label: t(meta.label),
  })),
])

const hasFilters = computed(() =>
  Boolean(
    search.value.trim()
    || actorFilter.value !== 'all'
    || actionFilter.value !== 'all'
    || entityFilter.value !== 'all'
    || dateFrom.value
    || dateTo.value,
  ),
)


function clearFilters() {
  search.value = ''
  actorFilter.value = 'all'
  actionFilter.value = 'all'
  entityFilter.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  page.value = 1
}

function formatWhen(iso: string) {
  try {
    return iso.slice(0, 16).replace('T', ' ')
  }
  catch {
    return iso
  }
}

async function loadList() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      actorId: actorFilter.value,
      action: actionFilter.value,
      entity: entityFilter.value,
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined,
      mode: props.mode,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(t(apiErrorMessage(error, 'بارگذاری لاگ ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

watch(
  [search, actorFilter, actionFilter, entityFilter, dateFrom, dateTo, page, pageSize, () => props.mode],
  () => {
    void loadList()
  },
)

onMounted(() => {
  void loadList()
})
</script>
