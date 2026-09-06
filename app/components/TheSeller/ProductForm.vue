<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش محصول') : $t('افزودن محصول') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ isEdit
              ? $t('اطلاعات محصول، واریانت، موجودی و سئو را مدیریت کنید.')
              : $t('ابتدا دسته‌بندی را انتخاب کنید؛ سپس بخش‌های فرم را تکمیل نمایید.') }}
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

      <div
        v-if="categoriesPending && !categoryOptions.length"
        class="flex items-center justify-center gap-2 py-8 text-sm text-muted"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-5 animate-spin"
        />
        {{ $t('در حال بارگذاری دسته‌بندی‌ها...') }}
      </div>
      <div
        v-else-if="!categoryOptions.length"
        class="rounded-2xl border border-dashed border-muted p-6 text-center space-y-3"
      >
        <p class="text-sm text-muted">
          {{ $t('دسته‌بندی فعالی یافت نشد. ابتدا از بخش دسته‌بندی‌ها یک دسته بسازید.') }}
        </p>
        <UButton
          to="/seller/categories/new"
          color="primary"
          variant="soft"
          size="sm"
          icon="i-tabler-plus"
          class="cursor-pointer"
        >
          {{ $t('افزودن دسته‌بندی') }}
        </UButton>
      </div>
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
      >
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition cursor-pointer"
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
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        variant="pill"
        color="primary"
        size="sm"
        class="w-full"
        :ui="{
          list: 'bg-muted/60 p-1 rounded-xl w-full overflow-x-auto',
          trigger: 'shrink-0 font-medium',
          content: 'pt-4',
        }"
      >
        <template #basic>
          <div class="space-y-4">
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
              <TheFormInput
                v-model="commerce.slug"
                :label="$t('اسلاگ')"
                dir="ltr"
                icon="i-tabler-link"
                :placeholder="$t('product-slug')"
                :help="$t('به‌صورت خودکار از عنوان ساخته می‌شود؛ قابل ویرایش')"
                @update:model-value="onSlugManualEdit"
              />
              <TheFormSelect
                v-model="form.brand"
                :label="$t('برند')"
                :items="brandOptions"
                :placeholder="$t('انتخاب برند (اختیاری)')"
                :error="errors.brand"
                icon="i-tabler-building-store"
              />
              <UFormField
                :label="$t('برچسب‌ها')"
                :help="$t('برچسب موجود را انتخاب کنید یا نام جدید بنویسید')"
              >
                <div class="space-y-2">
                  <USelectMenu
                    v-model="commerce.tags"
                    multiple
                    create-item
                    :items="tagOptions"
                    value-key="value"
                    :placeholder="$t('انتخاب برچسب')"
                    class="w-full"
                    @create="onCreateTag"
                  />
                  <NuxtLink
                    to="/seller/products/tags"
                    class="text-xs text-primary cursor-pointer inline-flex items-center gap-1"
                  >
                    <UIcon
                      name="i-tabler-tags"
                      class="size-3.5"
                    />
                    {{ $t('مدیریت برچسب‌ها') }}
                  </NuxtLink>
                </div>
              </UFormField>
              <div class="flex items-end gap-4 flex-wrap md:col-span-2">
                <UCheckbox
                  v-model="commerce.featured"
                  :label="$t('محصول ویژه')"
                />
                <UCheckbox
                  v-model="commerce.published"
                  :label="$t('منتشر شده')"
                />
                <UCheckbox
                  v-model="form.fastDelivery"
                  :label="$t('ارسال سریع')"
                />
              </div>
              <UFormField
                class="md:col-span-2"
                :label="$t('توضیح کوتاه')"
                :help="$t('یک تا دو جمله برای معرفی محصول در کارت و بالای مشخصات')"
              >
                <TheTextEditor
                  v-model="form.shortDesc"
                  variant="simple"
                  :placeholder="$t('یک تا دو جمله برای معرفی محصول')"
                />
              </UFormField>
              <UFormField
                class="md:col-span-2"
                :label="$t('توضیحات کامل')"
                :help="$t('از تیتر، فهرست و لینک برای صفحه جزئیات استفاده کنید')"
              >
                <TheTextEditor
                  v-model="form.description"
                  variant="full"
                  :placeholder="$t('توضیحات تکمیلی محصول برای صفحه جزئیات')"
                />
              </UFormField>
            </div>
          </div>
        </template>

        <template #pricing>
          <div class="space-y-4">
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
                :label="$t('قیمت قبلی / مقایسه‌ای')"
                :placeholder="$t('برای نمایش تخفیف')"
                dir="ltr"
                digits-only
                :error="errors.oldPrice"
              />
              <TheFormInput
                v-model="form.stock"
                :label="$t('موجودی پایه')"
                placeholder="0"
                dir="ltr"
                digits-only
                :error="errors.stock"
                icon="i-tabler-box"
                :help="commerce.variants.length
                  ? $t('با واریانت، موجودی هر ترکیب جداست')
                  : $t('اختیاری — با وارد کردن موجودی، محصول موجود می‌شود')"
              />
              <TheFormInput
                v-model="commerce.sku"
                :label="$t('SKU')"
                dir="ltr"
              />
              <TheFormInput
                v-model="commerce.barcode"
                :label="$t('بارکد')"
                dir="ltr"
              />
              <TheFormInput
                v-model="commerce.weight"
                :label="$t('وزن')"
                dir="ltr"
                :placeholder="$t('مثلاً 180g')"
              />
              <TheFormInput
                v-model.number="commerce.lowStockThreshold"
                type="number"
                :label="$t('آستانه کم‌موجودی')"
                dir="ltr"
              />
              <UFormField :label="$t('انبار پیش‌فرض')">
                <USelect
                  v-model="commerce.warehouseId"
                  :items="warehouseItems"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('برچسب ویژه')">
                <USelect
                  v-model="form.badge"
                  :items="badgeItems"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div
              v-if="discountPercent > 0"
              class="text-xs text-success font-medium num"
            >
              {{ $t('تخفیف') }}: {{ discountPercent.toLocaleString('fa-IR') }}٪
            </div>
          </div>
        </template>

        <template #specs>
          <div class="space-y-5">
            <div
              v-for="group in attributeGroups"
              :key="group.title"
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

            <div>
              <h4 class="text-sm font-bold text-toned mb-2">
                {{ $t('رنگ‌های نمایشی (میراث)') }}
              </h4>
              <p class="text-xs text-muted mb-3">
                {{ $t('برای واریانت واقعی از تب واریانت استفاده کنید. این بخش برای سازگاری با دادهٔ فعلی است.') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in sellerProductColorPresets"
                  :key="color.hex"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition cursor-pointer"
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
          </div>
        </template>

        <template #variants>
          <TheSellerProductVariantsEditor
            v-model:axes="commerce.variantAxes"
            v-model:variants="commerce.variants"
            :category-id="form.category"
            :base-price="form.price"
            :base-stock="form.stock"
          />
        </template>

        <template #media>
          <div class="space-y-4">
            <p class="text-xs text-muted leading-6">
              {{ $t('آپلود مستقیم یا انتخاب از کتابخانه رسانه (/seller/media).') }}
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TheSellerImageUpload
                v-model="form.image"
                :label="$t('تصویر اصلی (تم روشن)')"
                :badge="$t('لایت')"
                badge-color="warning"
                icon="i-tabler-sun"
                theme-preview="light"
                :alt="form.title || $t('پیش‌نمایش لایت')"
                :error="errors.image"
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
                @error="form.imageDark = ''"
              />
            </div>
            <TheSellerGalleryUpload
              v-model="form.gallery"
              :label="$t('گالری تصاویر')"
              :hint="$t('ترتیب با جابه‌جایی در آپلودر حفظ می‌شود')"
            />
          </div>
        </template>

        <template #seo>
          <TheSellerSeoFields
            v-model="commerce.seo"
            :title="$t('سئوی محصول')"
            :preview-title="form.title"
            :preview-description="seoPreviewDescription"
            :preview-url="commerce.seo.canonicalUrl || (commerce.slug ? `/product/${commerce.slug}` : '')"
          />
        </template>
      </UTabs>

      <div class="flex items-center justify-between gap-3 flex-wrap pb-2 pt-2">
        <UButton
          v-if="isEdit"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="emit('cancel')"
        >
          {{ $t('انصراف') }}
        </UButton>
        <UButton
          v-else
          to="/seller/products"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
        >
          {{ $t('انصراف') }}
        </UButton>
        <div class="flex items-center gap-2 flex-wrap">
          <template v-if="isEdit">
            <UButton
              color="primary"
              size="lg"
              class="font-bold cursor-pointer"
              :loading="submitting"
              :disabled="!can('products.update')"
              @click="onSubmit(true)"
            >
              {{ $t('ذخیره تغییرات') }}
            </UButton>
          </template>
          <template v-else>
            <UButton
              color="neutral"
              variant="soft"
              size="lg"
              class="cursor-pointer"
              :loading="submitting"
              :disabled="!can('products.create')"
              @click="onSubmit(false)"
            >
              {{ $t('ذخیره پیش‌نویس') }}
            </UButton>
            <UButton
              color="primary"
              size="lg"
              class="font-bold cursor-pointer"
              :loading="submitting"
              :disabled="!can('products.create')"
              @click="onSubmit(true)"
            >
              {{ $t('ثبت و ارسال برای تأیید') }}
            </UButton>
          </template>
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
  normalizeProductSlug,
  parsePriceInput,
  productToSellerForm,
  sellerCategoriesToFormOptions,
  sellerProductBadges,
  SELLER_BADGE_NONE,
  sellerProductColorPresets,
  slugifyProductTitle,
  validateSellerProductForm,
  type SellerProductField,
  type SellerProductFormValues,
} from '~/data/seller-product-form'
import { emptyProductCommerce, type SellerProductCommerce } from '~/data/seller-product-variants'
import { htmlToPlainText } from '~/data/seo'
import type { ProductColor } from '~/data/products'

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  productId?: string
}>(), {
  mode: 'create',
})

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const {
  addListingProduct,
  updateListingProduct,
  getListing,
  resolveProduct,
} = useSeller()
const { pushChange } = useSellerProductPriceHistory()
const { can } = useSellerPermissions()
const { getCommerce, saveCommerce } = useSellerProductCommerce()
const { brands, ensureLoaded: ensureBrands } = useSellerBrands()
const { warehouses, ensureWarehouses } = useSellerInventory()
const {
  tags: productTags,
  ensureLoaded: ensureProductTags,
  ensureTagByName,
  bumpUsage,
} = useSellerProductTags()
const {
  categories,
  pending: categoriesPending,
  ensureLoaded: ensureCategories,
  getById: getSellerCategory,
} = useSellerCategories()

