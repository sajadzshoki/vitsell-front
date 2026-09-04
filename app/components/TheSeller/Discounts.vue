<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('تخفیف‌ها')"
        :description="$t('قوانین تخفیف فروشگاه — درصد، مبلغ ثابت، هدف‌گیری و بازه زمانی')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('تخفیف')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="canPerm('discounts.create')"
            to="/seller/discounts/new"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
          >
            {{ $t('افزودن تخفیف') }}
          </UButton>
        </template>
      </TheSellerPageHeader>
    </div>

    <div class="lg:hidden mb-4">
      <UButton
        v-if="canPerm('discounts.create')"
        to="/seller/discounts/new"
        color="primary"
        block
        icon="i-tabler-plus"
        class="cursor-pointer"
      >
        {{ $t('افزودن تخفیف') }}
      </UButton>
    </div>

    <TheSellerListToolbar
      v-model:search="search"
      :status="status"
      :tabs="statusTabs"
      :search-placeholder="$t('جستجوی نام یا شناسه')"
      :has-active="hasActiveFilters || typeFilter !== 'all'"
      :clear-label="$t('پاک کردن فیلترها')"
      @update:status="status = $event"
      @clear="clearAllFilters"
    >
      <template #extra>
        <USelect
          :model-value="typeFilter"
          :items="typeFilterItems"
          value-key="value"
          class="w-40"
          :placeholder="$t('نوع')"
          @update:model-value="setType(String($event ?? 'all'))"
        />
      </template>
    </TheSellerListToolbar>

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
      v-if="(loading || pending) && !discounts.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!discounts.length"
      icon="i-tabler-discount"
      :message="hasActiveFilters || typeFilter !== 'all'
        ? $t('تخفیفی با این فیلتر پیدا نشد')
        : $t('هنوز تخفیفی ثبت نشده است')"
    >
      <template
        v-if="!hasActiveFilters && typeFilter === 'all' && canPerm('discounts.create')"
        #actions
      >
        <UButton
          to="/seller/discounts/new"
          color="primary"
          variant="soft"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن اولین تخفیف') }}
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
        v-for="discount in discounts"
        :key="discount.id"
        class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
      >
        <div class="flex items-start gap-3">
          <UCheckbox
            v-if="canBulk"
            :model-value="selectedIds.includes(discount.id)"
            class="mt-1 shrink-0"
            @update:model-value="toggleSelect(discount.id, !!$event)"
          />

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/discounts/${discount.id}`"
                  class="text-sm font-medium text-highlighted truncate block hover:text-primary transition cursor-pointer"
                >
                  {{ discount.name }}
                </NuxtLink>
                <div
                  class="text-[11px] text-muted mt-0.5 num"
                  dir="ltr"
                >
                  {{ discount.id }}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <UBadge
                  :color="discount.type === 'percent' ? 'primary' : 'info'"
                  variant="subtle"
                  size="xs"
                >
                  {{ discount.type === 'percent'
                    ? `${discount.value.toLocaleString('fa-IR')}٪`
                    : `${formatPrice(discount.value)} ${$t('تومان')}` }}
                </UBadge>
                <UBadge
                  :color="scheduleMeta(discount).color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(scheduleMeta(discount).label) }}
                </UBadge>
                <UBadge
                  :color="discount.status === 'active' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ discount.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
              </div>
            </div>

            <p
              v-if="discount.description"
              class="text-[11px] text-muted mt-2 line-clamp-2"
            >
              {{ discount.description }}
            </p>

            <div class="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-muted">
              <span class="num">
                {{ $t('اولویت') }}: {{ discount.priority.toLocaleString('fa-IR') }}
              </span>
              <span>·</span>
              <span class="num">
                {{ discount.usageCount.toLocaleString('fa-IR') }}
                <template v-if="discount.usageLimit != null">
                  / {{ discount.usageLimit.toLocaleString('fa-IR') }}
                </template>
                {{ $t('استفاده') }}
              </span>
              <span>·</span>
              <span class="num" dir="ltr">
                {{ discount.startsAt.slice(0, 10) }} → {{ discount.endsAt.slice(0, 10) }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <UButton
                v-if="canPerm('discounts.update')"
                :to="`/seller/discounts/${discount.id}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
                class="cursor-pointer"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                v-if="canPerm('discounts.update')"
                type="button"
                :color="discount.status === 'active' ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
                :icon="discount.status === 'active' ? 'i-tabler-player-pause' : 'i-tabler-player-play'"
                class="cursor-pointer"
                @click="toggleStatus(discount)"
              >
                {{ discount.status === 'active' ? $t('غیرفعال کردن') : $t('فعال کردن') }}
              </UButton>
              <UButton
                v-if="canPerm('discounts.delete')"
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                @click="openDelete(discount)"
              >
                {{ $t('حذف') }}
              </UButton>
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
          :total="listMeta.total"
          :items-per-page="listMeta.pageSize || pageSize"
        />
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="$t('حذف تخفیف')"
      :description="$t('این تخفیف برای همیشه حذف می‌شود.')"
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
            <span class="text-muted">{{ $t('شناسه') }}</span>
            <span
              class="num font-medium text-highlighted"
              dir="ltr"
            >{{ pendingDelete.id }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            :disabled="deleting"
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
import { formatPrice } from '~/data/products'
import type { SellerDiscount } from '~/data/seller-discounts'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'
import type { SellerPermission } from '~/data/seller-permissions'
import { sellerPermissionCatalog } from '~/data/seller-permissions'

const pageSize = 10

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can, canAny } = useSellerPermissions()
const {
  discounts,
  listMeta,
  pending,
  fetchList,
  deleteDiscount,
  setStatus,
  bulkSetStatus,
  bulkDelete,
} = useSellerDiscounts()
const { search, status, page, hasActiveFilters, clearFilters, patchQuery } = useSellerListQuery({
  defaultStatus: 'all',
})

