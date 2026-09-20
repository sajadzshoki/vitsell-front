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
          <img
            v-if="selectedCategoryImage"
            :src="selectedCategoryImage"
            alt=""
            class="size-4 rounded object-cover"
          >
          <UIcon
            v-else
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
        class="space-y-3"
      >
        <UInput
          v-model="categorySearch"
          icon="i-tabler-search"
          size="md"
          class="w-full"
          :placeholder="$t('جستجوی دسته‌بندی...')"
          :aria-label="$t('جستجوی دسته‌بندی')"
        />

        <div
          v-if="!filteredCategoryTree.length"
          class="rounded-2xl border border-dashed border-muted px-4 py-8 text-center text-sm text-muted"
        >
          {{ $t('دسته‌بندی‌ای با این جستجو پیدا نشد') }}
        </div>
        <div
          v-else
          class="rounded-2xl border border-muted bg-muted/30 p-2 max-h-72 overflow-y-auto"
        >
          <UTree
            :model-value="selectedCategoryTreeValue"
            :items="filteredCategoryTree"
            :get-key="categoryTreeGetKey"
            :expanded="categoryTreeExpanded"
            color="primary"
            size="md"
            expanded-icon="i-tabler-folder-open"
            collapsed-icon="i-tabler-folder"
            trailing-icon="i-tabler-chevron-down"
            class="w-full"
            :ui="{
              link: 'cursor-pointer rounded-xl',
              itemWithChildren: 'ms-0',
              listWithChildren: 'border-s border-muted ms-3 ps-2',
            }"
            @update:model-value="onCategoryTreeModel"
            @update:expanded="onCategoryTreeExpanded"
          >
            <template #item-leading="{ item }">
              <span class="size-5 shrink-0 grid place-items-center overflow-hidden rounded-md me-1.5">
                <img
                  v-if="(item as SellerCategoryPickerNode).image"
                  :src="resolveMediaUrl((item as SellerCategoryPickerNode).image!) || (item as SellerCategoryPickerNode).image!"
                  alt=""
                  class="size-5 object-cover"
                >
                <UIcon
                  v-else
                  :name="(item as SellerCategoryPickerNode).icon || 'i-tabler-category'"
                  class="size-4 text-primary"
                />
              </span>
            </template>
          </UTree>
        </div>

        <p
          v-if="selectedCategoryPath"
          class="text-xs text-muted leading-6"
        >
          {{ $t('مسیر انتخاب‌شده') }}:
          <span class="text-toned font-medium">{{ selectedCategoryPath }}</span>
        </p>
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
                :placeholder="$t('مثلاً 25,000,000')"
                dir="ltr"
                thousand-sep
                :error="errors.price"
                required
                icon="i-tabler-cash"
              />
              <TheFormInput
                v-model="form.oldPrice"
                :label="$t('قیمت قبلی / مقایسه‌ای')"
                :placeholder="$t('برای نمایش تخفیف')"
                dir="ltr"
                thousand-sep
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
            <div>
              <h4 class="text-sm font-bold text-toned">
                {{ $t('مشخصات محصول') }}
              </h4>
              <p class="text-xs text-muted mt-1 leading-6">
                {{ $t('عنوان و مقدار هر مشخصه را وارد کنید؛ با کشیدن می‌توانید ترتیب نمایش در سایت را عوض کنید.') }}
              </p>
            </div>

            <div
              v-if="!form.category"
              class="rounded-2xl border border-dashed border-muted bg-muted/30 px-4 py-3 text-xs text-muted leading-6"
            >
              {{ $t('برای دیدن پیشنهادهای مشخصات، ابتدا دسته‌بندی را در تب اطلاعات پایه انتخاب کنید.') }}
            </div>

            <div
              v-else-if="unusedSpecKeySuggestions.length"
              class="rounded-2xl border border-muted bg-muted/30 p-3 space-y-2"
            >
              <p class="text-xs font-medium text-toned">
                {{ $t('پیشنهاد از محصولات همین دسته') }}
              </p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="key in unusedSpecKeySuggestions.slice(0, 16)"
                  :key="key"
                  type="button"
                  class="rounded-lg bg-default border border-muted px-2.5 py-1 text-[11px] text-toned hover:(bg-primary/10 text-primary border-primary/30) cursor-pointer"
                  @click="applySpecKeySuggestion(key)"
                >
                  {{ key }}
                </button>
              </div>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-muted">
              <table class="w-full min-w-md text-sm">
                <thead class="bg-muted/60 text-toned">
                  <tr class="text-start">
                    <th class="px-2 py-2.5 font-medium w-10" />
                    <th class="px-3 py-2.5 font-medium w-[40%]">
                      {{ $t('عنوان') }}
                    </th>
                    <th class="px-3 py-2.5 font-medium">
                      {{ $t('مقدار') }}
                    </th>
                    <th class="px-3 py-2.5 font-medium w-12" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in form.specs"
                    :key="row._id"
                    class="border-t border-muted transition-colors"
                    :class="{
                      'opacity-40': dragSpecFrom === index,
                      'bg-primary/5': dragSpecOver === index && dragSpecFrom !== index,
                    }"
                    @dragover.prevent="onSpecDragOver(index, $event)"
                    @drop.prevent="onSpecDrop(index)"
                    @dragleave="onSpecDragLeave(index)"
                  >
                    <td class="px-1 py-2 align-middle">
                      <div
                        role="button"
                        tabindex="0"
                        class="inline-flex items-center justify-center size-8 rounded-lg text-muted hover:(bg-muted text-toned) cursor-grab active:cursor-grabbing select-none"
                        draggable="true"
                        :aria-label="$t('جابه‌جایی با کشیدن')"
                        @dragstart="onSpecDragStart(index, $event)"
                        @dragend="onSpecDragEnd"
                      >
                        <UIcon
                          name="i-tabler-grip-vertical"
                          class="size-4 pointer-events-none"
                        />
                      </div>
                    </td>
                    <td class="px-3 py-2 align-top">
                      <UInput
                        v-model="row.key"
                        :placeholder="$t('مثلاً مدل')"
                        class="w-full"
                      />
                      <p
                        v-if="errors[`spec:${index}:key`]"
                        class="text-[11px] text-error mt-1"
                      >
                        {{ $t(errors[`spec:${index}:key`]) }}
                      </p>
                    </td>
                    <td class="px-3 py-2 align-top">
                      <UInput
                        v-model="row.value"
                        :placeholder="$t('مثلاً سامسونگ')"
                        class="w-full"
                      />
                      <p
                        v-if="errors[`spec:${index}:value`]"
                        class="text-[11px] text-error mt-1"
                      >
                        {{ $t(errors[`spec:${index}:value`]) }}
                      </p>
                    </td>
                    <td class="px-2 py-2 align-top">
                      <UButton
                        type="button"
                        color="error"
                        variant="ghost"
                        size="sm"
                        icon="i-tabler-trash"
                        class="cursor-pointer"
                        :disabled="form.specs.length <= 1"
                        :aria-label="$t('حذف')"
                        @click="removeSpecRow(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <UButton
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-tabler-plus"
              class="cursor-pointer w-full sm:w-auto"
              @click="addSpecRow"
            >
              {{ $t('افزودن مشخصه') }}
            </UButton>

            <div
              v-if="derivedColors.length"
              class="rounded-2xl border border-muted bg-muted/30 p-4"
            >
              <h4 class="text-sm font-bold text-toned mb-1">
                {{ $t('رنگ‌های محصول') }}
              </h4>
              <p class="text-xs text-muted mb-3 leading-6">
                {{ $t('از محور رنگ در تب واریانت خوانده می‌شود.') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="color in derivedColors"
                  :key="`${color.name}-${color.hex}`"
                  class="inline-flex items-center gap-2 rounded-xl border border-muted px-3 py-2 text-xs text-toned"
                >
                  <span
                    class="size-4 rounded-full border border-default shrink-0"
                    :style="{ backgroundColor: color.hex }"
                  />
                  {{ $t(color.name) }}
                </span>
              </div>
            </div>
            <p
              v-else
              class="text-xs text-muted leading-6"
            >
              {{ $t('برای نمایش رنگ در فروشگاه، در تب واریانت یک ویژگی رنگ اضافه کنید.') }}
            </p>
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
              v-model:primary="form.image"
              :label="$t('گالری تصاویر')"
              :hint="$t('با کشیدن یا دکمه‌ها ترتیب را عوض کنید؛ «اصلی کردن» همان تصویر اصلی محصول را تنظیم می‌کند')"
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

      <TheSellerFormActions justify="between">
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
              {{ $t('ثبت و انتشار') }}
            </UButton>
          </template>
        </div>
      </TheSellerFormActions>
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
  colorsFromVariantAxes,
  emptySellerProductForm,
  emptySpecRow,
  getBrandOptions,
  normalizeProductSlug,
  parsePriceInput,
  productToSellerForm,
  sellerCategoriesToFormOptions,
  sellerProductBadges,
  SELLER_BADGE_NONE,
  slugifyProductTitle,
  validateSellerProductForm,
  type SellerProductFormValues,
} from '~/data/seller-product-form'
import {
  buildSellerCategoryPickerTree,
  categoryAncestorIds,
  resolveCategoryIconName,
  type SellerCategoryPickerNode,
} from '~/data/seller-categories'
import { isSellerAdminIconImage } from '~/data/seller-admin-icons'
import { resolveMediaUrl } from '~/composables/fetch'
import { emptyProductCommerce, type SellerProductCommerce } from '~/data/seller-product-variants'
import { emptySeoMeta, htmlToPlainText, sanitizeSeoMeta } from '~/data/seo'

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
const {
  attributes,
  ensureLoaded: ensureAttributes,
} = useSellerAttributes()

ensureBrands()
ensureWarehouses()
ensureProductTags()
void ensureCategories()
void ensureAttributes({ force: false })

const isEdit = computed(() => props.mode === 'edit' && Boolean(props.productId))
const form = ref<SellerProductFormValues>(emptySellerProductForm())
const commerce = ref<SellerProductCommerce>(emptyProductCommerce())
const slugManual = ref(false)
const categorySpecKeys = ref<string[]>([])
const dragSpecFrom = ref<number | null>(null)
const dragSpecOver = ref<number | null>(null)
const categorySearch = ref('')
const categoryTreeExpanded = ref<string[]>([])
const categoryOptions = computed(() =>
  sellerCategoriesToFormOptions(categories.value, {
    includeInactiveIds: form.value.category ? [form.value.category] : [],
  }),
)
const filteredCategoryTree = computed(() =>
  buildSellerCategoryPickerTree(categories.value, {
    includeInactiveIds: form.value.category ? [form.value.category] : [],
    query: categorySearch.value,
  }),
)

function categoryTreeGetKey(item: SellerCategoryPickerNode) {
  return item.id
}

function onCategoryTreeExpanded(keys: string[]) {
  categoryTreeExpanded.value = keys
}

function findCategoryTreeNode(
  nodes: SellerCategoryPickerNode[],
  id: string,
): SellerCategoryPickerNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findCategoryTreeNode(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

const selectedCategoryTreeValue = computed(() => {
  const id = form.value.category
  if (!id) return undefined
  return findCategoryTreeNode(filteredCategoryTree.value, id)
    || findCategoryTreeNode(
      buildSellerCategoryPickerTree(categories.value, {
        includeInactiveIds: [id],
      }),
      id,
    )
})

function onCategoryTreeModel(value: SellerCategoryPickerNode | SellerCategoryPickerNode[] | null | undefined) {
  if (!value || Array.isArray(value)) return
  if (!value.id) return
  onCategorySelect(value.id)
}

function syncCategoryTreeExpanded(categoryId: string) {
  if (!categoryId) return
  const ancestors = categoryAncestorIds(categories.value, categoryId)
  categoryTreeExpanded.value = [...new Set([...categoryTreeExpanded.value, ...ancestors, categoryId])]
}

watch(
  () => [form.value.category, categories.value.length] as const,
  ([categoryId]) => {
    if (categoryId) syncCategoryTreeExpanded(categoryId)
  },
  { immediate: true },
)

watch(categorySearch, (q) => {
  if (!q.trim()) return
  // Expand all visible parents while searching
  const collect = (nodes: SellerCategoryPickerNode[], acc: string[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        acc.push(node.id)
        collect(node.children, acc)
      }
    }
    return acc
  }
  categoryTreeExpanded.value = collect(filteredCategoryTree.value, [])
})

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

function hydrateCommerceFromProduct(productId: string, product = resolveProduct(productId)) {
  const existing = getCommerce(productId)
  const apiSku = String(product.sku || '').trim()
  const apiBarcode = String(product.barcode || '').trim()
  const apiWeight = String(product.weight || '').trim()
  const apiThreshold = Number(product.lowStockThreshold)
  const apiAxes = Array.isArray(product.variantAxes) ? product.variantAxes : null
  const apiVariants = Array.isArray(product.variants) ? product.variants : null
  commerce.value = {
    ...existing,
    productId,
    sku: apiSku || existing.sku || '',
    barcode: apiBarcode || existing.barcode || '',
    weight: apiWeight || existing.weight || '',
    lowStockThreshold: Number.isFinite(apiThreshold) && apiThreshold >= 0
      ? apiThreshold
      : (existing.lowStockThreshold || 5),
    featured: Boolean(product.featured),
    published: product.published !== false,
    variantAxes: (apiAxes?.length ? apiAxes : existing.variantAxes)?.map(a => ({ ...a })) ?? [],
    variants: (apiVariants?.length ? apiVariants : existing.variants)?.map(v => ({ ...v })) ?? [],
    warehouseId: existing.warehouseId ?? null,
    slug: existing.slug?.trim() || productId,
    tags: Array.isArray(product.tags) && product.tags.length
      ? [...product.tags]
      : [...(existing.tags || [])],
    seo: {
      ...emptySeoMeta(),
      ...(existing.seo || {}),
      ...(product.seo || {}),
    },
  }
}

async function loadCategorySpecKeys(categoryId: string) {
  if (!categoryId) {
    categorySpecKeys.value = []
    return
  }
  const { result } = await useGet<{ items: Array<{ key: string }> }>(
    `/seller/categories/${encodeURIComponent(categoryId)}/spec-keys`,
    { headers: { 'no-error': true } },
  )
  const items = Array.isArray(result?.items) ? result.items : []
  const keys = items.map(item => String(item.key || '').trim()).filter(Boolean)
  const fromForm = form.value.specs.map(s => s.key.trim()).filter(Boolean)
  categorySpecKeys.value = [...new Set([...keys, ...fromForm])]
}

if (isEdit.value && props.productId) {
  const listing = getListing(props.productId)
  const product = resolveProduct(props.productId)
  form.value = productToSellerForm(product, listing?.stock ?? 0)
  hydrateCommerceFromProduct(props.productId, product)
  slugManual.value = Boolean(commerce.value.slug?.trim())
  void loadCategorySpecKeys(form.value.category)
  captureSnapshot()
}
else {
  captureSnapshot()
}

watch(
  () => [props.mode, props.productId, getListing(props.productId || '')?.stock, resolveProduct(props.productId || '').title] as const,
  () => {
    // Skip while saving — updateListingProduct mutates listing/product and would
    // rehydrate from a stale commerce map mid-submit.
    if (submitting.value) return
    if (props.mode === 'edit' && props.productId) {
      const listing = getListing(props.productId)
      const product = resolveProduct(props.productId)
      form.value = productToSellerForm(product, listing?.stock ?? 0)
      hydrateCommerceFromProduct(props.productId, product)
      slugManual.value = Boolean(commerce.value.slug?.trim())
      errors.value = {}
      void loadCategorySpecKeys(form.value.category)
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

watch(
  () => form.value.category,
  (categoryId) => {
    void loadCategorySpecKeys(categoryId)
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

const selectedCategory = computed(() => {
  const id = form.value.category
  if (!id) return null
  const fromOptions = categoryOptions.value.find(item => item.id === id)
  if (fromOptions) return fromOptions
  const sellerCat = getSellerCategory(id)
  if (!sellerCat) return null
  return {
    id: sellerCat.id,
    name: sellerCat.name,
    icon: resolveCategoryIconName(sellerCat.icon || 'category'),
  }
})

const selectedCategoryImage = computed(() => {
  const id = form.value.category
  if (!id) return null
  const sellerCat = getSellerCategory(id)
  if (!sellerCat) return null
  const raw = sellerCat.image
    || (isSellerAdminIconImage(sellerCat.icon) ? sellerCat.icon : '')
  if (!raw) return null
  return resolveMediaUrl(raw) || raw
})

const selectedCategoryPath = computed(() => {
  const id = form.value.category
  if (!id) return ''
  const byId = new Map(categories.value.map(c => [c.id, c]))
  const parts: string[] = []
  let current = byId.get(id)
  const guard = new Set<string>()
  while (current) {
    if (guard.has(current.id)) break
    guard.add(current.id)
    parts.unshift(current.name)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return parts.join(' › ')
})

const brandOptions = computed(() => {
  const sellerCat = getSellerCategory(form.value.category)
  const brandSub = sellerCat?.subs.find(sub =>
    sub.name.includes('برند') || sub.name === 'برندها',
  )
  const fromCategory = brandSub?.items.length
    ? brandSub.items
    : getBrandOptions(form.value.category)
  const fromStore = brands.value.filter(b => b.status === 'active').map(b => b.name)
  const current = form.value.brand.trim()
  return [...new Set([...(current ? [current] : []), ...fromStore, ...fromCategory])]
})

const warehouseItems = computed(() =>
  warehouses.value.map(w => ({ value: w.id, label: w.name })),
)

const unusedSpecKeySuggestions = computed(() => {
  const used = new Set(form.value.specs.map(s => s.key.trim()).filter(Boolean))
  return categorySpecKeys.value.filter(key => !used.has(key))
})

const derivedColors = computed(() =>
  colorsFromVariantAxes(commerce.value.variantAxes, attributes.value),
)

watch(derivedColors, (colors) => {
  form.value.colors = colors
}, { immediate: true })

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

function addSpecRow() {
  form.value.specs = [...form.value.specs, emptySpecRow()]
}

function removeSpecRow(index: number) {
  if (form.value.specs.length <= 1) return
  form.value.specs = form.value.specs.filter((_, i) => i !== index)
}

function onSpecDragStart(index: number, e: DragEvent) {
  dragSpecFrom.value = index
  dragSpecOver.value = index
  e.dataTransfer?.setData('text/plain', String(index))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onSpecDragOver(index: number, e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  if (dragSpecFrom.value === null) return
  dragSpecOver.value = index
}

function onSpecDragLeave(index: number) {
  if (dragSpecOver.value === index) dragSpecOver.value = null
}

function onSpecDrop(index: number) {
  const from = dragSpecFrom.value
  if (from === null || from === index) {
    onSpecDragEnd()
    return
  }
  const next = [...form.value.specs]
  const [item] = next.splice(from, 1)
  if (!item) {
    onSpecDragEnd()
    return
  }
  next.splice(index, 0, item)
  form.value.specs = next
  onSpecDragEnd()
}

function onSpecDragEnd() {
  dragSpecFrom.value = null
  dragSpecOver.value = null
}

/** Apply a category suggestion: fill first empty title, else append a row. */
function applySpecKeySuggestion(key: string) {
  const trimmed = key.trim()
  if (!trimmed) return
  const emptyIdx = form.value.specs.findIndex(s => !s.key.trim())
  if (emptyIdx >= 0) {
    const next = [...form.value.specs]
    const row = next[emptyIdx]
    if (!row) return
    next[emptyIdx] = { ...row, key: trimmed }
    form.value.specs = next
  }
  else {
    form.value.specs = [...form.value.specs, { ...emptySpecRow(), key: trimmed }]
  }
  onCreateSpecKey(trimmed)
}

function onCreateSpecKey(item: string) {
  const key = String(item || '').trim()
  if (!key) return
  if (!categorySpecKeys.value.includes(key)) {
    categorySpecKeys.value = [key, ...categorySpecKeys.value]
  }
}

function onCategorySelect(categoryId: string) {
  if (form.value.category === categoryId) return
  form.value.category = categoryId
  form.value.brand = ''
  form.value.colors = []
  form.value.specs = [emptySpecRow()]
  errors.value = {}
  activeTab.value = 'basic'
}

function persistCommerce(productId: string) {
  const slug = normalizeProductSlug(commerce.value.slug) || productId
  commerce.value.slug = slug
  saveCommerce(productId, {
    ...commerce.value,
    productId,
    slug,
    tags: [...commerce.value.tags],
    seo: { ...emptySeoMeta(), ...commerce.value.seo },
    published: commerce.value.published,
  })
}

function listingExtras() {
  return {
    featured: commerce.value.featured,
    published: commerce.value.published,
    hasVariants: commerce.value.variants.length > 0,
    sku: commerce.value.sku.trim() || undefined,
    barcode: commerce.value.barcode.trim() || undefined,
    weight: commerce.value.weight.trim() || undefined,
    lowStockThreshold: Number(commerce.value.lowStockThreshold) || 5,
    variantAxes: commerce.value.variantAxes,
    variants: commerce.value.variants,
  }
}

function withCategoryLabel<T extends { categoryLabel: string, category: string }>(product: T): T {
  const label = selectedCategory.value?.name
    || getSellerCategory(product.category)?.name
    || product.categoryLabel
  return { ...product, categoryLabel: label }
}

function buildProductPayload(base?: ReturnType<typeof resolveProduct>, id?: string) {
  const colors = colorsFromVariantAxes(commerce.value.variantAxes, attributes.value)
  form.value.colors = colors
  return buildSellerProductFromForm(form.value, {
    id,
    base,
    seo: sanitizeSeoMeta(commerce.value.seo),
    tags: commerce.value.tags,
    colors,
  })
}

async function onSubmit(publish: boolean) {
  commerce.value.slug = normalizeProductSlug(commerce.value.slug || form.value.title)
  errors.value = validateSellerProductForm(form.value)
  if (Object.keys(errors.value).length) {
    toast.error(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    activeTab.value = errors.value.category || errors.value.title
      ? 'basic'
      : (errors.value.price || errors.value.stock
          ? 'pricing'
          : (Object.keys(errors.value).some(k => k.startsWith('spec:')) ? 'specs' : 'basic'))
    return
  }

  submitting.value = true
  try {
    const variantStock = commerce.value.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    const stock = commerce.value.variants.length
      ? variantStock
      : Number.parseInt(form.value.stock.replace(/[^\d]/g, '') || '0', 10)

    const previousTags = isEdit.value && props.productId
      ? [...(resolveProduct(props.productId).tags || getCommerce(props.productId).tags || [])]
      : []

    if (isEdit.value && props.productId) {
      const previous = resolveProduct(props.productId)
      const built = buildProductPayload(previous, props.productId)
      if (!built) {
        toast.error(t('اطلاعات محصول معتبر نیست'))
        return
      }
      const product = withCategoryLabel({ ...built, inStock: stock > 0 })
      const listing = getListing(props.productId)
      // Persist commerce overlay BEFORE listing PATCH — PATCH updates stock/title and
      // would otherwise trigger the form watch against a stale commerce map.
      persistCommerce(props.productId)
      const result = await updateListingProduct(
        props.productId,
        product,
        stock,
        listing?.status,
        listingExtras(),
      )
      if (!result.ok) {
        toast.error(t(result.error))
        return
      }
      // Re-apply local overlay after API sync (sku may refresh from response)
      persistCommerce(props.productId)
      captureSnapshot()
      bumpUsage(previousTags, -1)
      bumpUsage(commerce.value.tags, 1)
      void loadCategorySpecKeys(form.value.category)
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

    const built = buildProductPayload()
    if (!built) {
      toast.error(t('اطلاعات محصول معتبر نیست'))
      return
    }
    const product = withCategoryLabel({ ...built, inStock: stock > 0 })

    // پیش‌نویس = unpublished + inactive؛ انتشار = published + active (بدون تأیید مارکت‌پلیس)
    commerce.value.published = publish

    const status = !publish
      ? (stock > 0 ? 'inactive' as const : 'out_of_stock' as const)
      : (stock > 0 ? 'active' as const : 'out_of_stock' as const)
    const created = await addListingProduct(product, stock, status, listingExtras())
    if (!created.ok) {
      toast.error(t(created.error))
      return
    }
    const productId = created.productId

    commerce.value.slug = normalizeProductSlug(commerce.value.slug) || productId
    persistCommerce(productId)
    bumpUsage(commerce.value.tags, 1)

    toast.success(
      publish
        ? t('محصول ثبت و منتشر شد')
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