ensureBrands()
ensureWarehouses()
ensureProductTags()
void ensureCategories()

const isEdit = computed(() => props.mode === 'edit' && Boolean(props.productId))
const form = ref<SellerProductFormValues>(emptySellerProductForm())
const commerce = ref<SellerProductCommerce>(emptyProductCommerce())
const slugManual = ref(false)
const categoryOptions = computed(() =>
  sellerCategoriesToFormOptions(categories.value, {
    includeInactiveIds: form.value.category ? [form.value.category] : [],
  }),
)
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const activeTab = ref('basic')
const savedSnapshot = ref('')

const isDirty = computed(() =>
  JSON.stringify({ form: form.value, commerce: commerce.value }) !== savedSnapshot.value,
)
const seoPreviewDescription = computed(() => htmlToPlainText(form.value.shortDesc))
const { allowNextNavigation } = useSellerUnsavedGuard(isDirty)

function captureSnapshot() {
  savedSnapshot.value = JSON.stringify({ form: form.value, commerce: commerce.value })
}

const tabItems = computed(() => [
  { label: t('اطلاعات پایه'), value: 'basic', slot: 'basic' as const, icon: 'i-tabler-info-circle' },
  { label: t('قیمت و موجودی'), value: 'pricing', slot: 'pricing' as const, icon: 'i-tabler-cash' },
  { label: t('مشخصات'), value: 'specs', slot: 'specs' as const, icon: 'i-tabler-list-details' },
  { label: t('واریانت'), value: 'variants', slot: 'variants' as const, icon: 'i-tabler-versions' },
  { label: t('رسانه'), value: 'media', slot: 'media' as const, icon: 'i-tabler-photo' },
  { label: t('سئو'), value: 'seo', slot: 'seo' as const, icon: 'i-tabler-world-search' },
])

