<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('ویژگی‌ها')"
        :description="$t('مدیریت ویژگی‌های محصول — رنگ، سایز، حافظه و سایر گزینه‌های واریانت')"
        :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('ویژگی')}`"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('attributes.view')"
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
            <UButton
              v-if="can('attributes.create')"
              to="/seller/attributes/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer"
            >
              {{ $t('افزودن ویژگی') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('attributes.create')"
        to="/seller/attributes/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن ویژگی') }}
      </UButton>
      <UButton
        v-if="can('attributes.view')"
        type="button"
        color="neutral"
        variant="soft"
        block
        icon="i-tabler-download"
        class="cursor-pointer"
        @click="exportCsv"
      >
        {{ $t('خروجی CSV') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام یا اسلاگ')"
      :has-active="hasAnyFilters"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="onStatusChange"
      @clear="clearAllFilters"
    >
      <template #extra>
        <USelect
          :model-value="typeFilter || 'all'"
          :items="typeFilterItems"
          value-key="value"
          class="w-36"
          @update:model-value="typeFilter = String($event ?? '') === 'all' ? '' : String($event ?? '')"
        />
      </template>
    </TheSellerListToolbar>

    <div class="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
      <UButton
        v-for="tab in traitTabs"
        :key="tab.id"
        type="button"
        :color="traitFilter === tab.id ? 'primary' : 'neutral'"
        :variant="traitFilter === tab.id ? 'soft' : 'ghost'"
        size="xs"
        class="shrink-0 cursor-pointer"
        @click="traitFilter = tab.id"
      >
        {{ $t(tab.label) }}
        <span class="num ms-1">{{ tab.count.toLocaleString('fa-IR') }}</span>
      </UButton>
    </div>

    <div
      v-if="selectedIds.length && canBulk"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs text-toned num">
        {{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}
      </span>
      <USelect
        v-model="bulkAction"
        :items="bulkActionItems"
        value-key="value"
        class="w-44"
        :placeholder="$t('اقدام گروهی')"
      />
      <UButton
        type="button"
        color="primary"
        size="xs"
        class="cursor-pointer"
        :disabled="!bulkAction || bulkRunning"
        :loading="bulkRunning"
        @click="runBulk"
      >
        {{ $t('اجرا') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو انتخاب') }}
      </UButton>
    </div>

    <TheSellerEmptyState
      v-if="!filtered.length"
      icon="i-tabler-list-details"
      :message="hasAnyFilters ? $t('ویژگی‌ای با این فیلتر پیدا نشد') : $t('هنوز ویژگی‌ای ثبت نشده است')"
    >
      <template
        v-if="!hasAnyFilters && can('attributes.create')"
        #actions
      >
        <UButton
          to="/seller/attributes/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین ویژگی') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-if="canBulk"
        class="flex items-center gap-2 text-xs text-muted"
      >
        <UCheckbox
          :model-value="allPageSelected"
          :indeterminate="somePageSelected && !allPageSelected"
          :label="$t('انتخاب همهٔ صفحه')"
          @update:model-value="toggleSelectPage(!!$event)"
        />
      </div>

      <div
        v-for="attr in paged"
        :key="attr.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(attr.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(attr.id, !!$event)"
          />

          <div class="flex-1 min-w-0 flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="font-medium text-highlighted">
                {{ attr.name }}
              </div>
              <div
                class="text-[11px] text-muted mt-1 num"
                dir="ltr"
              >
                {{ attr.slug }}
              </div>
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerAttributeTypeMeta[attr.type].label) }}
                </UBadge>
                <UBadge
                  :color="attr.status === 'active' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ attr.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
                <UBadge
                  v-if="attr.filterable"
                  color="info"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t('فیلتر') }}
                </UBadge>
                <UBadge
                  v-if="attr.variantDefining"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t('واریانت') }}
                </UBadge>
                <span class="text-[11px] text-muted num">
                  {{ attr.values.length.toLocaleString('fa-IR') }} {{ $t('مقدار') }}
                </span>
                <span class="text-[11px] text-muted num">
                  · {{ categoryCountLabel(attr) }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <UButton
                v-if="can('attributes.update')"
                :to="`/seller/attributes/${attr.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="can('attributes.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(attr)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
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

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف ویژگی')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود و قابل بازگشت نیست.')"
    >
      <template #body>
        <div
          v-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('اسلاگ') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.slug }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
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
import { downloadSellerCsv } from '~/data/seller-export'
import {
  sellerAttributeTypeMeta,
  type SellerAttribute,
  type SellerAttributeType,
} from '~/data/seller-attributes'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { attributes, ensureLoaded, deleteAttribute, setStatus } = useSellerAttributes()
const { search, status, page, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
})

