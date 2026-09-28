<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 ">
    <div class="hidden lg:block">
      <TheSellerPageHeader
        :title="$t('مرجوعی‌ها')"
        :count-label="!loading ? `${listMeta.total.toLocaleString('fa-IR')} ${$t('درخواست')}` : undefined"
      >
        <template #actions>
          <UButton
            v-if="can('returns.view')"
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

    <div
      v-if="can('returns.view')"
      class="lg:hidden mb-4"
    >
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
      :search-placeholder="$t('جستجوی شماره مرجوعی، سفارش یا مشتری')"
      :has-active="hasActiveFilters"
      @update:status="status = $event"
      @clear="clearFilters"
    />

    <div
      v-if="(loading || pending) && !returns.length"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <TheSellerEmptyState
      v-else-if="!returns.length"
      icon="i-tabler-arrow-back-up"
      :message="hasActiveFilters ? $t('مرجوعی‌ای با این فیلتر پیدا نشد') : $t('هنوز مرجوعی ثبت نشده')"
    />

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="item in returns"
        :key="item.id"
        class="bg-muted border border-muted rounded-2xl p-4"
      >
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-highlighted num" dir="ltr">{{ item.id }}</span>
              <UBadge
                :color="sellerReturnStatusMeta[item.status]?.color || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ $t(sellerReturnStatusMeta[item.status]?.label || item.status) }}
              </UBadge>
            </div>
            <div class="text-[11px] text-muted mt-1">
              {{ item.customerName }}
              · {{ $t('سفارش') }}
              <NuxtLink
                :to="`/seller/orders/${item.orderId}`"
                class="num text-primary hover:underline cursor-pointer"
                dir="ltr"
              >
                {{ item.orderId }}
              </NuxtLink>
            </div>
            <div class="text-xs text-toned mt-2">
              {{ item.reason }}
            </div>
            <div class="mt-3 space-y-2">
              <div class="text-[11px] text-muted">
                {{ $t('کالاهای مرجوع‌شده') }}
              </div>
              <div
                v-if="!item.items.length"
                class="text-xs text-muted"
              >
                {{ $t('کالایی ثبت نشده') }}
              </div>
              <div
                v-for="(line, index) in item.items"
                :key="`${item.id}-card-${line.productId}-${index}`"
                class="flex items-center gap-3 rounded-xl border border-muted bg-default p-2.5"
              >
                <img
                  v-if="lineImage(line)"
                  :src="mediaSrc(lineImage(line))"
                  :alt="lineTitle(line)"
                  class="size-12 rounded-lg object-cover bg-muted shrink-0"
                >
                <div
                  v-else
                  class="size-12 rounded-lg bg-muted grid place-items-center shrink-0"
                >
                  <TheIcon
                    icon-type="img"
                    name="noImage.png"
                    class="size-5 opacity-60"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-default line-clamp-2">
                    {{ lineTitle(line) }}
                  </div>
                  <div
                    v-if="line.variantLabel"
                    class="text-[11px] text-muted mt-0.5"
                  >
                    {{ line.variantLabel }}
                  </div>
                  <div class="text-xs text-toned num mt-1">
                    {{ line.qty.toLocaleString('fa-IR') }} {{ $t('عدد') }}
                    · {{ formatPrice(line.unitPrice) }} {{ $t('تومان') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-[11px] text-muted mb-1.5">
                {{ $t('عکس‌های مشتری') }}
              </div>
              <div
                v-if="item.photos?.length"
                class="flex gap-2 flex-wrap"
              >
                <button
                  v-for="(url, index) in item.photos"
                  :key="`${item.id}-photo-${index}`"
                  type="button"
                  class="cursor-pointer rounded-lg overflow-hidden border border-muted"
                  @click="openPhoto(item.photos, index)"
                >
                  <img
                    :src="mediaSrc(url)"
                    :alt="$t('عکس مرجوعی')"
                    class="size-16 object-cover bg-muted"
                  >
                </button>
              </div>
              <p
                v-else
                class="text-xs text-muted"
              >
                {{ $t('عکسی پیوست نشده') }}
              </p>
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-tabler-list-details"
              class="cursor-pointer mt-2"
              @click="openDetail(item)"
            >
              {{ $t('جزئیات') }}
            </UButton>
            <div
              v-if="item.adminNote"
              class="text-[11px] text-muted mt-1"
            >
              {{ $t('یادداشت ادمین') }}: {{ item.adminNote }}
            </div>
            <div class="text-[11px] text-muted num mt-1" dir="ltr">
              {{ item.requestedAt.slice(0, 10) }}
              · {{ item.items.length.toLocaleString('fa-IR') }} {{ $t('قلم') }}
            </div>
          </div>
          <div
            v-if="canManage && availableActions(item).length"
            class="flex items-center gap-2 flex-wrap"
          >
            <UButton
              v-for="action in availableActions(item)"
              :key="action.status"
              type="button"
              :color="action.color"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="openConfirm(item, action.status, action.label)"
            >
              {{ $t(action.label) }}
            </UButton>
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
      v-model:open="detailOpen"
      :title="$t('جزئیات مرجوعی')"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <div
          v-if="detailItem"
          class="space-y-4"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="num font-medium text-highlighted" dir="ltr">{{ detailItem.id }}</span>
            <UBadge
              :color="sellerReturnStatusMeta[detailItem.status]?.color || 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ $t(sellerReturnStatusMeta[detailItem.status]?.label || detailItem.status) }}
            </UBadge>
          </div>
          <div class="text-sm text-toned space-y-1">
            <div>{{ detailItem.customerName }}</div>
            <div>
              {{ $t('سفارش') }}
              <NuxtLink
                :to="`/seller/orders/${detailItem.orderId}`"
                class="num text-primary hover:underline cursor-pointer"
                dir="ltr"
              >
                {{ detailItem.orderId }}
              </NuxtLink>
            </div>
            <div class="text-xs text-muted num" dir="ltr">{{ detailItem.requestedAt.slice(0, 10) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted mb-1">{{ $t('دلیل') }}</div>
            <p class="text-sm text-default">{{ detailItem.reason }}</p>
          </div>
          <div>
            <div class="text-xs text-muted mb-2">{{ $t('کالاهای مرجوع‌شده') }}</div>
            <div
              v-if="!detailItem.items.length"
              class="text-sm text-muted"
            >
              {{ $t('کالایی ثبت نشده') }}
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="(line, index) in detailItem.items"
                :key="`${detailItem.id}-${line.productId}-${index}`"
                class="flex items-center gap-3 rounded-xl border border-muted bg-muted/40 p-3"
              >
                <img
                  v-if="lineImage(line)"
                  :src="mediaSrc(lineImage(line))"
                  :alt="lineTitle(line)"
                  class="size-16 rounded-lg object-cover bg-muted shrink-0"
                >
                <div
                  v-else
                  class="size-16 rounded-lg bg-muted grid place-items-center shrink-0"
                >
                  <TheIcon
                    icon-type="img"
                    name="noImage.png"
                    class="size-6 opacity-60"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <NuxtLink
                    :to="`/seller/products/${line.productId}`"
                    class="text-sm font-medium text-default hover:text-primary line-clamp-2 cursor-pointer"
                  >
                    {{ lineTitle(line) }}
                  </NuxtLink>
                  <div
                    v-if="line.variantLabel"
                    class="text-[11px] text-muted mt-0.5"
                  >
                    {{ line.variantLabel }}
                  </div>
                  <div
                    v-if="line.sku"
                    class="text-[11px] text-muted num mt-0.5"
                    dir="ltr"
                  >
                    {{ line.sku }}
                  </div>
                </div>
                <div class="text-end shrink-0">
                  <div class="text-xs text-toned num">
                    {{ line.qty.toLocaleString('fa-IR') }} {{ $t('عدد') }}
                  </div>
                  <div class="text-sm font-bold text-highlighted num mt-1">
                    {{ formatPrice(line.qty * line.unitPrice) }}
                  </div>
                  <div class="text-[10px] text-muted">{{ $t('تومان') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="text-xs text-muted mb-2">{{ $t('عکس‌های مشتری') }}</div>
            <div
              v-if="detailItem.photos?.length"
              class="flex gap-2 flex-wrap"
            >
              <button
                v-for="(url, index) in detailItem.photos"
                :key="`${detailItem.id}-detail-photo-${index}`"
                type="button"
                class="cursor-pointer rounded-xl overflow-hidden border border-muted"
                @click="openPhoto(detailItem.photos, index)"
              >
                <img
                  :src="mediaSrc(url)"
                  :alt="$t('عکس مرجوعی')"
                  class="size-28 object-cover bg-muted"
                >
              </button>
            </div>
            <p
              v-else
              class="text-sm text-muted"
            >
              {{ $t('عکسی پیوست نشده') }}
            </p>
          </div>
          <p
            v-if="detailItem.adminNote"
            class="text-xs text-muted"
          >
            {{ $t('یادداشت ادمین') }}: {{ detailItem.adminNote }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-end gap-2 w-full flex-wrap">
          <UButton
            v-for="action in detailItem ? availableActions(detailItem) : []"
            :key="action.status"
            type="button"
            :color="action.color"
            variant="soft"
            class="cursor-pointer"
            @click="detailItem && openConfirm(detailItem, action.status, action.label)"
          >
            {{ $t(action.label) }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="detailOpen = false"
          >
            {{ $t('بستن') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="photoOpen"
      :title="$t('عکس مرجوعی')"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <img
          v-if="activePhoto"
          :src="mediaSrc(activePhoto)"
          :alt="$t('عکس مرجوعی')"
          class="w-full max-h-[70vh] object-contain rounded-xl bg-muted"
        >
        <div
          v-if="photoUrls.length > 1"
          class="mt-3 flex items-center justify-between gap-2"
        >
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-tabler-chevron-right"
            class="cursor-pointer"
            :disabled="photoIndex === 0"
            @click="photoIndex -= 1"
          />
          <span class="text-xs text-muted num">
            {{ (photoIndex + 1).toLocaleString('fa-IR') }} / {{ photoUrls.length.toLocaleString('fa-IR') }}
          </span>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-tabler-chevron-left"
            class="cursor-pointer"
            :disabled="photoIndex >= photoUrls.length - 1"
            @click="photoIndex += 1"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="confirmOpen"
      :title="$t(confirmTitle)"
      :description="confirmDescription"
    >
      <template #body>
        <div
          v-if="pendingItem"
          class="rounded-xl border border-muted bg-muted/40 p-4 text-sm space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('شماره مرجوعی') }}</span>
            <span class="num font-medium text-highlighted" dir="ltr">{{ pendingItem.id }}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted">{{ $t('مشتری') }}</span>
            <span class="font-medium">{{ pendingItem.customerName }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="confirmOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="primary"
            class="font-bold cursor-pointer"
            :loading="saving"
            @click="confirmStatusChange"
          >
            {{ $t('تأیید') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { downloadSellerCsv } from '~/data/seller-export'
import { formatPrice } from '~/data/products'
import type { SellerReturnItem } from '~/data/seller-returns-refunds'
import {
  sellerReturnStatusMeta,
  type SellerReturn,
  type SellerReturnStatus,
} from '~/data/seller-returns-refunds'


const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const { can } = useSellerPermissions()
const { returns, listMeta, pending, fetchList, setStatus } = useSellerReturns()
const { fetchProduct, getCachedProduct } = useProducts()
const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

const loading = ref(true)
const exporting = ref(false)
const saving = ref(false)
const confirmOpen = ref(false)
const detailOpen = ref(false)
const detailItem = ref<SellerReturn | null>(null)
const photoOpen = ref(false)
const photoUrls = ref<string[]>([])
const photoIndex = ref(0)
const activePhoto = computed(() => photoUrls.value[photoIndex.value] || '')
const pendingItem = ref<SellerReturn | null>(null)
const pendingStatus = ref<SellerReturnStatus | null>(null)
const pendingLabel = ref('')

const canManage = computed(() => can('returns.manage'))

function mediaSrc(url: string) {
  return resolveMediaUrl(url) || url
}

function lineTitle(line: SellerReturnItem) {
  return getCachedProduct(line.productId)?.title || line.productTitle || line.productId
}

function lineImage(line: SellerReturnItem) {
  return line.image || getCachedProduct(line.productId)?.image || ''
}

function openPhoto(urls: string[], index: number) {
  photoUrls.value = urls.filter(Boolean)
  photoIndex.value = Math.min(Math.max(index, 0), Math.max(photoUrls.value.length - 1, 0))
  photoOpen.value = photoUrls.value.length > 0
}

function hydrateReturnProducts(rows: SellerReturn[]) {
  const ids = [...new Set(rows.flatMap(row => row.items.map(line => line.productId)).filter(Boolean))]
  for (const id of ids) void fetchProduct(id)
}

function openDetail(item: SellerReturn) {
  detailItem.value = item
  detailOpen.value = true
  hydrateReturnProducts([item])
}

const statusTabs = computed(() => {
  const c = listMeta.value.statusCounts
  return [
    { id: 'all', label: t('همه'), count: Number(c.all) || 0 },
    { id: 'requested', label: t('درخواست‌شده'), count: Number(c.requested) || 0 },
    { id: 'approved', label: t('تأیید شده'), count: Number(c.approved) || 0 },
    { id: 'received', label: t('دریافت‌شده'), count: Number(c.received) || 0 },
    { id: 'completed', label: t('تکمیل‌شده'), count: Number(c.completed) || 0 },
    { id: 'rejected', label: t('رد شده'), count: Number(c.rejected) || 0 },
  ]
})


const confirmTitle = computed(() => pendingLabel.value || 'تغییر وضعیت مرجوعی')

const confirmDescription = computed(() =>
  pendingItem.value
    ? `وضعیت ${pendingItem.value.id} به «${t(sellerReturnStatusMeta[pendingStatus.value ?? 'requested'].label)}» تغییر کند؟`
    : '',
)

type ReturnAction = {
  status: SellerReturnStatus
  label: string
  color: 'primary' | 'success' | 'error' | 'warning'
}

function availableActions(item: SellerReturn): ReturnAction[] {
  switch (item.status) {
    case 'requested':
      return [
        { status: 'approved', label: 'تأیید', color: 'success' },
        { status: 'rejected', label: 'رد', color: 'error' },
      ]
    case 'approved':
      return [{ status: 'received', label: 'دریافت کالا', color: 'primary' }]
    case 'received':
    case 'processing':
      return [{ status: 'completed', label: 'تکمیل', color: 'success' }]
    default:
      return []
  }
}

function openConfirm(item: SellerReturn, nextStatus: SellerReturnStatus, label: string) {
  pendingItem.value = item
  pendingStatus.value = nextStatus
  pendingLabel.value = label
  confirmOpen.value = true
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

async function loadReturns() {
  loading.value = true
  try {
    const { ok, error } = await fetchList({
      q: search.value || undefined,
      status: status.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (!ok) {
      toast.error(apiErrorMessage(error, t('بارگذاری مرجوعی‌ها ناموفق بود')))
      return
    }
    hydrateReturnProducts(returns.value)
    if (detailItem.value) {
      detailItem.value = returns.value.find(row => row.id === detailItem.value?.id) || detailItem.value
    }
  }
  finally {
    loading.value = false
  }
}

async function confirmStatusChange() {
  if (!pendingItem.value || !pendingStatus.value) return
  saving.value = true
  try {
    const result = await setStatus(pendingItem.value.id, pendingStatus.value)
    confirmOpen.value = false
    pendingItem.value = null
    pendingStatus.value = null
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('وضعیت مرجوعی به‌روزرسانی شد'))
    await loadReturns()
  }
  finally {
    saving.value = false
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
      toast.error(apiErrorMessage(error, t('خروجی مرجوعی‌ها ناموفق بود')))
      return
    }
    downloadSellerCsv(
      `returns-${Date.now()}`,
      ['شناسه', 'سفارش', 'مشتری', 'وضعیت', 'دلیل', 'یادداشت', 'تاریخ', 'اقلام'],
      returns.value.map(r => [
        r.id,
        r.orderId,
        r.customerName,
        sellerReturnStatusMeta[r.status]?.label || r.status,
        r.reason,
        r.adminNote,
        r.requestedAt.slice(0, 10),
        r.items.length,
      ]),
    )
    toast.success(t('فایل خروجی آماده شد'))
    await loadReturns()
  }
  finally {
    exporting.value = false
  }
}

watch(
  () => route.query,
  () => {
    void loadReturns()
  },
  { deep: true },
)

onMounted(() => {
  void loadReturns()
})
</script>
