<template>
  <UModal
    v-model:open="open"
    :title="$t('افزایش موجودی')"
    :description="$t('مبلغ را انتخاب کنید؛ پرداخت از طریق زرین‌پال انجام می‌شود.')"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="preset in walletTopUpPresets"
            :key="preset"
            type="button"
            class="rounded-xl border px-3 py-3 text-center transition-all  cursor-pointer"
            :class="amount === preset
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted bg-muted/40 text-toned hover:(border-primary/40 bg-primary/5)'"
            @click="selectPreset(preset)"
          >
            <div class="text-sm font-bold num leading-none">
              {{ formatPrice(preset) }}
            </div>
            <div class="text-[10px] mt-1 opacity-80">{{ $t('تومان') }}</div>
          </button>
        </div>

        <TheFormInput
          v-model="customAmount"
          :label="$t('مبلغ دلخواه')"
          :placeholder="$t('مثلاً 750,000')"
          icon="i-tabler-coin"
          inputmode="numeric"
          thousand-sep
          dir="ltr"
          size="lg"
          :error="error || undefined"
          :help="`${$t('حداقل')} ${formatPrice(walletMinTopUp)} ${$t('تومان')}`"
        />

        <div class="rounded-xl bg-muted/60 border border-muted p-3 flex items-center justify-between gap-3">
          <span class="text-xs text-muted">{{ $t('مبلغ قابل پرداخت') }}</span>
          <span class="text-base font-black text-highlighted num">
            {{ formatPrice(amount || 0) }}
            <span class="text-[11px] font-medium text-muted">{{ $t('تومان') }}</span>
          </span>
        </div>

        <p class="text-[11px] text-dimmed leading-6 flex items-start gap-1.5">
          <UIcon name="i-tabler-info-circle" class="size-3.5 shrink-0 mt-0.5" />
          {{ $t('پس از تأیید، به درگاه امن sandbox زرین‌پال هدایت می‌شوید و موجودی پس از پرداخت موفق به‌روز می‌شود.') }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="open = false"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="primary"
          class="font-bold"
          :loading="submitting"
          :disabled="!amount"
          trailing-icon="i-tabler-credit-card"
          @click="onSubmit"
        >
          {{ $t('پرداخت و شارژ') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import {
  walletMaxTopUp,
  walletMinTopUp,
  walletTopUpPresets,
} from '~/data/account-wallet'

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useAppToast()
const { requestTopUp } = useAccountWallet()

const amount = ref(0)
const customAmount = ref('')
const error = ref('')
const submitting = ref(false)

watch(open, (v) => {
  if (v) {
    amount.value = walletTopUpPresets[2] ?? 500_000
    customAmount.value = ''
    error.value = ''
  }
})

watch(customAmount, (raw) => {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return
  amount.value = Number(digits)
  error.value = ''
})

function selectPreset(value: number) {
  amount.value = value
  customAmount.value = ''
  error.value = ''
}

function validate() {
  if (!amount.value || amount.value < walletMinTopUp) {
    error.value = t('مبلغ کمتر از حداقل مجاز است')
    return false
  }
  if (amount.value > walletMaxTopUp) {
    error.value = t('مبلغ بیشتر از سقف مجاز است')
    return false
  }
  return true
}

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const result = await requestTopUp(amount.value)
    if (!result.ok || !('paymentUrl' in result) || !result.paymentUrl) {
      toast.error(t('شارژ کیف پول ناموفق بود'))
      return
    }
    open.value = false
    toast.success(t('در حال انتقال به درگاه پرداخت...'))
    await navigateTo(result.paymentUrl, { external: true })
  }
  finally {
    submitting.value = false
  }
}
</script>
