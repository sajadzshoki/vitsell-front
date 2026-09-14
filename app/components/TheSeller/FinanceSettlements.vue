<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-24 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <TheSellerPageHeader
          :title="$t('تسویه‌های درگاه')"
          :description="$t('تسویه درگاه/بانک — نه برداشت کیف پول مارکت‌پلیس')"
          :count-label="`${filtered.length.toLocaleString('fa-IR')} ${$t('رکورد')}`"
        >
          <template #actions>
            <UButton
              v-if="can('settlements.manage')"
              type="button"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
              @click="createOpen = true"
            >
              {{ $t('ثبت تسویه') }}
            </UButton>
          </template>
        </TheSellerPageHeader>
      </div>

      <div class="lg:hidden mb-4">
        <UButton
          v-if="can('settlements.manage')"
          type="button"
          color="primary"
          block
          icon="i-tabler-plus"
          class="cursor-pointer font-medium"
          @click="createOpen = true"
        >
          {{ $t('ثبت تسویه') }}
        </UButton>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="text-xs text-muted mb-1">
            {{ $t(card.label) }}
          </div>
          <div class="text-base font-bold text-highlighted num">
            {{ card.value }}
          </div>
        </div>
      </div>

      <TheSellerListToolbar
        v-model:search="search"
        :status="status"
        :tabs="statusTabs"
        :search-placeholder="$t('جستجوی شناسه، درگاه یا مرجع')"
        :has-active="hasActiveFilters"
        @update:status="status = $event"
        @clear="clearFilters"
      />

      <TheSellerEmptyState
        v-if="!settlements.length"
        icon="i-tabler-building-bank"
        :message="$t('هنوز تسویه‌ای ثبت نشده')"
      />

      <TheSellerEmptyState
        v-else-if="!filtered.length"
        icon="i-tabler-filter-off"
        :message="$t('تسویه‌ای با این فیلتر پیدا نشد')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="item in paged"
          :key="item.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <NuxtLink
              :to="`/seller/finance/settlements/${item.id}`"
              class="min-w-0 cursor-pointer hover:opacity-80"
            >
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >{{ item.id }}</span>
                <UBadge
                  :color="sellerSettlementStatusMeta[item.status].color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerSettlementStatusMeta[item.status].label) }}
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerSettlementSourceMeta[item.source].label) }}
                </UBadge>
              </div>
              <div class="text-[11px] text-muted mt-1">
                {{ item.gateway }}
                <template v-if="item.reference">
                  · <span
                    class="num"
                    dir="ltr"
                  >{{ item.reference }}</span>
                </template>
              </div>
            </NuxtLink>
            <div class="text-end shrink-0">
              <div class="text-sm font-bold text-highlighted num">
                {{ formatPrice(item.netAmount) }}
              </div>
              <div class="text-[11px] text-muted num mt-0.5">
                {{ item.settlementDate.slice(0, 10) }}
              </div>
            </div>
          </div>
          <div
            v-if="can('settlements.manage') && statusActions(item).length"
            class="flex flex-wrap gap-2 mt-3"
          >
            <UButton
              v-for="action in statusActions(item)"
              :key="action.status"
              type="button"
              :color="action.color"
              variant="soft"
              size="xs"
              class="cursor-pointer"
              @click="openStatusConfirm(item, action.status, action.label)"
            >
              {{ $t(action.label) }}
            </UButton>
          </div>
        </div>
      </div>

      <TheSellerPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filtered.length"
      />
    </template>

    <UModal
      v-model:open="createOpen"
      :title="$t('ثبت تسویه درگاه/بانک')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitCreate"
        >
          <TheFormInput
            v-model="createForm.amount"
            :label="$t('مبلغ (تومان)')"
            dir="ltr"
            thousand-sep
            required
          />
          <TheFormInput
            v-model="createForm.fees"
            :label="$t('کارمزد (تومان)')"
            dir="ltr"
            thousand-sep
          />
          <UFormField :label="$t('منبع')">
            <USelect
              v-model="createForm.source"
              :items="sourceItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <TheFormInput
            v-model="createForm.gateway"
            :label="$t('درگاه / بانک')"
            required
          />
          <TheFormInput
            v-model="createForm.reference"
            :label="$t('شماره مرجع')"
            dir="ltr"
          />
          <TheFormInput
            v-model="createForm.note"
            :label="$t('یادداشت')"
          />
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="createOpen = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="createBusy"
              class="cursor-pointer"
            >
              {{ $t('ثبت') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="statusConfirmOpen"
      :title="$t(statusConfirmTitle)"
      :description="statusConfirmDescription"
    >
      <template #body>
        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="statusConfirmOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            class="cursor-pointer"
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
import { formatPrice } from '~/data/products'
import {
  sellerSettlementSourceMeta,
  sellerSettlementStatusMeta,
  type SellerSettlement,
  type SellerSettlementSource,
  type SellerSettlementStatus,
} from '~/data/seller-finance-settlements'

const actor = { id: 'admin', name: 'ادمین' }
const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  settlements,
  settlementsMeta,
  createSettlement,
  setSettlementStatus,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const { search, status, page, pageSize, hasActiveFilters, clearFilters } = useSellerListQuery({
  defaultStatus: 'all',
  defaultPageSize: 10,
})

const createOpen = ref(false)
const createBusy = ref(false)
const statusConfirmOpen = ref(false)
const pendingItem = ref<SellerSettlement | null>(null)
const pendingStatus = ref<SellerSettlementStatus | null>(null)
const statusConfirmTitle = ref('')
const statusConfirmDescription = ref('')

const createForm = ref({
  amount: '',
  fees: '',
  source: 'gateway' as SellerSettlementSource,
  gateway: 'زرین‌پال',
  reference: '',
  note: '',
})

const sourceItems = computed(() =>
  Object.entries(sellerSettlementSourceMeta).map(([value, meta]) => ({
    label: t(meta.label),
    value,
  })),
)

const statusTabs = computed(() => {
  const counts = settlementsMeta.value.statusCounts || {}
  const all = settlements.value
  const n = (key: string, fallback: () => number) => Number(counts[key]) || fallback()
  return [
    { id: 'all', label: t('همه'), count: n('all', () => all.length) },
    { id: 'pending', label: t('در انتظار'), count: n('pending', () => all.filter(i => i.status === 'pending').length) },
    { id: 'processing', label: t('در حال پردازش'), count: n('processing', () => all.filter(i => i.status === 'processing').length) },
    { id: 'completed', label: t('تکمیل‌شده'), count: n('completed', () => all.filter(i => i.status === 'completed').length) },
    { id: 'failed', label: t('ناموفق'), count: n('failed', () => all.filter(i => i.status === 'failed').length) },
  ]
})

const summaryCards = computed(() => {
  const pending = filtered.value
    .filter(s => s.status === 'pending' || s.status === 'processing')
    .reduce((sum, s) => sum + s.netAmount, 0)
  const completed = filtered.value
    .filter(s => s.status === 'completed' || s.status === 'reconciled')
    .reduce((sum, s) => sum + s.netAmount, 0)
  const fees = filtered.value.reduce((sum, s) => sum + s.fees, 0)
  return [
    { label: 'در انتظار', value: formatPrice(pending) },
    { label: 'تکمیل‌شده', value: formatPrice(completed) },
    { label: 'کارمزد', value: formatPrice(fees) },
  ]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return settlements.value.filter((item) => {
    if (status.value !== 'all' && item.status !== status.value) return false
    if (!q) return true
    return (
      item.id.toLowerCase().includes(q)
      || item.gateway.toLowerCase().includes(q)
      || item.reference.toLowerCase().includes(q)
    )
  })
})


const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

type StatusAction = {
  status: SellerSettlementStatus
  label: string
  color: 'primary' | 'success' | 'error' | 'info'
}

function statusActions(item: SellerSettlement): StatusAction[] {
  switch (item.status) {
    case 'pending':
      return [
        { status: 'processing', label: 'شروع پردازش', color: 'primary' },
        { status: 'completed', label: 'تکمیل', color: 'success' },
        { status: 'failed', label: 'ناموفق', color: 'error' },
      ]
    case 'processing':
      return [
        { status: 'completed', label: 'تکمیل', color: 'success' },
        { status: 'failed', label: 'ناموفق', color: 'error' },
      ]
    case 'completed':
      return [{ status: 'reconciled', label: 'مغایرت‌گیری‌شده', color: 'info' }]
    default:
      return []
  }
}

function openStatusConfirm(item: SellerSettlement, next: SellerSettlementStatus, label: string) {
  pendingItem.value = item
  pendingStatus.value = next
  statusConfirmTitle.value = label
  statusConfirmDescription.value = `وضعیت ${item.id} به «${t(sellerSettlementStatusMeta[next].label)}» تغییر کند؟`
  statusConfirmOpen.value = true
}

function confirmStatusChange() {
  if (!pendingItem.value || !pendingStatus.value) return
  const item = pendingItem.value
  const next = pendingStatus.value
  statusConfirmOpen.value = false
  pendingItem.value = null
  pendingStatus.value = null
  void (async () => {
    const result = await setSettlementStatus(item.id, next, actor)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('وضعیت تسویه به‌روزرسانی شد'))
  })()
}

async function submitCreate() {
  const amount = Number(createForm.value.amount.replace(/\D/g, ''))
  const feesRaw = createForm.value.fees.replace(/\D/g, '')
  createBusy.value = true
  try {
    const result = await createSettlement({
      amount,
      fees: feesRaw ? Number(feesRaw) : undefined,
      source: createForm.value.source,
      gateway: createForm.value.gateway.trim(),
      reference: createForm.value.reference,
      note: createForm.value.note,
      actor,
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    createOpen.value = false
    createForm.value = {
      amount: '',
      fees: '',
      source: 'gateway',
      gateway: 'زرین‌پال',
      reference: '',
      note: '',
    }
    toast.success(t('تسویه ثبت شد'))
  }
  finally {
    createBusy.value = false
  }
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری تسویه‌ها ناموفق بود'))
</script>