function loadCommerce(productId: string) {
  commerce.value = { ...getCommerce(productId), seo: { ...getCommerce(productId).seo } }
}

if (isEdit.value && props.productId) {
  const listing = getListing(props.productId)
  const product = resolveProduct(props.productId)
  form.value = productToSellerForm(product, listing?.stock ?? 0)
  loadCommerce(props.productId)
  slugManual.value = Boolean(commerce.value.slug?.trim())
  captureSnapshot()
}
else {
  captureSnapshot()
}

watch(
  () => [props.mode, props.productId, getListing(props.productId || '')?.stock, resolveProduct(props.productId || '').title] as const,
  () => {
    if (props.mode === 'edit' && props.productId) {
      const listing = getListing(props.productId)
      const product = resolveProduct(props.productId)
      form.value = productToSellerForm(product, listing?.stock ?? 0)
      loadCommerce(props.productId)
      slugManual.value = Boolean(commerce.value.slug?.trim())
      errors.value = {}
    }
  },
)

watch(
  () => form.value.title,
  (title) => {
    if (slugManual.value) return
    commerce.value.slug = title.trim() ? slugifyProductTitle(title) : ''
  },
)

function onSlugManualEdit() {
  slugManual.value = true
}

const tagOptions = computed(() => {
  ensureProductTags()
  const names = new Set([
    ...productTags.value.map(t => t.name),
    ...commerce.value.tags,
  ])
  return [...names].map(value => ({ label: value, value }))
})

function onCreateTag(item: string) {
  const tag = ensureTagByName(item)
  if (!tag) return
  if (!commerce.value.tags.includes(tag.name)) {
    commerce.value.tags = [...commerce.value.tags, tag.name]
  }
}

