<template>
  <UModal
    v-model:open="open"
    :title="$t('درخواست برداشت')"
    :description="$t('مبلغ از موجودی کسر و پس از بررسی به حساب شما واریز می‌شود.')"
    :ui="{
      content: 'sm:max-w-lg',
      header: 'items-center justify-between gap-3',
      wrapper: 'min-w-0 text-start',
      close: 'static shrink-0',
    }"
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
          :placeholder="$t('مثلاً 500,000')"
          icon="i-tabler-cash"
          inputmode="numeric"
          thousand-sep
          dir="ltr"
          size="lg"
          :error="error || undefined"
          :help="`${$t('حداقل')} ${formatPrice(walletMinWithdraw)} ${$t('تومان')}`"
        />

        <TheFormInput
          v-model="cardNumber"
          :label="$t('شماره کارت')"
          :placeholder="$t('6037-9974-1234-5678')"
          icon="i-tabler-credit-card"
          inputmode="numeric"
          card-number
          dir="ltr"
          size="lg"
          autocomplete="cc-number"
          required
          :error="cardError || undefined"
          :help="$t('شماره ۱۶ رقمی کارت بانکی خود را وارد کنید')"
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
const cardNumber = ref('')
const error = ref('')
const cardError = ref('')
const submitting = ref(false)

watch(open, (v) => {
  if (v) {
    amountText.value = ''
    cardNumber.value = ''
    error.value = ''
    cardError.value = ''
  }
})

function digitsOnly(value: string) {
  return String(value ?? '').replace(/\D/g, '')
}

function validate() {
  error.value = ''
  cardError.value = ''

  const amount = Number(digitsOnly(amountText.value) || 0)
  if (!amount || amount < walletMinWithdraw) {
    error.value = t('مبلغ کمتر از حداقل مجاز است')
    return null
  }
  if (amount > summary.value.balance) {
    error.value = t('موجودی کافی نیست')
    return null
  }

  const card = digitsOnly(cardNumber.value)
  if (card.length !== 16) {
    cardError.value = t('شماره کارت باید ۱۶ رقم باشد')
    return null
  }

  return { amount, cardNumber: card }
}

async function onSubmit() {
  const payload = validate()
  if (!payload) return

  submitting.value = true
  try {
    const result = await requestWithdraw(payload.amount, payload.cardNumber)
    if (!result.ok) {
      const msg =
        result.error === 'insufficient'
          ? t('موجودی کافی نیست')
          : result.error === 'invalid_card'
            ? t('شماره کارت باید ۱۶ رقم باشد')
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
