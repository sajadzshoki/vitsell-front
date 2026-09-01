<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/deals"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به شگفت‌انگیزها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش شگفت‌انگیز') : $t('افزودن شگفت‌انگیز') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('محصول را انتخاب کنید، درصد تخفیف و بازه زمانی را مشخص کنید و فعال نمایید.') }}
          </p>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <UBadge
            :color="scheduleMeta.color"
            variant="subtle"
            size="md"
            class="font-medium"
          >
            {{ $t(scheduleMeta.label) }}
          </UBadge>
          <UBadge
            v-if="countdownLabel"
            color="warning"
            variant="subtle"
            size="md"
            class="font-medium"
          >
            {{ countdownLabel }}
          </UBadge>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً deal-iphone-16')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />

        <TheFormInput
          v-model="form.name"
          :label="$t('نام نمایشی')"
          :placeholder="$t('مثلاً شگفت‌انگیز آیفون')"
          icon="i-tabler-tag"
        />

        <UFormField
          class="md:col-span-2"
          :label="$t('محصول')"
          required
          :error="errors.productId"
        >
          <USelectMenu
            v-model="form.productId"
            :items="productOptions"
            value-key="value"
            :search-input="{ placeholder: $t('جستجوی محصول...') }"
            :placeholder="$t('انتخاب محصول')"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-model="form.variantId"
          :label="$t('شناسه واریانت')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          icon="i-tabler-versions"
        />

        <TheFormInput
          v-model="form.discountPercent"
          :label="$t('درصد تخفیف')"
          placeholder="20"
          dir="ltr"
          digits-only
          maxlength="2"
          :error="errors.discountPercent"
          required
          icon="i-tabler-percentage"
        />

        <TheFormInput
          v-model="form.specialPrice"
          :label="$t('قیمت ویژه (تومان)')"
          :placeholder="$t('اختیاری — خالی = از درصد')"
          dir="ltr"
          digits-only
          :error="errors.specialPrice"
          icon="i-tabler-cash"
        />

        <TheFormInput
          v-model="form.maxQuantity"
          :label="$t('سقف موجودی شگفت‌انگیز')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          digits-only
          icon="i-tabler-box"
        />

        <TheFormInput
          v-model="form.perCustomerLimit"
          :label="$t('سقف خرید هر مشتری')"
          :placeholder="$t('اختیاری')"
          dir="ltr"
          digits-only
          icon="i-tabler-user"
        />

        <TheFormInput
          v-model.number="form.priority"
          type="number"
          :label="$t('اولویت')"
          dir="ltr"
          icon="i-tabler-list-numbers"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />

        <div class="flex items-end pb-1">
          <UCheckbox
            v-model="form.active"
            :label="$t('فعال')"
          />
        </div>

        <TheFormInput
          v-model="form.startsAt"
          :label="$t('شروع')"
          type="datetime-local"
          dir="ltr"
          :error="errors.startsAt"
          required
          icon="i-tabler-calendar-event"
        />
        <TheFormInput
          v-model="form.endsAt"
          :label="$t('پایان')"
          type="datetime-local"
          dir="ltr"
          :error="errors.endsAt"
          required
          icon="i-tabler-calendar-due"
        />
      </div>

      <div
        v-if="selectedProduct"
        class="mt-5 rounded-2xl border border-muted bg-muted/40 p-4 flex items-start gap-3"
      >
        <img
          v-if="selectedProduct.image"
          :src="selectedProduct.image"
          :alt="selectedProduct.title"
          class="size-16 rounded-xl object-cover bg-default shrink-0"
        >
        <div
          v-else
          class="size-16 rounded-xl bg-default grid place-items-center shrink-0"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-7 opacity-60"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-highlighted line-clamp-2">
            {{ selectedProduct.title }}
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span class="text-muted">
              {{ $t('قیمت فعلی') }}:
              <span class="font-bold num text-highlighted">
                {{ formatPrice(selectedProduct.price) }}
              </span>
              {{ $t('تومان') }}
            </span>
            <span
              v-if="previewDealPrice != null"
              class="text-error font-medium"
            >
              {{ $t('قیمت شگفت‌انگیز') }}:
              <span class="font-bold num">
                {{ formatPrice(previewDealPrice) }}
              </span>
              {{ $t('تومان') }}
              <span class="num">({{ clampPercent(Number(form.discountPercent) || 0).toLocaleString('fa-IR') }}٪)</span>
            </span>
          </div>
          <div
            v-if="countdownLabel"
            class="mt-2 text-xs text-warning font-medium"
          >
            {{ $t('زمان باقی‌مانده') }}: {{ countdownLabel }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت شگفت‌انگیز') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
        to="/seller/deals"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import {
  amazingDealIdPattern,
  clampPercent,
  dealPriceFrom,
  emptyAmazingDealForm,
  toAmazingDealForm,
  type SellerAmazingDeal,
  type SellerAmazingDealFormValues,
} from '~/data/seller-deals'
import {
  deriveScheduleStatus,
  formatCountdown,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'

type ProductOption = {
  label: string
  value: string
}

const props = defineProps<{
  initial?: SellerAmazingDeal | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { createDeal, updateDeal } = useSellerDeals()
const { fetchProducts, getCachedProduct, remember } = useProducts()
const { resolveProduct, fetchSeller } = useSeller()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerAmazingDealFormValues>(
  props.initial ? toAmazingDealForm(props.initial) : emptyAmazingDealForm(),
)
const errors = ref<Partial<Record<'id' | 'productId' | 'discountPercent' | 'specialPrice' | 'startsAt' | 'endsAt', string>>>({})
const catalog = ref<Product[]>([])
const nowTick = ref(Date.now())

let tickTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 60_000)
})
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const scheduleMeta = computed(() => {
  const status = deriveScheduleStatus({
    startsAt: form.value.startsAt || null,
    endsAt: form.value.endsAt || null,
    active: form.value.active,
  })
  return sellerScheduleStatusMeta[status]
})

