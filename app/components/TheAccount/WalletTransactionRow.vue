<template>
  <div class="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/50 border border-muted">
    <div
      class="size-10 rounded-xl grid place-items-center shrink-0"
      :class="iconWrap"
    >
      <UIcon :name="meta.icon" class="size-5" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-sm font-medium text-highlighted truncate">
            {{ $t(tx.title) }}
          </div>
          <div
            v-if="tx.description"
            class="text-[11px] text-muted mt-0.5 line-clamp-1"
          >
            {{ $t(tx.description) }}
          </div>
        </div>
        <div class="text-end shrink-0">
          <div
            class="text-sm font-bold num"
            :class="amountClass"
          >
            {{ amountPrefix }}{{ formatPrice(tx.amount) }}
          </div>
          <div class="text-[10px] text-muted mt-0.5">
            {{ $t('تومان') }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-2 flex-wrap">
        <UBadge
          :color="statusMeta.color"
          variant="soft"
          size="xs"
        >
          {{ $t(statusMeta.label) }}
        </UBadge>
        <UBadge
          color="neutral"
          variant="subtle"
          size="xs"
        >
          {{ $t(meta.label) }}
        </UBadge>
        <span class="text-[11px] text-dimmed num ms-auto">
          {{ tx.date }}
          <span class="mx-1 opacity-50">·</span>
          {{ tx.time }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  walletTxStatusMeta,
  walletTxTypeMeta,
  type WalletTransaction,
} from '~/data/account-wallet'

const props = defineProps<{
  tx: WalletTransaction
}>()

const meta = computed(() => walletTxTypeMeta[props.tx.type])
const statusMeta = computed(() => walletTxStatusMeta[props.tx.status])

const isCredit = computed(() => props.tx.signedAmount > 0)

const amountPrefix = computed(() => {
  if (props.tx.status === 'failed') return ''
  return isCredit.value ? '+' : '−'
})

const amountClass = computed(() => {
  if (props.tx.status === 'failed') return 'text-muted line-through'
  if (props.tx.status === 'pending') return 'text-warning'
  return isCredit.value ? 'text-success' : 'text-error'
})

const iconWrap = computed(() => {
  const map = {
    success: 'bg-success/15 text-success',
    error: 'bg-error/15 text-error',
    primary: 'bg-primary/15 text-primary',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-info/15 text-info',
  } as const
  return map[meta.value.color]
})
</script>