const selectedCategory = computed(() =>
  categoryOptions.value.find(item => item.id === form.value.category),
)

const brandOptions = computed(() => {
  const sellerCat = getSellerCategory(form.value.category)
  const brandSub = sellerCat?.subs.find(sub =>
    sub.name.includes('برند') || sub.name === 'برندها',
  )
  const fromCategory = brandSub?.items.length
    ? brandSub.items
    : getBrandOptions(form.value.category)
  const fromStore = brands.value.filter(b => b.status === 'active').map(b => b.name)
  return [...new Set([...fromStore, ...fromCategory])]
})

const warehouseItems = computed(() =>
  warehouses.value.map(w => ({ value: w.id, label: w.name })),
)

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
    label: badge === SELLER_BADGE_NONE ? t('بدون برچسب') : t(badge),
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
  activeTab.value = 'basic'
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

function persistCommerce(productId: string) {
  const slug = normalizeProductSlug(commerce.value.slug) || productId
  commerce.value.slug = slug
  saveCommerce(productId, {
    ...commerce.value,
    productId,
    slug,
    published: commerce.value.published,
  })
}

function listingExtras() {
  return {
    featured: commerce.value.featured,
    published: commerce.value.published,
    hasVariants: commerce.value.variants.length > 0,
    sku: commerce.value.sku.trim() || undefined,
    lowStockThreshold: Number(commerce.value.lowStockThreshold) || 5,
  }
}

function withCategoryLabel<T extends { categoryLabel: string, category: string }>(product: T): T {
  const label = selectedCategory.value?.name
    || getSellerCategory(product.category)?.name
    || product.categoryLabel
  return { ...product, categoryLabel: label }
}

async function onSubmit(sendForReview: boolean) {
  commerce.value.slug = normalizeProductSlug(commerce.value.slug || form.value.title)
  errors.value = validateSellerProductForm(form.value, attributeFields.value)
  if (Object.keys(errors.value).length) {
    toast.error(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    activeTab.value = errors.value.category || errors.value.title
      ? 'basic'
      : (errors.value.price || errors.value.stock ? 'pricing' : 'basic')
    return
  }

  submitting.value = true
  try {
    const variantStock = commerce.value.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    const stock = commerce.value.variants.length
      ? variantStock
      : Number.parseInt(form.value.stock.replace(/[^\d]/g, '') || '0', 10)

    const previousTags = isEdit.value && props.productId
      ? [...(getCommerce(props.productId).tags || [])]
      : []

    if (isEdit.value && props.productId) {
      const previous = resolveProduct(props.productId)
      const built = buildSellerProductFromForm(form.value, {
        id: props.productId,
        base: previous,
      })
      if (!built) {
        toast.error(t('اطلاعات محصول معتبر نیست'))
        return
      }
      const product = withCategoryLabel(built)
      const listing = getListing(props.productId)
      const ok = await updateListingProduct(
        props.productId,
        product,
        stock,
        listing?.status,
        listingExtras(),
      )
      if (!ok) {
        toast.error(t('ذخیره محصول ناموفق بود'))
        return
      }
      persistCommerce(props.productId)
      bumpUsage(previousTags, -1)
      bumpUsage(commerce.value.tags, 1)
      if (previous.price !== product.price || (previous.oldPrice ?? null) !== (product.oldPrice ?? null)) {
        pushChange(
          props.productId,
          product.price,
          product.oldPrice ?? null,
          t('ویرایش اطلاعات محصول'),
        )
      }
      toast.success(t('تغییرات محصول ذخیره شد'))
      emit('saved')
      return
    }

    const built = buildSellerProductFromForm(form.value)
    if (!built) {
      toast.error(t('اطلاعات محصول معتبر نیست'))
      return
    }
    const product = withCategoryLabel(built)

    // پیش‌نویس = unpublished؛ ارسال برای تأیید = published
    commerce.value.published = sendForReview

    const status = sendForReview
      ? 'pending' as const
      : (stock > 0 ? 'inactive' as const : 'out_of_stock' as const)
    const productId = await addListingProduct(product, stock, status, listingExtras())
    if (!productId) {
      toast.error(t('ثبت محصول ناموفق بود'))
      return
    }

    commerce.value.slug = normalizeProductSlug(commerce.value.slug) || productId
    persistCommerce(productId)
    bumpUsage(commerce.value.tags, 1)

    toast.success(
      sendForReview
        ? t('محصول برای تأیید ثبت شد')
        : t('پیش‌نویس محصول ذخیره شد'),
    )
    allowNextNavigation()
    captureSnapshot()
    await router.push('/seller/products')
  }
  finally {
    submitting.value = false
  }
}
</script>