ensureLoaded()

const pageSize = 10
const deleteOpen = ref(false)
const pendingDelete = ref<SellerAttribute | null>(null)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)
const typeFilter = ref('')
const traitFilter = ref<'all' | 'filterable' | 'variant'>('all')

const canBulk = computed(() => can('attributes.update'))

const bulkActionItems = computed(() => [
  { value: 'activate', label: t('فعال‌سازی') },
  { value: 'deactivate', label: t('غیرفعال‌سازی') },
])

const statusTabs = computed(() => [
  { id: 'all', label: t('همه'), count: attributes.value.length },
  { id: 'active', label: t('فعال'), count: attributes.value.filter(a => a.status === 'active').length },
  { id: 'inactive', label: t('غیرفعال'), count: attributes.value.filter(a => a.status === 'inactive').length },
])

const typeFilterItems = computed(() => [
  { value: 'all', label: t('همه انواع') },
  ...(Object.keys(sellerAttributeTypeMeta) as SellerAttributeType[]).map(value => ({
    value,
    label: t(sellerAttributeTypeMeta[value].label),
  })),
])

const traitTabs = computed(() => [
  { id: 'all' as const, label: 'همه', count: attributes.value.length },
  {
    id: 'filterable' as const,
    label: 'قابل فیلتر',
    count: attributes.value.filter(a => a.filterable).length,
  },
  {
    id: 'variant' as const,
    label: 'واریانت',
    count: attributes.value.filter(a => a.variantDefining).length,
  },
])

const hasAnyFilters = computed(() =>
  hasActiveFilters.value || Boolean(typeFilter.value) || traitFilter.value !== 'all',
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return attributes.value.filter((attr) => {
    if (status.value !== 'all' && attr.status !== status.value) return false
    if (typeFilter.value && attr.type !== typeFilter.value) return false
    if (traitFilter.value === 'filterable' && !attr.filterable) return false
    if (traitFilter.value === 'variant' && !attr.variantDefining) return false
    if (!q) return true
    return (
      attr.name.includes(search.value.trim())
      || attr.slug.toLowerCase().includes(q)
      || attr.id.toLowerCase().includes(q)
    )
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const allPageSelected = computed(() =>
  paged.value.length > 0 && paged.value.every(a => selectedIds.value.includes(a.id)),
)

const somePageSelected = computed(() =>
  paged.value.some(a => selectedIds.value.includes(a.id)),
)

function categoryCountLabel(attr: SellerAttribute) {
  if (!attr.categoryIds.length) return t('همه دسته‌ها')
  return `${attr.categoryIds.length.toLocaleString('fa-IR')} ${t('دسته')}`
}

function onStatusChange(value: string) {
  status.value = value
}

function clearAllFilters() {
  clearFilters()
  typeFilter.value = ''
  traitFilter.value = 'all'
}

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = paged.value.map(a => a.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    const target = bulkAction.value === 'activate' ? 'active' : 'inactive'
    for (const id of selectedIds.value) {
      setStatus(id, target)
    }
    toast.success(t('ویژگی‌ها به‌روزرسانی شدند'))
    selectedIds.value = []
    bulkAction.value = ''
  }
  finally {
    bulkRunning.value = false
  }
}

function openDelete(attr: SellerAttribute) {
  pendingDelete.value = attr
  deleteOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  const result = deleteAttribute(pendingDelete.value.id)
  deleteOpen.value = false
  pendingDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('ویژگی حذف شد'))
}

function exportCsv() {
  const rows = filtered.value.map((attr) => [
    attr.id,
    attr.name,
    attr.slug,
    t(sellerAttributeTypeMeta[attr.type].label),
    attr.status === 'active' ? t('فعال') : t('غیرفعال'),
    attr.filterable ? t('بله') : t('خیر'),
    attr.searchable ? t('بله') : t('خیر'),
    attr.variantDefining ? t('بله') : t('خیر'),
    attr.categoryIds.length || t('همه'),
    attr.values.length,
    attr.sortOrder,
  ])
  downloadSellerCsv(
    'attributes-export',
    ['شناسه', 'نام', 'اسلاگ', 'نوع', 'وضعیت', 'فیلتر', 'جستجو', 'واریانت', 'دسته‌ها', 'تعداد مقادیر', 'ترتیب'],
    rows,
  )
}
</script>