const countdownLabel = computed(() => {
  void nowTick.value
  if (!form.value.endsAt.trim()) return ''
  const endIso = new Date(form.value.endsAt).toISOString()
  const status = deriveScheduleStatus({
    startsAt: form.value.startsAt || null,
    endsAt: form.value.endsAt || null,
    active: form.value.active,
  })
  if (status !== 'active' && status !== 'scheduled') return ''
  return formatCountdown(endIso)
})

const productOptions = computed<ProductOption[]>(() =>
  catalog.value.map(p => ({
    label: p.title,
    value: p.id,
  })),
)

const selectedProduct = computed(() => {
  const id = form.value.productId
  if (!id) return null
  return getCachedProduct(id) || catalog.value.find(p => p.id === id) || null
})

const previewDealPrice = computed(() => {
  if (!selectedProduct.value) return null
  const special = form.value.specialPrice.trim()
  if (special) {
    const n = Number(special)
    if (Number.isFinite(n) && n >= 0) return Math.round(n)
  }
  const percent = Number(form.value.discountPercent)
  if (!Number.isFinite(percent) || percent <= 0) return null
  return dealPriceFrom(selectedProduct.value.price, percent)
})

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toAmazingDealForm(value) : emptyAmazingDealForm()
    errors.value = {}
  },
)

await Promise.all([
  fetchSeller(),
  loadCatalog(),
])

async function loadCatalog() {
  const { result } = await fetchProducts({ pageSize: 100, sort: 'newest' })
  catalog.value = result.items
  if (props.initial?.productId && !catalog.value.some(p => p.id === props.initial!.productId)) {
    const product = resolveProduct(props.initial.productId)
    remember([product])
    catalog.value = [product, ...catalog.value]
  }
}

function formatPrice(value: number) {
  return value.toLocaleString('fa-IR')
}

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  const productId = form.value.productId.trim()
  const percent = Number(form.value.discountPercent)
  const startsAt = form.value.startsAt.trim()
  const endsAt = form.value.endsAt.trim()
  const specialRaw = form.value.specialPrice.trim()

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!amazingDealIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!productId) next.productId = t('انتخاب محصول الزامی است')
  if (!Number.isFinite(percent) || percent < 1 || percent > 99) {
    next.discountPercent = t('تخفیف باید بین ۱ تا ۹۹ باشد')
  }
  if (specialRaw) {
    const special = Number(specialRaw)
    if (!Number.isFinite(special) || special < 0) {
      next.specialPrice = t('قیمت ویژه نامعتبر است')
    }
  }
  if (!startsAt) next.startsAt = t('زمان شروع الزامی است')
  if (!endsAt) next.endsAt = t('زمان پایان الزامی است')
  if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    next.endsAt = t('زمان پایان باید بعد از شروع باشد')
  }

  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  saving.value = true
  try {
    const result = isEdit.value
      ? await updateDeal(props.initial!.id, form.value)
      : await createDeal(form.value)

    if (!result.ok) {
      toast.error(result.error)
      if (String(result.error).includes('تکراری')) {
        errors.value = { ...errors.value, id: result.error }
      }
      return
    }

    toast.success(isEdit.value ? t('شگفت‌انگیز به‌روز شد') : t('شگفت‌انگیز اضافه شد'))
    await navigateTo('/seller/deals')
  }
  finally {
    saving.value = false
  }
}
</script>
