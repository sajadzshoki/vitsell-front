<template>
  <div class="space-y-5">
    <!-- Step / category -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ $t('افزودن محصول') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('ابتدا دسته‌بندی را انتخاب کنید؛ فیلدهای مشخصات فنی بر اساس همان دسته نمایش داده می‌شوند.') }}
          </p>
        </div>
        <UBadge
          v-if="selectedCategory"
          color="primary"
          variant="subtle"
          size="md"
          class="font-medium inline-flex items-center gap-1.5"
        >
          <UIcon
            :name="selectedCategory.icon"
            class="size-4"
          />
          {{ $t(selectedCategory.name) }}
        </UBadge>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition"
          :class="form.category === category.id
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-muted bg-muted/40 text-toned hover:(border-accented bg-elevated)'"
          @click="onCategorySelect(category.id)"
        >
          <UIcon
            :name="category.icon"
            class="size-6"
          />
          <span class="text-xs font-medium leading-tight">{{ $t(category.name) }}</span>
        </button>
      </div>
      <p
        v-if="errors.category"
        class="text-[11px] text-error mt-2"
      >
        {{ $t(errors.category) }}
      </p>
    </div>

    <template v-if="form.category">
      <!-- Basic info -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('اطلاعات پایه') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.title"
            class="md:col-span-2"
            :label="$t('عنوان محصول')"
            :placeholder="$t('مثلاً گوشی موبایل سامسونگ Galaxy S25')"
            :error="errors.title"
            required
          />
          <TheFormInput
            v-model="form.shortName"
            :label="$t('نام کوتاه')"
            :placeholder="$t('نمایش در کارت و مقایسه')"
          />
          <TheFormSelect
            v-model="form.brand"
            :label="$t('برند')"
            :items="brandOptions"
            :placeholder="$t('انتخاب برند')"
            :error="errors.brand"
            required
            icon="i-tabler-building-store"
          />
          <UFormField
            class="md:col-span-2"
            :label="$t('توضیح کوتاه')"
          >
            <UTextarea
              v-model="form.shortDesc"
              :rows="2"
              autoresize
              class="w-full"
              :placeholder="$t('یک تا دو جمله برای معرفی محصول')"
            />
          </UFormField>
          <UFormField
            class="md:col-span-2"
            :label="$t('توضیحات کامل')"
          >
            <UTextarea
              v-model="form.description"
              :rows="4"
              autoresize
              class="w-full"
              :placeholder="$t('توضیحات تکمیلی محصول برای صفحه جزئیات')"
            />
          </UFormField>
        </div>
      </div>

      <!-- Pricing & stock -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h3 class="font-bold text-highlighted mb-4">
          {{ $t('قیمت و موجودی') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TheFormInput
            v-model="form.price"
            :label="$t('قیمت فروش (تومان)')"
            :placeholder="$t('مثلاً 25000000')"
            dir="ltr"
            digits-only
            :error="errors.price"
            required
            icon="i-tabler-cash"
          />
          <TheFormInput
            v-model="form.oldPrice"
            :label="$t('قیمت قبلی (اختیاری)')"
            :placeholder="$t('برای نمایش تخفیف')"
            dir="ltr"
            digits-only
            :error="errors.oldPrice"
          />
          <TheFormInput
            v-model="form.stock"
            :label="$t('موجودی انبار')"
            placeholder="0"
            dir="ltr"
            digits-only
            :error="errors.stock"
            required
            icon="i-tabler-box"
          />
        </div>
        <div
          v-if="discountPercent > 0"
          class="mt-3 text-xs text-success font-medium num"
        >
          {{ $t('تخفیف') }}: {{ discountPercent.toLocaleString('fa-IR') }}٪
        </div>
      </div>

      <!-- Dynamic category attributes -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 class="font-bold text-highlighted">
            {{ $t('مشخصات فنی') }}
            <span class="text-sm font-medium text-muted">
              ({{ $t(selectedCategory?.name || '') }})
            </span>
          </h3>
          <span class="text-[11px] text-muted">
            {{ attributeFields.length.toLocaleString('fa-IR') }} {{ $t('فیلد') }}
          </span>
        </div>

        <div
          v-for="group in attributeGroups"
          :key="group.title"
          class="mb-5 last:mb-0"
        >
          <h4 class="text-sm font-bold text-toned mb-3 flex items-center gap-2">
            <span class="size-1.5 rounded-full bg-primary shrink-0" />
            {{ $t(group.title) }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template
              v-for="field in group.fields"
              :key="field.key"
            >
              <TheFormSelect
                v-if="field.type === 'select'"
                v-model="form.attrs[field.key]"
                :label="$t(field.label)"
                :items="field.options || []"
                :placeholder="$t(field.placeholder || 'انتخاب کنید')"
                :required="field.required"
                :error="errors[`attr:${field.key}`]"
              />
              <TheFormInput
                v-else
                v-model="form.attrs[field.key]"
                :label="$t(field.label)"
                :placeholder="$t(field.placeholder || '')"
                :required="field.required"
                :error="errors[`attr:${field.key}`]"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Colors -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h3 class="font-bold text-highlighted mb-2">
          {{ $t('رنگ‌های محصول') }}
        </h3>
        <p class="text-xs text-muted mb-4">
          {{ $t('در صورت وجود تنوع رنگی، گزینه‌های قابل فروش را انتخاب کنید.') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in sellerProductColorPresets"
            :key="color.hex"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition"
            :class="isColorSelected(color)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted text-toned hover:border-accented'"
            @click="toggleColor(color)"
          >
            <span
              class="size-4 rounded-full border border-default shrink-0"
              :style="{ backgroundColor: color.hex }"
            />
            {{ $t(color.name) }}
          </button>
        </div>
      </div>

      <!-- Media & extras -->
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <h3 class="font-bold text-highlighted mb-1">
          {{ $t('تصویر و تنظیمات نمایش') }}
        </h3>
        <p class="text-xs text-muted mb-4 leading-6">
          {{ $t('تصاویر تم روشن/تاریک برای تصویر اصلی هستند؛ گالری محصول را بدون محدودیت تعداد اضافه کنید.') }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TheSellerImageUpload
            v-model="form.image"
            :label="$t('تصویر تم روشن')"
            :badge="$t('لایت')"
            badge-color="warning"
            icon="i-tabler-sun"
            theme-preview="light"
            :alt="form.title || $t('پیش‌نمایش لایت')"
            :error="errors.image"
            :hint="$t('در حالت تم روشن نمایش داده می‌شود')"
            @error="form.image = ''"
          />
          <TheSellerImageUpload
            v-model="form.imageDark"
            :label="$t('تصویر تم تاریک')"
            :badge="$t('دارک')"
            badge-color="neutral"
            icon="i-tabler-moon"
            theme-preview="dark"
            :alt="form.title || $t('پیش‌نمایش دارک')"
            :error="errors.imageDark"
            :hint="$t('در حالت تم تاریک نمایش داده می‌شود؛ اگر خالی باشد همان تصویر لایت استفاده می‌شود')"
            @error="form.imageDark = ''"
          />
        </div>

        <TheSellerGalleryUpload
          v-model="form.gallery"
          :label="$t('گالری تصاویر')"
          class="mb-4"
          :hint="$t('می‌توانید هر تعداد تصویر اضافه کنید. اولین تصویر در صورت نبود تصویر اصلی استفاده می‌شود.')"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField :label="$t('برچسب ویژه')">
            <USelect
              v-model="form.badge"
              :items="badgeItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-end">
            <UCheckbox
              v-model="form.fastDelivery"
              :label="$t('ارسال سریع')"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between gap-3 flex-wrap pb-2">
        <UButton
          to="/seller/products"
          color="neutral"
          variant="outline"
          size="lg"
        >
          {{ $t('انصراف') }}
        </UButton>
        <div class="flex items-center gap-2 flex-wrap">
          <UButton
            color="neutral"
            variant="soft"
            size="lg"
            :loading="submitting"
            @click="onSubmit(false)"
          >
            {{ $t('ذخیره پیش‌نویس') }}
          </UButton>
          <UButton
            color="primary"
            size="lg"
            class="font-bold"
            :loading="submitting"
            @click="onSubmit(true)"
          >
            {{ $t('ثبت و ارسال برای تأیید') }}
          </UButton>
        </div>
      </div>
    </template>

    <div
      v-else
      class="bg-default max-lg:(bg-transparent border-0) border border-dashed border-muted rounded-2xl p-10 text-center"
    >
      <UIcon
        name="i-tabler-category"
        class="size-14 text-dimmed mx-auto mb-3"
      />
      <p class="text-sm text-muted">
        {{ $t('برای ادامه، یک دسته‌بندی انتخاب کنید') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  buildSellerProductFromForm,
  emptySellerProductForm,
  getBrandOptions,
  getCategoryAttributeFields,
  getSellerCategoryOptions,
  parsePriceInput,
  sellerProductBadges,
  sellerProductColorPresets,
  validateSellerProductForm,
  type SellerProductField,
  type SellerProductFormValues,
} from '~/data/seller-product-form'
import type { ProductColor } from '~/data/products'

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { addListingProduct } = useSeller()

const categoryOptions = getSellerCategoryOptions()
const form = ref<SellerProductFormValues>(emptySellerProductForm())
const errors = ref<Record<string, string>>({})
const submitting = ref(false)

const selectedCategory = computed(() =>
  categoryOptions.find(item => item.id === form.value.category),
)

const brandOptions = computed(() => getBrandOptions(form.value.category))

const attributeFields = computed(() =>
  getCategoryAttributeFields(form.value.category),
)

const attributeGroups = computed(() => {
  const map = new Map<string, SellerProductField[]>()
  for (const field of attributeFields.value) {
    const list = map.get(field.group) ?? []
    list.push(field)
    map.set(field.group, list)
  }
  return [...map.entries()].map(([title, fields]) => ({ title, fields }))
})

const badgeItems = computed(() =>
  sellerProductBadges.map(badge => ({
    label: badge ? t(badge) : t('بدون برچسب'),
    value: badge,
  })),
)

const discountPercent = computed(() => {
  const price = parsePriceInput(form.value.price)
  const oldPrice = parsePriceInput(form.value.oldPrice)
  if (!price || !oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
})

function resetAttrsForCategory(categoryId: string) {
  const next: Record<string, string> = {}
  for (const field of getCategoryAttributeFields(categoryId)) {
    next[field.key] = form.value.attrs[field.key] ?? ''
  }
  form.value.attrs = next
}

function onCategorySelect(categoryId: string) {
  if (form.value.category === categoryId) return
  form.value.category = categoryId
  form.value.brand = ''
  form.value.colors = []
  resetAttrsForCategory(categoryId)
  errors.value = {}
}

function isColorSelected(color: ProductColor) {
  return form.value.colors.some(item => item.hex === color.hex)
}

function toggleColor(color: ProductColor) {
  if (isColorSelected(color)) {
    form.value.colors = form.value.colors.filter(item => item.hex !== color.hex)
    return
  }
  form.value.colors = [...form.value.colors, color]
}

async function onSubmit(sendForReview: boolean) {
  errors.value = validateSellerProductForm(form.value, attributeFields.value)
  if (Object.keys(errors.value).length) {
    toast.error(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  const product = buildSellerProductFromForm(form.value)
  if (!product) {
    toast.error(t('اطلاعات محصول معتبر نیست'))
    return
  }

  submitting.value = true
  try {
    const stock = Number.parseInt(form.value.stock.replace(/[^\d]/g, '') || '0', 10)
    const status = sendForReview
      ? 'pending' as const
      : (stock > 0 ? 'inactive' as const : 'out_of_stock' as const)
    const productId = await addListingProduct(product, stock, status)
    if (!productId) {
      toast.error(t('ثبت محصول ناموفق بود'))
      return
    }

    toast.success(
      sendForReview
        ? t('محصول برای تأیید ثبت شد')
        : t('پیش‌نویس محصول ذخیره شد'),
    )
    await router.push('/seller/products')
  }
  finally {
    submitting.value = false
  }
}
</script>
