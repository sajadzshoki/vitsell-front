<template>
  <UModal
    v-model:open="open"
    :title="$t('ایجاد گروهی شگفت‌انگیز')"
    :description="$t('انتخاب چند محصول یا آپلود اکسل (CSV)')"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex flex-wrap gap-2">
          <UButton
            type="button"
            size="sm"
            :color="mode === 'select' ? 'primary' : 'neutral'"
            :variant="mode === 'select' ? 'soft' : 'ghost'"
            class="cursor-pointer"
            @click="mode = 'select'"
          >
            {{ $t('انتخاب محصول') }}
          </UButton>
          <UButton
            type="button"
            size="sm"
            :color="mode === 'csv' ? 'primary' : 'neutral'"
            :variant="mode === 'csv' ? 'soft' : 'ghost'"
            class="cursor-pointer"
            @click="mode = 'csv'"
          >
            {{ $t('اکسل (CSV)') }}
          </UButton>
        </div>

        <template v-if="mode === 'select'">
          <UFormField :label="$t('محصولات')">
            <USelectMenu
              v-model="productIds"
              :items="productOptions"
              value-key="value"
              multiple
              class="w-full"
              :placeholder="$t('انتخاب چند محصول')"
            />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TheFormInput
              v-model="discountPercent"
              :label="$t('درصد تخفیف')"
              dir="ltr"
              digits-only
              required
            />
            <div class="flex items-end pb-1">
              <UCheckbox
                v-model="active"
                :label="$t('فعال')"
              />
            </div>
            <TheIRDatePicker
              v-model="startsAt"
              type="datetime"
              :header="$t('شروع')"
              :placeholder="$t('انتخاب تاریخ')"
            />
            <TheIRDatePicker
              v-model="endsAt"
              type="datetime"
              :header="$t('پایان')"
              :placeholder="$t('انتخاب تاریخ')"
            />
          </div>
        </template>

        <template v-else>
          <div class="flex flex-wrap gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-tabler-download"
              class="cursor-pointer"
              @click="downloadTemplate"
            >
              {{ $t('دانلود قالب') }}
            </UButton>
            <UButton
              type="button"
              color="primary"
              variant="soft"
              icon="i-tabler-upload"
              class="cursor-pointer"
              @click="fileInput?.click()"
            >
              {{ $t('انتخاب فایل') }}
            </UButton>
            <input
              ref="fileInput"
              type="file"
              accept=".csv,text/csv"
              class="sr-only"
              @change="onFile"
            >
          </div>
          <p class="text-xs text-muted leading-6">
            {{ $t('ستون‌ها: productId, discountPercent, startsAt, endsAt, active') }}
          </p>
          <div
            v-if="csvRows.length"
            class="text-sm text-toned"
          >
            <span class="num">{{ csvRows.length.toLocaleString('fa-IR') }}</span>
            {{ $t('ردیف آماده ارسال') }}
          </div>
        </template>

        <div
          v-if="resultErrors.length"
          class="bg-muted border border-muted rounded-2xl overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-muted font-medium text-highlighted text-sm">
            {{ $t('خطاها') }}
          </div>
          <div class="max-h-40 overflow-y-auto divide-y divide-muted">
            <div
              v-for="(err, i) in resultErrors"
              :key="`${err.index}-${err.productId}-${i}`"
              class="px-4 py-2 text-xs flex gap-3 flex-wrap"
            >
              <span class="num text-muted">{{ $t('ردیف') }} {{ (err.index + 1).toLocaleString('fa-IR') }}</span>
              <span
                class="num text-toned"
                dir="ltr"
              >{{ err.productId }}</span>
              <span class="text-highlighted">{{ err.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          :disabled="saving"
          @click="open = false"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="primary"
          class="cursor-pointer font-bold"
          :loading="saving"
          :disabled="!canSubmit"
          @click="submit"
        >
          {{ $t('ثبت گروهی') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { parseCsvText } from '~/data/seller-import'
import { downloadSellerCsv } from '~/data/seller-export'
import { clampPercent, fromDatetimeLocalValue, toDatetimeLocalValue } from '~/data/seller-deals'
import type { SellerAmazingDealApiPayload } from '~/data/seller-deals'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [count: number] }>()

const { t } = useI18n()
const toast = useAppToast()
const { createBulk } = useSellerDeals()
const { listings, resolveProduct, fetchListings, fetchSeller } = useSeller()

const mode = ref<'select' | 'csv'>('select')
const productIds = ref<string[]>([])
const discountPercent = ref('20')
const active = ref(true)
const startsAt = ref<string | null>(toDatetimeLocalValue(new Date()))
const endsAt = ref<string | null>(toDatetimeLocalValue(new Date(Date.now() + 24 * 3600 * 1000)))
const csvRows = ref<SellerAmazingDealApiPayload[]>([])
const resultErrors = ref<{ index: number, productId: string, message: string }[]>([])
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const productOptions = computed(() =>
  listings.value.map((l) => {
    const p = resolveProduct(l.productId)
    return { label: p.title || l.productId, value: l.productId }
  }),
)

const canSubmit = computed(() => {
  if (mode.value === 'select') {
    return productIds.value.length > 0 && Boolean(startsAt.value) && Boolean(endsAt.value)
  }
  return csvRows.value.length > 0
})

watch(open, async (v) => {
  if (!v) return
  resultErrors.value = []
  csvRows.value = []
  productIds.value = []
  await Promise.all([fetchSeller(), fetchListings()])
})

function downloadTemplate() {
  downloadSellerCsv(
    'deals-bulk-template.csv',
    ['productId', 'discountPercent', 'startsAt', 'endsAt', 'active'],
    [['iphone-16-pro', '20', new Date().toISOString(), new Date(Date.now() + 86400000).toISOString(), 'true']],
  )
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const { rows } = parseCsvText(text)
  const parsed: SellerAmazingDealApiPayload[] = []
  for (const row of rows) {
    const productId = (row.productId || '').trim()
    if (!productId) continue
    const percent = clampPercent(Number(row.discountPercent || 20))
    const start = (row.startsAt || '').trim() || new Date().toISOString()
    const end = (row.endsAt || '').trim() || new Date(Date.now() + 86400000).toISOString()
    const isActive = !['false', '0', 'no', 'خیر'].includes(String(row.active || 'true').trim().toLowerCase())
    parsed.push({
      productId,
      discountPercent: percent,
      startsAt: fromDatetimeLocalValue(start),
      endsAt: fromDatetimeLocalValue(end),
      active: isActive,
    })
  }
  csvRows.value = parsed
  input.value = ''
  toast.success(t('فایل خوانده شد'))
}

async function submit() {
  let items: SellerAmazingDealApiPayload[] = []
  if (mode.value === 'select') {
    if (!startsAt.value || !endsAt.value) {
      toast.error(t('بازه زمانی الزامی است'))
      return
    }
    if (new Date(endsAt.value).getTime() <= new Date(startsAt.value).getTime()) {
      toast.error(t('زمان پایان باید بعد از شروع باشد'))
      return
    }
    const percent = clampPercent(Number(discountPercent.value))
    items = productIds.value.map(productId => ({
      productId,
      discountPercent: percent,
      startsAt: fromDatetimeLocalValue(startsAt.value!),
      endsAt: fromDatetimeLocalValue(endsAt.value!),
      active: active.value,
    }))
  }
  else {
    items = csvRows.value
  }

  if (!items.length) {
    toast.error(t('موردی برای ثبت نیست'))
    return
  }

  saving.value = true
  resultErrors.value = []
  try {
    const result = await createBulk(items)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    resultErrors.value = result.errors
    if (result.createdCount > 0) {
      toast.success(`${result.createdCount.toLocaleString('fa-IR')} ${t('شگفت‌انگیز ثبت شد')}`)
      emit('created', result.createdCount)
      if (!result.errors.length) open.value = false
    }
    else if (result.errors.length) {
      toast.error(t('هیچ ردیفی ثبت نشد'))
    }
  }
  finally {
    saving.value = false
  }
}
</script>
