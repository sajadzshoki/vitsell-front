<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="h-20 rounded-2xl"
        />
      </div>
      <USkeleton
        v-for="i in 3"
        :key="`row-${i}`"
        class="h-24 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="hidden lg:block">
        <TheSellerPageHeader
          :title="$t('تعدیلات مالی')"
          :description="$t('ثبت اصلاحات حسابداری بدون تغییر تاریخچه پرداخت')"
          :count-label="`${adjustments.length.toLocaleString('fa-IR')} ${$t('رکورد')}`"
        >
          <template #actions>
            <UButton
              v-if="can('financial_adjustments.create')"
              type="button"
              color="primary"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer font-medium"
              @click="createOpen = true"
            >
              {{ $t('تعدیل جدید') }}
            </UButton>
          </template>
        </TheSellerPageHeader>
      </div>

      <div class="lg:hidden mb-4">
        <UButton
          v-if="can('financial_adjustments.create')"
          type="button"
          color="primary"
          block
          icon="i-tabler-plus"
          class="cursor-pointer font-medium"
          @click="createOpen = true"
        >
          {{ $t('تعدیل جدید') }}
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
          <div
            class="text-base font-bold num"
            :class="card.tone"
          >
            {{ card.value }}
          </div>
        </div>
      </div>

      <TheSellerEmptyState
        v-if="!adjustments.length"
        icon="i-tabler-adjustments"
        :message="$t('هنوز تعدیلی ثبت نشده')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="item in adjustments"
          :key="item.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="font-medium text-highlighted num"
                  dir="ltr"
                >{{ item.id }}</span>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerFinanceAdjustmentTypeMeta[item.type].label) }}
                </UBadge>
              </div>
              <p class="text-xs text-toned mt-2 leading-6">
                {{ item.reason }}
              </p>
              <div class="text-[11px] text-muted mt-2">
                {{ item.actorName }}
                <template v-if="item.orderId">
                  · {{ $t('سفارش') }}
                  <NuxtLink
                    :to="`/seller/orders/${item.orderId}`"
                    class="num text-primary hover:underline cursor-pointer"
                    dir="ltr"
                  >
                    {{ item.orderId }}
                  </NuxtLink>
                </template>
                · <span
                  class="num"
                  dir="ltr"
                >{{ item.createdAt.slice(0, 10) }}</span>
              </div>
            </div>
            <div
              class="text-sm font-bold num shrink-0"
              :class="item.amount < 0 ? 'text-error' : 'text-success'"
            >
              {{ formatSigned(item.amount) }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <UModal
      v-model:open="createOpen"
      :title="$t('ثبت تعدیل مالی')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitCreate"
        >
          <UFormField :label="$t('نوع')">
            <USelect
              v-model="createForm.type"
              :items="typeItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <TheFormInput
            v-model="createForm.amount"
            :label="$t('مبلغ (مثبت یا منفی)')"
            dir="ltr"
            required
          />
          <TheFormInput
            v-model="createForm.reason"
            :label="$t('دلیل')"
            required
          />
          <TheFormInput
            v-model="createForm.orderId"
            :label="$t('شناسه سفارش (اختیاری)')"
            dir="ltr"
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
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  sellerFinanceAdjustmentTypeMeta,
  type SellerFinanceAdjustmentType,
} from '~/data/seller-finance-adjustments'

const actor = { id: 'admin', name: 'ادمین' }
const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  adjustments,
  adjustmentsMeta,
  createAdjustment,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

const createOpen = ref(false)
const createBusy = ref(false)
const createForm = ref({
  type: 'accounting_correction' as SellerFinanceAdjustmentType,
  amount: '',
  reason: '',
  orderId: '',
})

const typeItems = computed(() =>
  Object.entries(sellerFinanceAdjustmentTypeMeta).map(([value, meta]) => ({
    label: t(meta.label),
    value,
  })),
)

const summaryCards = computed(() => {
  const summary = adjustmentsMeta.value.summary
  return [
    { label: 'بستانکار', value: formatPrice(summary.credit || 0), tone: 'text-success' },
    { label: 'بدهکار', value: formatPrice(summary.debit || 0), tone: 'text-error' },
    {
      label: 'خالص',
      value: `${(summary.net || 0) >= 0 ? '+' : '−'}${formatPrice(Math.abs(summary.net || 0))}`,
      tone: (summary.net || 0) < 0 ? 'text-error' : 'text-success',
    },
  ]
})

function formatSigned(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${formatPrice(Math.abs(amount))}`
}

async function submitCreate() {
  const amount = Number(String(createForm.value.amount).replace(/[^\d-]/g, ''))
  createBusy.value = true
  try {
    const result = await createAdjustment({
      type: createForm.value.type,
      amount,
      reason: createForm.value.reason,
      orderId: createForm.value.orderId.trim() || null,
      actor,
    })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    createOpen.value = false
    createForm.value = {
      type: 'accounting_correction',
      amount: '',
      reason: '',
      orderId: '',
    }
    toast.success(t('تعدیل ثبت شد'))
  }
  finally {
    createBusy.value = false
  }
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری تعدیلات ناموفق بود'))
</script>
