<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/deals"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
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
        <UBadge
          :color="form.active ? 'success' : 'neutral'"
          variant="subtle"
          size="md"
          class="font-medium"
        >
          {{ form.active ? $t('فعال') : $t('غیرفعال') }}
        </UBadge>
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

        <UFormField
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
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold"
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
const errors = ref<Partial<Record<'id' | 'productId' | 'discountPercent' | 'startsAt' | 'endsAt', string>>>({})
const catalog = ref<Product[]>([])

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

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!amazingDealIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!productId) next.productId = t('انتخاب محصول الزامی است')
  if (!Number.isFinite(percent) || percent < 1 || percent > 99) {
    next.discountPercent = t('تخفیف باید بین ۱ تا ۹۹ باشد')
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
