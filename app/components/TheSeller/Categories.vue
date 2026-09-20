<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('دسته‌بندی‌ها')"
        :description="$t('درخت چندسطحی — هر دسته موجودیت مستقل با انتخاب والد در فرم')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('دسته')}` : undefined"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('categories.create')"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-tabler-file-import"
              class="cursor-pointer"
              @click="importOpen = true"
            >
              {{ $t('ورود داده') }}
            </UButton>
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
            <UButton
              v-if="can('categories.create')"
              to="/seller/categories/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
            >
              {{ $t('افزودن دسته‌بندی') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('categories.create')"
        to="/seller/categories/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer font-medium"
      >
        {{ $t('افزودن دسته‌بندی') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی دسته‌بندی')"
      :has-active="hasActiveFilters || (parentFilter !== 'all')"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAll"
    >
      <template #extra>
        <div class="flex items-center gap-1 rounded-xl border border-muted bg-default p-0.5">
          <UButton
            type="button"
            color="neutral"
            :variant="viewMode === 'tree' ? 'soft' : 'ghost'"
            size="sm"
            icon="i-tabler-binary-tree"
            class="cursor-pointer"
            @click="viewMode = 'tree'"
          >
            {{ $t('درخت') }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            :variant="viewMode === 'flat' ? 'soft' : 'ghost'"
            size="sm"
            icon="i-tabler-list"
            class="cursor-pointer"
            @click="viewMode = 'flat'"
          >
            {{ $t('لیست') }}
          </UButton>
        </div>
        <UButton
          v-if="viewMode === 'tree'"
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-fold"
          class="cursor-pointer"
          :disabled="!collapsibleIds.length"
          @click="collapseAll"
        >
          {{ $t('جمع کردن') }}
        </UButton>
        <UButton
          v-if="viewMode === 'tree'"
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-tabler-fold-down"
          class="cursor-pointer"
          :disabled="!collapsibleIds.length || !anyCollapsed"
          @click="expandAll"
        >
          {{ $t('باز کردن') }}
        </UButton>
      </template>
    </TheSellerListToolbar>

    <p class="text-xs text-muted mb-3 leading-relaxed">
      <template v-if="viewMode === 'tree'">
        {{ $t('نمایش سلسله‌مراتبی با تورفتگی؛ فلش کنار هر والد فرزندان را جمع/باز می‌کند.') }}
      </template>
      <template v-else>
        {{ $t('همه دسته‌ها در یک سطح، مرتب بر اساس نام — بدون جمع‌کردن.') }}
      </template>
      <span
        v-if="!hasHierarchy"
        class="block mt-1 text-warning"
      >
        {{ $t('فعلاً همه دسته‌ها در سطح ریشه هستند. با «افزودن فرزند» یا انتخاب والد در فرم، درخت ساخته می‌شود.') }}
      </span>
    </p>

    <div class="mb-4">
      <UFormField
        :label="$t('فیلتر والد')"
        :help="$t('فرزندان مستقیم والد انتخاب‌شده (یا فقط ریشه‌ها)')"
      >
        <USelect
          v-model="parentFilter"
          :items="parentFilterItems"
          value-key="value"
          class="w-full sm:w-72"
        />
      </UFormField>
    </div>

    <div
      v-if="selectedIds.length && (can('categories.update') || can('categories.delete'))"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-xl border border-primary/30 bg-primary/5 p-3"
    >
      <span class="text-xs num">{{ selectedIds.length.toLocaleString('fa-IR') }} {{ $t('انتخاب‌شده') }}</span>
      <UButton
        v-if="can('categories.update')"
        type="button"
        color="success"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        @click="bulkStatus('active')"
      >
        {{ $t('فعال‌سازی') }}
      </UButton>
      <UButton
        v-if="can('categories.update')"
        type="button"
        color="neutral"
        variant="soft"
        size="xs"
        class="cursor-pointer"
        @click="bulkStatus('inactive')"
      >
        {{ $t('غیرفعال‌سازی') }}
      </UButton>
      <UButton
        v-if="can('categories.delete')"
        type="button"
        color="error"
        variant="soft"
        size="xs"
        icon="i-tabler-trash"
        class="cursor-pointer"
        @click="openBulkDelete"
      >
        {{ $t('حذف') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        class="cursor-pointer"
        @click="selectedIds = []"
      >
        {{ $t('لغو') }}
      </UButton>
    </div>

    <div
      v-if="(loading || pending) && !listItems.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!visibleRows.length"
      icon="i-tabler-category"
      :message="search.trim() || status !== 'all' || parentFilter !== 'all'
        ? $t('دسته‌ای با این فیلتر پیدا نشد')
        : $t('هنوز دسته‌بندی‌ای ثبت نشده است')"
    >
      <template
        v-if="!search.trim() && status === 'all' && parentFilter === 'all' && can('categories.create')"
        #actions
      >
        <UButton
          to="/seller/categories/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین دسته‌بندی') }}
        </UButton>
      </template>
    </TheSellerEmptyState>

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-if="can('categories.update') || can('categories.delete')"
        class="flex items-center gap-2 text-xs text-muted px-1"
      >
        <UCheckbox
          :model-value="allVisibleSelected"
          :indeterminate="someVisibleSelected && !allVisibleSelected"
          :label="$t('انتخاب همه')"
          class="cursor-pointer"
          @update:model-value="toggleSelectAll(!!$event)"
        />
        <span
          v-if="visibleRows.length"
          class="num text-dimmed"
        >
          {{ visibleRows.length.toLocaleString('fa-IR') }} {{ $t('مورد') }}
        </span>
      </div>

      <div
        v-for="row in visibleRows"
        :key="row.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
        :style="viewMode === 'tree' ? { marginInlineStart: `${Math.min(row.depth, 6) * 16}px` } : undefined"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="can('categories.update') || can('categories.delete')"
            :model-value="selectedIds.includes(row.id)"
            class="mt-5 cursor-pointer"
            @update:model-value="toggleSelect(row.id, !!$event)"
          />

          <button
            v-if="viewMode === 'tree' "
            type="button"
            class="size-8 rounded-lg grid place-items-center text-toned hover:bg-elevated cursor-pointer shrink-0 mt-4"
            :aria-expanded="!isCollapsed(row.id)"
            :aria-label="isCollapsed(row.id) ? $t('باز کردن') : $t('جمع کردن')"
            @click="toggleCollapse(row.id)"
          >
            <UIcon
              :name="isCollapsed(row.id) ? 'i-tabler-chevron-left' : 'i-tabler-chevron-down'"
              class="size-4"
            />
          </button>
          <!-- <div
            v-else-if="viewMode === 'tree'"
            class="size-8 shrink-0"
          /> -->

          <div class="size-14 sm:size-16 rounded-xl bg-default border border-muted grid place-items-center shrink-0 overflow-hidden">
            <img
              v-if="row.image || isSellerAdminIconImage(row.icon)"
              :src="resolveMediaUrl(row.image || row.icon) || row.image || row.icon"
              :alt="row.name"
              class="size-full object-cover"
            >
            <UIcon
              v-else
              :name="resolveCategoryIconName(row.icon)"
              class="size-7 text-primary"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-medium text-highlighted truncate">
                    {{ row.name }}
                  </span>
                  <UBadge
                    v-if="row.depth === 0"
                    color="primary"
                    variant="subtle"
                    size="xs"
                  >
                    {{ $t('ریشه') }}
                  </UBadge>
                  <UBadge
                    v-if="productCount(row.id)"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    class="num"
                  >
                    {{ productCount(row.id).toLocaleString('fa-IR') }} {{ $t('محصول') }}
                  </UBadge>
                </div>
                <div
                  class="text-[11px] text-muted num mt-0.5"
                  dir="ltr"
                >
                  {{ row.id }}
                </div>
                <div
                  v-if="row.parentName"
                  class="text-[11px] text-muted mt-1"
                >
                  {{ $t('والد') }}:
                  <span class="text-toned font-medium">{{ row.parentName }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <UBadge
                  :color="row.status === 'active' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ row.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
              </div>
            </div>

            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
              <span>
                {{ $t('فرزند') }}:
                <span class="font-bold num text-highlighted">
                  {{ row.childCount.toLocaleString('fa-IR') }}
                </span>
              </span>
              <span>
                {{ $t('عمق') }}:
                <span class="font-bold num text-highlighted">
                  {{ row.depth.toLocaleString('fa-IR') }}
                </span>
              </span>
              <span>
                {{ $t('ترتیب') }}:
                <span class="font-bold num text-highlighted">
                  {{ row.sortOrder.toLocaleString('fa-IR') }}
                </span>
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-external-link"
                class="cursor-pointer"
                @click="openCategoryStorefront(row)"
              >
                {{ $t('نمایش') }}
              </UButton>
              <UButton
                v-if="can('categories.update')"
                :to="`/seller/categories/${row.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="can('categories.create')"
                :to="{ path: '/seller/categories/new', query: { parentId: row.id } }"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-category-plus"
                class="cursor-pointer"
              >
                {{ $t('افزودن فرزند') }}
              </UButton>
              <UButton
                v-if="can('categories.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(row)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="bulkDeleteMode ? $t('حذف گروهی') : $t('حذف دسته‌بندی')"
      :description="$t('حذف فقط در صورت نبود فرزند و محصول وابسته مجاز است.')"
    >
      <template #body>
        <div
          v-if="bulkDeleteMode"
          class="space-y-3 text-sm"
        >
          <p class="text-toned">
            {{ selectedIds.length.toLocaleString('fa-IR') }}
            {{ $t('دسته‌بندی انتخاب شده است') }}
          </p>
          <p
            v-if="bulkDeleteBlocked.length"
            class="text-xs text-warning leading-5"
          >
            {{ bulkDeleteBlocked.length.toLocaleString('fa-IR') }}
            {{ $t('مورد به‌خاطر فرزند یا محصول وابسته حذف نمی‌شوند') }}
          </p>
          <p
            v-if="bulkDeleteEligible.length"
            class="text-xs text-muted leading-5"
          >
            {{ bulkDeleteEligible.length.toLocaleString('fa-IR') }}
            {{ $t('مورد قابل حذف است') }}
          </p>
        </div>
        <div
          v-else-if="pendingDelete"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('نام') }}</span>
            <span class="font-medium text-highlighted">{{ pendingDelete.name }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شناسه') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
          <p
            v-if="pendingDelete.childCount > 0"
            class="text-xs text-warning"
          >
            {{ $t('این دسته فرزند دارد؛ ابتدا فرزندان را جابه‌جا یا حذف کنید.') }}
          </p>
          <p
            v-if="productCount(pendingDelete.id) > 0"
            class="text-xs text-error"
          >
            {{ $t('این دسته به محصولات لینک شده و حذف نمی‌شود.') }}
            ({{ productCount(pendingDelete.id).toLocaleString('fa-IR') }})
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            :disabled="deleting"
            @click="closeDelete"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            :loading="deleting"
            :disabled="bulkDeleteMode ? !bulkDeleteEligible.length : !canDeletePending"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <TheSellerCsvImportPanel
      v-model:open="importOpen"
      entity="categories"
      create-permission="categories.create"
    />
  </div>
</template>

<script setup lang="ts">
import {
  flattenCategoryTree,
  resolveCategoryIconName,
  toCategoryForm,
  type SellerCategoryStatus,
  type SellerCategoryTreeRow,
} from '~/data/seller-categories'
import { isSellerAdminIconImage } from '~/data/seller-admin-icons'
import { categoryStorefrontHref } from '~/data/categories'
import { downloadSellerCsv } from '~/data/seller-export'
import { resolveMediaUrl } from '~/composables/fetch'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { storeUrl } = useAppMode()
const {
  listItems,
  listMeta,
  pending,
  fetchList,
  deleteCategory,
  bulkDeleteCategories,
  updateCategory,
  getById,
} = useSellerCategories()
const { can } = useSellerPermissions()
const { search, status, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

function openCategoryStorefront(row: SellerCategoryTreeRow) {
  const href = categoryStorefrontHref(storeUrl, row.id)
  if (import.meta.client) window.open(href, '_blank', 'noopener,noreferrer')
}

const viewMode = ref<'tree' | 'flat'>('tree')
/** Collapsed parent ids — Record is more reliably reactive than Set in templates */
const collapsedMap = ref<Record<string, true>>({})
const selectedIds = ref<string[]>([])
const deleteOpen = ref(false)
const bulkDeleteMode = ref(false)
const pendingDelete = ref<SellerCategoryTreeRow | null>(null)
const deleting = ref(false)
const loading = ref(true)
const importOpen = ref(false)

const parentFilter = computed({
  get: () => String(route.query.parentId ?? 'all'),
  set: (value: string) => {
    const next = !value || value === 'all' ? undefined : value
    void patchQuery({ parentId: next })
  },
})

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: `${t('همه')} (${c.all.toLocaleString('fa-IR')})` },
    { id: 'active', label: `${t('فعال')} (${c.active.toLocaleString('fa-IR')})` },
    { id: 'inactive', label: `${t('غیرفعال')} (${c.inactive.toLocaleString('fa-IR')})` },
  ]
})

const treeRows = computed(() => {
  const rows = flattenCategoryTree(listItems.value)
  // Prefer server childCount / parentName when present on list items
  const byId = new Map(listItems.value.map(c => [c.id, c]))
  return rows.map((row) => {
    const raw = byId.get(row.id)
    const serverChildren = Number(raw?.childCount)
    return {
      ...row,
      // Never let a missing/zero server count hide real children in the current list
      childCount: Math.max(
        Number.isFinite(serverChildren) ? serverChildren : 0,
        row.childCount,
      ),
      parentName: raw?.parentName ?? row.parentName,
      productCount: Number(raw?.productCount) || 0,
    }
  })
})

const hasHierarchy = computed(() =>
  listItems.value.some(c => Boolean(c.parentId))
  || treeRows.value.some(r => r.childCount > 0),
)

const parentFilterItems = computed(() => [
  { value: 'all', label: t('همه والدین') },
  { value: '__root__', label: t('فقط ریشه‌ها') },
  ...listMeta.value.parentOptions.map(c => ({ value: c.id, label: c.name })),
])

function productCount(id: string) {
  const row = treeRows.value.find(r => r.id === id)
  if (row && 'productCount' in row) return Number((row as any).productCount) || 0
  return Number(listItems.value.find(c => c.id === id)?.productCount) || 0
}

/** Server already filtered — tree/flat only reshapes rows */
const filteredRows = computed(() => treeRows.value)

function hasVisibleChildren(id: string) {
  return filteredRows.value.some(r => r.parentId === id)
}

const collapsibleIds = computed(() =>
  filteredRows.value.filter(r => hasVisibleChildren(r.id)).map(r => r.id),
)

const anyCollapsed = computed(() =>
  collapsibleIds.value.some(id => collapsedMap.value[id]),
)

function isCollapsed(id: string) {
  return Boolean(collapsedMap.value[id])
}

const visibleRows = computed(() => {
  if (viewMode.value === 'flat') {
    return [...filteredRows.value].sort((a, b) => a.name.localeCompare(b.name, 'fa'))
  }

  // Search / parent filter: show all matches (no collapse). Normalize indent if subtree was cut.
  if (search.value.trim() || (parentFilter.value && parentFilter.value !== 'all')) {
    const rows = filteredRows.value
    if (!rows.length) return rows
    const minDepth = Math.min(...rows.map(r => r.depth))
    if (minDepth > 0) {
      return rows.map(r => ({ ...r, depth: r.depth - minDepth }))
    }
    return rows
  }

  const hidden = new Set<string>()
  for (const row of filteredRows.value) {
    if (row.parentId && (collapsedMap.value[row.parentId] || hidden.has(row.parentId))) {
      hidden.add(row.id)
    }
  }
  return filteredRows.value.filter(r => !hidden.has(r.id))
})

function canDeleteRow(row: SellerCategoryTreeRow | undefined) {
  if (!row) return false
  if (row.childCount > 0) return false
  if (productCount(row.id) > 0) return false
  return true
}

const canDeletePending = computed(() => canDeleteRow(pendingDelete.value ?? undefined))

const selectedRows = computed(() =>
  selectedIds.value
    .map(id => treeRows.value.find(r => r.id === id))
    .filter((r): r is SellerCategoryTreeRow => Boolean(r)),
)

/** Deepest-first; parent is eligible only if all selected children are also eligible. */
const bulkDeleteEligible = computed(() => {
  const selected = new Set(selectedIds.value)
  const byDepth = [...selectedRows.value].sort((a, b) => b.depth - a.depth)
  const eligible = new Set<string>()

  for (const row of byDepth) {
    if (productCount(row.id) > 0) continue
    const kids = treeRows.value.filter(r => r.parentId === row.id)
    if (kids.some(k => !selected.has(k.id))) continue
    if (kids.some(k => selected.has(k.id) && !eligible.has(k.id))) continue
    eligible.add(row.id)
  }

  return byDepth.filter(r => eligible.has(r.id))
})

const bulkDeleteBlocked = computed(() => {
  const eligible = new Set(bulkDeleteEligible.value.map(r => r.id))
  return selectedRows.value.filter(r => !eligible.has(r.id))
})

function toggleCollapse(id: string) {
  const next = { ...collapsedMap.value }
  if (next[id]) delete next[id]
  else next[id] = true
  collapsedMap.value = next
}

function collapseAll() {
  if (!collapsibleIds.value.length) {
    toast.info(t('دسته‌ای با فرزند قابل جمع‌کردن در این فیلتر نیست'))
    return
  }
  collapsedMap.value = Object.fromEntries(collapsibleIds.value.map(id => [id, true as const]))
}

function expandAll() {
  collapsedMap.value = {}
}

function toggleSelect(id: string, on: boolean) {
  if (on) selectedIds.value = [...new Set([...selectedIds.value, id])]
  else selectedIds.value = selectedIds.value.filter(x => x !== id)
}

const allVisibleSelected = computed(() =>
  visibleRows.value.length > 0
  && visibleRows.value.every(r => selectedIds.value.includes(r.id)),
)

const someVisibleSelected = computed(() =>
  visibleRows.value.some(r => selectedIds.value.includes(r.id)),
)

function toggleSelectAll(on: boolean) {
  const ids = visibleRows.value.map(r => r.id)
  if (on) {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  }
  else {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  }
}

async function clearAll() {
  selectedIds.value = []
  await clearFilters()
  await patchQuery({ parentId: undefined })
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || error?.message || fallback
}

async function loadCategories() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      force: true,
      query: {
        q: search.value || undefined,
        status: status.value || undefined,
        parentId: parentFilter.value || undefined,
      },
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری دسته‌بندی‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function bulkStatus(next: SellerCategoryStatus) {
  for (const id of selectedIds.value) {
    const cat = getById(id) || listItems.value.find(c => c.id === id)
    if (!cat) continue
    const form = toCategoryForm(cat)
    form.status = next
    await updateCategory(id, form)
  }
  selectedIds.value = []
  toast.success(t('وضعیت دسته‌ها به‌روز شد'))
  await loadCategories()
}

function openDelete(row: SellerCategoryTreeRow) {
  bulkDeleteMode.value = false
  pendingDelete.value = row
  deleteOpen.value = true
}

function openBulkDelete() {
  if (!selectedIds.value.length) return
  bulkDeleteMode.value = true
  pendingDelete.value = null
  deleteOpen.value = true
}

function closeDelete() {
  deleteOpen.value = false
  pendingDelete.value = null
  bulkDeleteMode.value = false
}

async function confirmDelete() {
  deleting.value = true
  try {
    if (bulkDeleteMode.value) {
      const targets = [...bulkDeleteEligible.value]
      if (!targets.length) return

      const result = await bulkDeleteCategories(targets.map(r => r.id))
      const blocked = bulkDeleteBlocked.value.length
      selectedIds.value = []
      closeDelete()
      await loadCategories()

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      if (result.deleted) {
        toast.success(`${result.deleted.toLocaleString('fa-IR')} ${t('دسته‌بندی حذف شد')}`)
      }
      const failedCount = (result.failed?.length || 0) + blocked
      if (failedCount) {
        toast.warning(`${failedCount.toLocaleString('fa-IR')} ${t('مورد به‌خاطر وابستگی رد شد')}`)
      }
      if (result.failed?.[0]?.message) {
        toast.error(result.failed[0].message)
      }
      return
    }

    if (!pendingDelete.value || !canDeletePending.value) return
    const result = await deleteCategory(pendingDelete.value.id)
    closeDelete()
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(t('دسته‌بندی حذف شد'))
    await loadCategories()
  }
  finally {
    deleting.value = false
  }
}

function exportCsv() {
  downloadSellerCsv(
    `categories-${Date.now()}`,
    ['id', 'name', 'parentId', 'status', 'sortOrder', 'depth', 'products', 'children'],
    filteredRows.value.map(r => [
      r.id,
      r.name,
      r.parentId || '',
      r.status,
      r.sortOrder,
      r.depth,
      productCount(r.id),
      r.childCount,
    ]),
  )
  toast.success(t('فایل خروجی آماده شد'))
}

watch(
  () => route.query,
  () => {
    void loadCategories()
  },
  { deep: true },
)

onMounted(() => {
  void loadCategories()
})
</script>
