<template>
  <UModal
    v-model:open="open"
    :title="$t('تغییر قیمت گروهی')"
    :description="$t('قیمت فروش و قیمت قبلی محصولات انتخاب‌شده به یک درصد کم یا زیاد می‌شود.')"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField :label="$t('محدوده')">
          <USelect
            v-model="scope"
            :items="scopeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <p
          v-if="scope === 'selected'"
          class="text-xs text-muted leading-6"
        >
          {{ selectedIds.length.toLocaleString('fa-IR') }}
          {{ $t('محصول انتخاب‌شده تغییر می‌کند.') }}
        </p>

        <UFormField
          v-if="scope === 'category' || scope === 'category_brand'"
          :label="$t('دسته‌بندی')"
        >
          <USelectMenu
            v-model="categoryId"
            :items="categoryItems"
            value-key="value"
            :search-input="{ placeholder: $t('جستجوی دسته...') }"
            :placeholder="$t('انتخاب دسته')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="scope === 'brand' || scope === 'category_brand'"
          :label="$t('برند')"
        >
          <USelectMenu
            v-model="brandName"
            :items="brandItems"
            value-key="value"
            :search-input="{ placeholder: $t('جستجوی برند...') }"
            :placeholder="$t('انتخاب برند')"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField :label="$t('نوع تغییر')">
            <USelect
              v-model="direction"
              :items="directionItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <TheFormInput
            v-model="percent"
            :label="$t('درصد')"
            dir="ltr"
            inputmode="decimal"
            icon="i-tabler-percentage"
            placeholder="10"
            :error="percentError"
          />
        </div>

      </div>
    </template>
    <template #footer>
      <div class="flex items-center gap-2 w-full justify-end">
        <UButton
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          :disabled="running"
          @click="open = false"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          color="primary"
          class="font-bold cursor-pointer"
          :loading="running"
          :disabled="running"
          @click="onSubmit"
        >
          {{ $t('اعمال تغییر') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedIds: string[]
  categories: { id: string, name: string }[]
  brands: string[]
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  applied: []
}>()

const { t } = useI18n()
const toast = useAppToast()
const { bulkAdjustListingPrices } = useSeller()

const scope = ref<'selected' | 'category' | 'brand' | 'category_brand'>('category')
const categoryId = ref('')
const brandName = ref('')
const direction = ref<'increase' | 'decrease'>('increase')
const percent = ref('')
const percentError = ref('')
const running = ref(false)

const scopeItems = computed(() => [
  {
    value: 'selected',
    label: t('محصولات انتخاب‌شده'),
    disabled: props.selectedIds.length === 0,
  },
  { value: 'category', label: t('یک دسته‌بندی') },
  { value: 'brand', label: t('یک برند') },
  { value: 'category_brand', label: t('دسته و برند') },
])

const directionItems = computed(() => [
  { value: 'increase', label: t('افزایش') },
  { value: 'decrease', label: t('کاهش') },
])

const categoryItems = computed(() =>
  props.categories.map(item => ({ value: item.id, label: item.name })),
)

const brandItems = computed(() =>
  [...props.brands].sort((a, b) => a.localeCompare(b, 'fa')).map(name => ({ value: name, label: name })),
)

watch(open, (isOpen) => {
  if (!isOpen) return
  scope.value = props.selectedIds.length ? 'selected' : 'category'
  categoryId.value = ''
  brandName.value = ''
  direction.value = 'increase'
  percent.value = ''
  percentError.value = ''
})

function parsePercent(raw: string) {
  const text = raw
    .trim()
    .replace(/,/g, '.')
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  if (!text) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : Number.NaN
}

function buildPayload(dryRun: boolean) {
  percentError.value = ''
  const value = parsePercent(percent.value)
  const max = direction.value === 'decrease' ? 99 : 500
  if (value == null || Number.isNaN(value) || value <= 0 || value > max) {
    percentError.value = direction.value === 'decrease'
      ? t('درصد کاهش باید بین ۰ و ۹۹ باشد')
      : t('درصد افزایش باید بین ۰ و ۵۰۰ باشد')
    return null
  }

  if (scope.value === 'selected' && !props.selectedIds.length) {
    toast.warning(t('ابتدا محصول را انتخاب کنید'))
    return null
  }
  if ((scope.value === 'category' || scope.value === 'category_brand') && !categoryId.value) {
    toast.warning(t('دسته‌بندی را انتخاب کنید'))
    return null
  }
  if ((scope.value === 'brand' || scope.value === 'category_brand') && !brandName.value) {
    toast.warning(t('برند را انتخاب کنید'))
    return null
  }

  return {
    direction: direction.value,
    percent: value,
    dryRun,
    ...(scope.value === 'selected' ? { ids: [...props.selectedIds] } : {}),
    ...(scope.value === 'category' || scope.value === 'category_brand'
      ? { category: categoryId.value }
      : {}),
    ...(scope.value === 'brand' || scope.value === 'category_brand'
      ? { brand: brandName.value }
      : {}),
  }
}

async function onSubmit() {
  const payload = buildPayload(false)
  if (!payload) return

  running.value = true
  try {
    const preview = await bulkAdjustListingPrices({ ...payload, dryRun: true })
    if (!preview.ok) {
      toast.error(t(preview.error || 'تغییر قیمت گروهی ناموفق بود'))
      return
    }
    if (!preview.count) {
      toast.warning(t('محصولی با این محدوده پیدا نشد'))
      return
    }

    const result = await bulkAdjustListingPrices(payload)
    if (!result.ok) {
      toast.error(t(result.error || 'تغییر قیمت گروهی ناموفق بود'))
      return
    }
    toast.success(`${result.updated.toLocaleString('fa-IR')} ${t('محصول به‌روز شد')}`)
    open.value = false
    emit('applied')
  }
  finally {
    running.value = false
  }
}
</script>
