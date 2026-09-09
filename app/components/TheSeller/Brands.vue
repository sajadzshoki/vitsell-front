<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('برندها')"
        :description="$t('مدیریت برندهای محصول — نام، لوگو و وضعیت نمایش')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('برند')}` : undefined"
      >
        <template #actions>
          <div class="flex items-center gap-2 flex-wrap">
            <UButton
              v-if="can('brands.view')"
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
              v-if="can('brands.create')"
              to="/seller/brands/new"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer"
            >
              {{ $t('افزودن برند') }}
            </UButton>
          </div>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4 space-y-2">
      <UButton
        v-if="can('brands.create')"
        to="/seller/brands/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن برند') }}
      </UButton>
      <UButton
        v-if="can('brands.view')"
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
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

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

    <div
      v-if="(loading || pending) && !brands.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!brands.length"
      icon="i-tabler-trademark"
      :message="hasActiveFilters ? $t('برندی با این فیلتر پیدا نشد') : $t('هنوز برندی ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && can('brands.create')"
        #actions
      >
        <UButton
          to="/seller/brands/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین برند') }}
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
        v-for="brand in paged"
        :key="brand.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(brand.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(brand.id, !!$event)"
          />

          <div class="size-16 rounded-xl bg-default border border-muted overflow-hidden shrink-0 grid place-items-center">
            <img
              v-if="brand.logo"
              :src="brand.logo"
              :alt="brand.name"
              class="size-full object-contain p-1"
            >
            <TheIcon
              v-else
              icon-type="img"
              name="noImage.png"
              class="size-8 opacity-60"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/brands/${brand.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition-all  cursor-pointer"
                >
                  {{ brand.name }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ brand.slug }}
                </div>
              </div>
              <UBadge
                :color="brand.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ brand.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
              </UBadge>
            </div>

            <p
              v-if="brand.description"
              class="text-[11px] text-muted mt-2 line-clamp-2"
            >
              {{ brand.description }}
            </p>

            <div class="mt-2 flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] text-muted num">
                {{ productCountFor(brand).toLocaleString('fa-IR') }} {{ $t('محصول') }}
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
                @click="openBrandStorefront(brand)"
              >
                {{ $t('نمایش') }}
              </UButton>
              <UButton
                v-if="can('brands.view')"
                :to="`/seller/brands/${brand.id}`"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-tabler-eye"
                class="cursor-pointer"
              >
                {{ $t('جزئیات') }}
              </UButton>
              <UButton
                v-if="can('brands.update')"
                :to="`/seller/brands/${brand.id}?tab=edit`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="can('brands.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(brand)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TheSellerPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="listMeta.total"
    />

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف برند')"
      :description="$t('در صورت داشتن محصول وابسته، حذف انجام نمی‌شود.')"
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
import { downloadSellerCsv } from '~/data/seller-export'
import { brandStorefrontHref } from '~/data/categories'
import type { SellerBrand } from '~/data/seller-brands'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const { storeUrl } = useAppMode()
const {
  brands,
  listMeta,
  pending,
  fetchList,
  deleteBrand,
  setStatus,
} = useSellerBrands()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

function openBrandStorefront(brand: SellerBrand) {
  const href = brandStorefrontHref(storeUrl, brand.name)
  if (import.meta.client) window.open(href, '_blank', 'noopener,noreferrer')
}

const loading = ref(true)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerBrand | null>(null)
const deleting = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)

const canBulk = computed(() => can('brands.update'))

const bulkActionItems = computed(() => [
  { value: 'activate', label: t('فعال‌سازی') },
  { value: 'deactivate', label: t('غیرفعال‌سازی') },
])

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: c.all },
    { id: 'active', label: t('فعال'), count: c.active },
    { id: 'inactive', label: t('غیرفعال'), count: c.inactive },
  ]
})

function productCountFor(brand: SellerBrand) {
  return Number(brand.productCount) || 0
}

/** Server already filtered + paged */
const paged = computed(() => brands.value)

const allPageSelected = computed(() =>
  paged.value.length > 0 && paged.value.every(b => selectedIds.value.includes(b.id)),
)

const somePageSelected = computed(() =>
  paged.value.some(b => selectedIds.value.includes(b.id)),
)

function toggleSelect(id: string, on: boolean) {
  if (on) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function toggleSelectPage(on: boolean) {
  const ids = paged.value.map(b => b.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadBrands() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      force: true,
      query: {
        q: search.value || undefined,
        status: status.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      },
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری برندها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    const target = bulkAction.value === 'activate' ? 'active' : 'inactive'
    for (const id of selectedIds.value) {
      await setStatus(id, target)
    }
    toast.success(t('برندها به‌روزرسانی شدند'))
    selectedIds.value = []
    bulkAction.value = ''
    await loadBrands()
  }
  finally {
    bulkRunning.value = false
  }
}

function openDelete(brand: SellerBrand) {
  pendingDelete.value = brand
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteBrand(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('برند حذف شد'))
    await loadBrands()
  }
  finally {
    deleting.value = false
  }
}

function exportCsv() {
  const rows = brands.value.map(brand => [
    brand.id,
    brand.name,
    brand.slug,
    brand.status === 'active' ? t('فعال') : t('غیرفعال'),
    productCountFor(brand),
    brand.sortOrder,
    brand.description,
    brand.createdAt.slice(0, 10),
  ])
  downloadSellerCsv(
    'brands-export',
    ['شناسه', 'نام', 'اسلاگ', 'وضعیت', 'تعداد محصول', 'ترتیب', 'توضیحات', 'تاریخ ایجاد'],
    rows,
  )
  toast.success(t('فایل خروجی آماده شد'))
}

watch(
  () => route.query,
  () => {
    void loadBrands()
  },
  { deep: true },
)

onMounted(() => {
  void loadBrands()
})
</script>