const loading = ref(true)
const deleteOpen = ref(false)
const pendingDelete = ref<SellerDiscount | null>(null)
const deleting = ref(false)
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkRunning = ref(false)

const typeFilter = computed(() => String(route.query.type ?? 'all'))

function canPerm(key: string) {
  const known = sellerPermissionCatalog.some(p => p.key === key)
  if (!known) return true
  return can(key as SellerPermission)
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

const canBulk = computed(() => {
  if (!sellerPermissionCatalog.some(p => p.key === 'discounts.update' || p.key === 'discounts.delete')) {
    return true
  }
  return canAny('discounts.update' as SellerPermission, 'discounts.delete' as SellerPermission)
})

const typeFilterItems = computed(() => [
  { value: 'all', label: t('همه انواع') },
  { value: 'percent', label: t('درصدی') },
  { value: 'fixed', label: t('مبلغ ثابت') },
])

const bulkActionItems = computed(() => {
  const items: { value: string, label: string }[] = []
  if (canPerm('discounts.update')) {
    items.push(
      { value: 'activate', label: t('فعال‌سازی') },
      { value: 'deactivate', label: t('غیرفعال‌سازی') },
    )
  }
  if (canPerm('discounts.delete')) {
    items.push({ value: 'delete', label: t('حذف') })
  }
  return items
})

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'active', label: t('فعال'), count: Number(c.active) || 0 },
    { id: 'inactive', label: t('غیرفعال'), count: Number(c.inactive) || 0 },
  ]
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil((listMeta.value.total || 0) / (listMeta.value.pageSize || pageSize))),
)

function scheduleMeta(discount: SellerDiscount) {
  const key = deriveScheduleStatus({
    startsAt: discount.startsAt,
    endsAt: discount.endsAt,
    active: discount.status === 'active',
  })
  return sellerScheduleStatusMeta[key]
}

const allPageSelected = computed(() =>
  discounts.value.length > 0 && discounts.value.every(d => selectedIds.value.includes(d.id)),
)

const somePageSelected = computed(() =>
  discounts.value.some(d => selectedIds.value.includes(d.id)),
)

async function setType(value: string) {
  await patchQuery({
    type: value && value !== 'all' ? value : undefined,
    page: undefined,
  })
}

async function clearAllFilters() {
  selectedIds.value = []
  await clearFilters()
  await patchQuery({ type: undefined })
}

async function loadDiscounts() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      type: typeFilter.value !== 'all' ? typeFilter.value : undefined,
      page: page.value,
      pageSize,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری تخفیف‌ها ناموفق بود')))
    }
  }
  finally {
    loading.value = false
  }
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
  const ids = discounts.value.map(d => d.id)
  if (on) selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  else selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
}

async function toggleStatus(discount: SellerDiscount) {
  const next = discount.status === 'active' ? 'inactive' : 'active'
  const result = await setStatus(discount.id, next)
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(next === 'active' ? t('تخفیف فعال شد') : t('تخفیف غیرفعال شد'))
  await loadDiscounts()
}

async function runBulk() {
  if (!bulkAction.value || !selectedIds.value.length) return
  bulkRunning.value = true
  try {
    if (bulkAction.value === 'delete') {
      const result = await bulkDelete(selectedIds.value)
      if (!result.ok) {
        toast.error(t(result.error))
        return
      }
      toast.success(t('تخفیف‌ها حذف شدند'))
    }
    else {
      const target = bulkAction.value === 'activate' ? 'active' : 'inactive'
      const result = await bulkSetStatus(selectedIds.value, target)
      if (!result.ok) {
        toast.error(t(result.error))
        return
      }
      toast.success(t('تخفیف‌ها به‌روزرسانی شدند'))
    }
    selectedIds.value = []
    bulkAction.value = ''
    await loadDiscounts()
  }
  finally {
    bulkRunning.value = false
  }
}

function openDelete(discount: SellerDiscount) {
  pendingDelete.value = discount
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    const result = await deleteDiscount(pendingDelete.value.id)
    deleteOpen.value = false
    pendingDelete.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('تخفیف حذف شد'))
    await loadDiscounts()
  }
  finally {
    deleting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadDiscounts()
  },
  { deep: true },
)

onMounted(() => {
  void loadDiscounts()
})
</script>
