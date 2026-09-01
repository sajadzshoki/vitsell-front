<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <TheSellerPageHeader
      :title="mode === 'activity' ? $t('لاگ فعالیت') : $t('لاگ حسابرسی')"
      :description="mode === 'activity'
        ? $t('فعالیت‌های عملیاتی بدون رویدادهای ورود')
        : $t('ردیابی اقدامات مهم ادمین‌ها — فقط خواندنی')"
      :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رویداد')}`"
    />

    <TheSellerListToolbar
      v-model:search="search"
      :show-clear="false"
      :search-placeholder="$t('جستجو در خلاصه یا عامل')"
    >
      <template #extra>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
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
          <UFormField :label="$t('از تاریخ')">
            <UInput
              v-model="dateFrom"
              type="date"
              class="min-w-36"
            />
          </UFormField>
          <UFormField :label="$t('تا تاریخ')">
            <UInput
              v-model="dateTo"
              type="date"
              class="min-w-36"
            />
          </UFormField>
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

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-clipboard-list"
      :message="$t('رویدادی یافت نشد')"
    />

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="log in paged"
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
              <span>{{ $t(sellerAuditActionMeta[log.action].label) }}</span>
              <span>·</span>
              <span>{{ $t(sellerAuditEntityMeta[log.entity].label) }}</span>
              <span
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
            {{ log.createdAt.slice(0, 16).replace('T', ' ') }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="pageCount > 1"
      class="mt-5 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  sellerAuditActionMeta,
  sellerAuditEntityMeta,
  type SellerAuditAction,
  type SellerAuditEntity,
} from '~/data/seller-audit'

const props = withDefaults(defineProps<{
  mode?: 'audit' | 'activity'
}>(), {
  mode: 'audit',
})

const { t } = useI18n()
const { logs, ensureLoaded } = useSellerAudit()
ensureLoaded()

const search = ref('')
const actorFilter = ref('all')
const actionFilter = ref('all')
const entityFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const pageSize = 12

const actorItems = computed(() => {
  const names = [...new Set(logs.value.map(l => l.actorName))]
  return [
    { value: 'all', label: t('همه عامل‌ها') },
    ...names.map(n => ({ value: n, label: n })),
  ]
})

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

const filtered = computed(() => {
  const q = search.value.trim()
  return logs.value.filter((l) => {
    if (props.mode === 'activity' && l.action === 'login') return false
    if (actorFilter.value !== 'all' && l.actorName !== actorFilter.value) return false
    if (actionFilter.value !== 'all' && l.action !== actionFilter.value as SellerAuditAction) return false
    if (entityFilter.value !== 'all' && l.entity !== entityFilter.value as SellerAuditEntity) return false
    if (dateFrom.value && l.createdAt.slice(0, 10) < dateFrom.value) return false
    if (dateTo.value && l.createdAt.slice(0, 10) > dateTo.value) return false
    if (!q) return true
    return (
      l.summary.includes(q)
      || l.actorName.includes(q)
      || l.entityId.includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch(filtered, () => {
  if (page.value > pageCount.value) page.value = pageCount.value
})
</script>
