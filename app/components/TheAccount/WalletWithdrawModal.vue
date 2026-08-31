<template>
  <UModal
    v-model:open="open"
    :title="$t('درخواست برداشت')"
    :description="$t('مبلغ از موجودی کسر و پس از بررسی به حساب شما واریز می‌شود.')"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="rounded-xl bg-primary/10 border border-primary/15 p-3.5 flex items-center justify-between gap-3">
          <div>
            <div class="text-[11px] text-primary/80">{{ $t('موجودی قابل برداشت') }}</div>
            <div class="text-lg font-black text-primary num mt-0.5">
              {{ formatPrice(summary.balance) }}
              <span class="text-[11px] font-medium">{{ $t('تومان') }}</span>
            </div>
          </div>
          <div class="size-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
            <UIcon name="i-tabler-wallet" class="size-5" />
          </div>
        </div>

        <TheFormInput
          v-model="amountText"
          :label="$t('مبلغ برداشت')"
          :placeholder="$t('مثلاً ۵۰۰۰۰۰')"
          icon="i-tabler-cash"
          inputmode="numeric"
          digits-only
          dir="ltr"
          size="lg"
          :error="error || undefined"
          :help="`${$t('حداقل')} ${formatPrice(walletMinWithdraw)} ${$t('تومان')}`"
        />

        <TheFormInput
          v-model="cardLast4"
          :label="$t('چهار رقم آخر کارت')"
          :placeholder="$t('مثلاً ۴۵۱۲')"
          icon="i-tabler-credit-card"
          inputmode="numeric"
          digits-only
          dir="ltr"
          size="lg"
          maxlength="4"
          :error="cardError || undefined"
          :help="$t('فعلاً فقط برای نمایش در تراکنش؛ اتصال بانکی بعداً اضافه می‌شود.')"
        />

        <p class="text-[11px] text-dimmed leading-6 flex items-start gap-1.5">
          <UIcon name="i-tabler-clock" class="size-3.5 shrink-0 mt-0.5" />
          {{ $t('بررسی و واریز معمولاً تا ۷۲ ساعت کاری زمان می‌برد.') }}
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
          :disabled="summary.balance < walletMinWithdraw"
          @click="onSubmit"
        >
          {{ $t('ثبت درخواست') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import { walletMinWithdraw } from '~/data/account-wallet'

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useAppToast()
const { summary, requestWithdraw } = useAccountWallet()

const amountText = ref('')
const cardLast4 = ref('')
const error = ref('')
const cardError = ref('')
const submitting = ref(false)

watch(open, (v) => {
  if (v) {
    amountText.value = ''
    cardLast4.value = ''
    error.value = ''
    cardError.value = ''
  }
})

function validate() {
  error.value = ''
  cardError.value = ''

  const amount = Number(String(amountText.value).replace(/\D/g, '') || 0)
  if (!amount || amount < walletMinWithdraw) {
    error.value = t('مبلغ کمتر از حداقل مجاز است')
    return null
  }
  if (amount > summary.value.balance) {
    error.value = t('موجودی کافی نیست')
    return null
  }

  const digits = String(cardLast4.value).replace(/\D/g, '')
  if (digits && digits.length !== 4) {
    cardError.value = t('چهار رقم آخر کارت را درست وارد کنید')
    return null
  }

  const hint = digits ? `‎****-****-****-${digits}` : undefined
  return { amount, hint }
}

async function onSubmit() {
  const payload = validate()
  if (!payload) return

  submitting.value = true
  try {
    const result = await requestWithdraw(payload.amount, payload.hint)
    if (!result.ok) {
      const msg = result.error === 'insufficient'
        ? t('موجودی کافی نیست')
        : t('ثبت درخواست برداشت ناموفق بود')
      toast.error(msg)
      return
    }
    toast.success(t('درخواست برداشت ثبت شد'))
    open.value = false
  }
  finally {
    submitting.value = false
  }
}
</script>
