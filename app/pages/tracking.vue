<template>
  <main class="w-full py-4 md:py-10">
    <nav class="text-xs text-muted flex items-center gap-2 mb-6 flex-wrap">
      <NuxtLink
        to="/"
        class="hover:text-primary transition"
      >
        {{ $t('خانه') }}
      </NuxtLink>
      <span class="text-dimmed">/</span>
      <span class="text-toned">{{ $t('پیگیری سفارش') }}</span>
    </nav>

    <div class="mx-auto max-w-lg">
      <section class="overflow-hidden rounded-3xl border border-muted bg-default">
        <div class="bg-primary/10 px-6 py-8 flex flex-col items-center text-center gap-3">
          <div class="size-16 rounded-2xl bg-primary text-inverted grid place-items-center">
            <UIcon
              name="i-tabler-truck-delivery"
              class="size-8"
            />
          </div>
          <h1 class="text-xl md:text-2xl font-bold text-highlighted">
            {{ $t('پیگیری سفارش') }}
          </h1>
          <p class="text-sm text-muted leading-7 max-w-sm">
            {{ $t('شماره سفارش ویتسل را وارد کنید تا کد رهگیری پستی همان سفارش در سایت پست باز شود. اگر کد پستی را دارید، مستقیم هم می‌توانید پیگیری کنید.') }}
          </p>
        </div>

        <form
          class="p-5 sm:p-6 flex flex-col gap-5"
          @submit.prevent="submitOrder"
        >
          <TheFormInput
            v-model="orderNo"
            name="orderNo"
            size="xl"
            dir="ltr"
            autocomplete="off"
            icon="i-tabler-receipt"
            :label="$t('شماره پیگیری سفارش')"
            :placeholder="$t('مثال: BZ-123456')"
            :error="orderError"
            :disabled="lookingUp"
            @update:model-value="orderError = ''"
          />

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            trailing-icon="i-tabler-arrow-left"
            class="font-bold"
            :loading="lookingUp"
          >
            {{ $t('پیگیری سفارش') }}
          </UButton>
        </form>

        <div class="px-5 sm:px-6 pb-1 flex items-center gap-3">
          <span class="h-px flex-1 bg-muted" />
          <span class="text-xs text-dimmed">{{ $t('یا کد پستی') }}</span>
          <span class="h-px flex-1 bg-muted" />
        </div>

        <form
          class="p-5 sm:p-6 flex flex-col gap-5"
          @submit.prevent="submitPostal"
        >
          <TheFormInput
            v-model="code"
            name="tracking"
            size="xl"
            dir="ltr"
            inputmode="numeric"
            autocomplete="off"
            icon="i-tabler-barcode"
            :label="$t('شماره رهگیری پستی')"
            :placeholder="$t('بارکد پستی را اینجا بنویسید')"
            :error="error"
            @update:model-value="error = ''"
          />

          <UButton
            type="submit"
            color="neutral"
            variant="soft"
            size="xl"
            block
            trailing-icon="i-tabler-arrow-left"
            class="font-bold"
          >
            {{ $t('پیگیری در پست') }}
          </UButton>

          <p class="text-xs text-muted text-center leading-6">
            {{ $t('در تب جدید به') }}
            <span dir="ltr" class="num text-toned">tracking.post.ir</span>
            {{ $t('می‌روید.') }}
          </p>
        </form>
      </section>

      <ol class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="flex sm:flex-col items-center sm:text-center gap-3 rounded-2xl border border-muted bg-default px-4 py-3"
        >
          <span class="size-8 rounded-full bg-primary/10 text-primary text-sm font-bold grid place-items-center shrink-0 num">
            {{ (index + 1).toLocaleString('fa-IR') }}
          </span>
          <span class="min-w-0 text-start sm:text-center">
            <span class="block text-sm font-medium text-highlighted">
              {{ $t(step.title) }}
            </span>
            <span class="block text-xs text-muted mt-0.5 leading-5">
              {{ $t(step.text) }}
            </span>
          </span>
        </li>
      </ol>

      <p class="mt-5 text-center text-sm text-muted">
        {{ $t('سفارش را از ویتسل ثبت کرده‌اید؟') }}
        <NuxtLink
          to="/account/orders"
          class="text-primary font-medium hover:underline"
        >
          {{ $t('سفارش‌های من') }}
        </NuxtLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
const POST_TRACKING_URL = 'https://tracking.post.ir/'

const { t } = useI18n()
const orderNo = ref('')
const orderError = ref('')
const lookingUp = ref(false)
const code = ref('')
const error = ref('')

const steps = [
  { title: 'شماره سفارش', text: 'همان کد پیگیری ویتسل، مثل BZ-…' },
  { title: 'کد پستی خوانده می‌شود', text: 'از روی سفارش ثبت‌شده' },
  { title: 'وضعیت را ببینید', text: 'در سایت شرکت پست' },
]

useSeoMeta({
  title: () => t('پیگیری سفارش'),
  description: () => t('پیگیری مرسوله با شماره سفارش یا کد رهگیری پستی'),
})

function openPost(tracking: string) {
  const target = `${POST_TRACKING_URL}?id=${encodeURIComponent(tracking)}`
  const opened = window.open(target, '_blank', 'noopener,noreferrer')
  if (!opened) window.location.assign(target)
}

function apiMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((item: { message?: string }) => item.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

async function submitOrder() {
  const id = orderNo.value.trim()
  if (!id) {
    orderError.value = t('شماره پیگیری سفارش را وارد کنید')
    return
  }

  lookingUp.value = true
  orderError.value = ''
  try {
    const { result, error: requestError } = await useGet<{ trackingCode: string }>(
      `/orders/${encodeURIComponent(id)}/tracking`,
      { headers: { 'no-error': true } },
    )
    const tracking = result?.trackingCode?.trim()
    if (!tracking) {
      orderError.value = apiMessage(requestError, t('کد رهگیری این سفارش پیدا نشد'))
      return
    }
    openPost(tracking)
  }
  finally {
    lookingUp.value = false
  }
}

function submitPostal() {
  const tracking = code.value.trim()
  if (!tracking) {
    error.value = t('شماره رهگیری پستی را وارد کنید')
    return
  }
  openPost(tracking)
}
</script>
