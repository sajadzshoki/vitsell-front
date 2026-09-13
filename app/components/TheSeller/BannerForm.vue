<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/banners"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به بنرها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش بنر') : $t('افزودن بنر') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('تصویر، جایگاه نمایش، لینک، بازه زمانی و وضعیت فعال بودن را تنظیم کنید.') }}
          </p>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <UBadge
            :color="sellerBannerTypeMeta[form.type].color"
            variant="subtle"
            size="md"
            class="font-medium"
          >
            {{ $t(sellerBannerTypeMeta[form.type].label) }}
          </UBadge>
          <UBadge
            :color="scheduleMeta.color"
            variant="subtle"
            size="md"
            class="font-medium"
          >
            {{ $t(scheduleMeta.label) }}
          </UBadge>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً home-main-1')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />

        <TheFormInput
          v-model="form.internalName"
          :label="$t('نام داخلی')"
          :placeholder="$t('برای شناسایی در پنل')"
          icon="i-tabler-tag"
        />

        <TheFormInput
          v-model="form.title"
          class="md:col-span-2"
          :label="$t('عنوان')"
          :placeholder="$t('عنوان نمایشی بنر')"
        />

        <TheFormInput
          v-model="form.alt"
          class="md:col-span-2"
          :label="$t('متن جایگزین (alt)')"
          :placeholder="$t('توضیح تصویر برای دسترس‌پذیری')"
          icon="i-tabler-accessible"
        />

        <UFormField
          :label="$t('نوع بنر')"
          required
        >
          <USelect
            v-model="form.type"
            :items="typeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('جایگاه نمایش')"
          :help="$t('برای اسلایدر صفحه اصلی «هیرو صفحه اصلی» را انتخاب کنید')"
          required
        >
          <USelect
            v-model="form.placement"
            :items="placementItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TheSellerImageUpload
            v-model="form.image"
            :label="$t('تصویر دسکتاپ')"
            :alt="form.alt || form.title || $t('تصویر بنر')"
            :error="errors.image"
          />
          <TheSellerImageUpload
            v-model="form.imageMobile"
            :label="$t('تصویر موبایل')"
            :alt="form.alt || form.title || $t('تصویر موبایل بنر')"
            :badge="$t('اختیاری')"
          />
        </div>

        <UFormField
          :label="$t('نوع لینک')"
          :help="$t('بدون لینک = بدون دکمه در اسلایدر')"
        >
          <USelect
            v-model="form.linkType"
            :items="linkTypeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-if="form.linkType === 'url'"
          v-model="form.link"
          :label="$t('لینک')"
          :placeholder="$t('مثلاً /search/category-mobile')"
          dir="ltr"
          :error="errors.link"
          :help="$t('اختیاری')"
          icon="i-tabler-link"
        />

        <UFormField
          v-else-if="form.linkType === 'product'"
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

        <UFormField
          v-else-if="form.linkType === 'category'"
          :label="$t('دسته‌بندی')"
          required
          :error="errors.categoryId"
        >
          <USelect
            v-model="form.categoryId"
            :items="categoryItems.filter(c => c.value && c.value !== '__none__')"
            value-key="value"
            class="w-full"
            :placeholder="$t('انتخاب دسته')"
          />
        </UFormField>

        <UFormField
          v-else-if="form.linkType === 'brand'"
          :label="$t('برند')"
          required
          :error="errors.brandId"
        >
          <USelectMenu
            v-model="form.brandId"
            :items="brandOptions"
            value-key="value"
            :placeholder="$t('انتخاب برند')"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-else-if="form.linkType === 'campaign'"
          v-model="form.campaignId"
          :label="$t('شناسه کمپین')"
          dir="ltr"
          :error="errors.campaignId"
          required
          icon="i-tabler-speakerphone"
        />

        <TheFormInput
          v-if="form.linkType !== 'url' && form.linkType !== 'none'"
          v-model="form.link"
          class="md:col-span-2"
          :label="$t('لینک پشتیبان')"
          :placeholder="$t('اختیاری — مسیر جایگزین')"
          dir="ltr"
          icon="i-tabler-link"
        />

        <TheFormInput
          v-if="form.linkType !== 'none'"
          v-model="form.buttonText"
          :label="$t('متن دکمه')"
          :placeholder="$t('مثلاً مشاهده و خرید')"
          :help="$t('فقط وقتی لینک داشته باشد نمایش داده می‌شود')"
          icon="i-tabler-click"
        />

        <UFormField
          v-if="form.linkType !== 'category' && form.linkType !== 'none'"
          :label="$t('دسته‌بندی مرتبط')"
          :help="$t('اختیاری — برای فیلتر یا نمایش در صفحه دسته')"
        >
          <USelect
            v-model="form.categoryId"
            :items="categoryItems"
            value-key="value"
            class="w-full"
            :placeholder="$t('بدون دسته')"
          />
        </UFormField>

        <TheFormInput
          v-model.number="form.sortOrder"
          type="number"
          :label="$t('ترتیب')"
          dir="ltr"
          icon="i-tabler-arrows-sort"
        />

        <TheFormInput
          v-model.number="form.priority"
          type="number"
          :label="$t('اولویت')"
          dir="ltr"
          icon="i-tabler-list-numbers"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />

        <TheIRDatePicker
          :model-value="form.startsAt || null"
          type="datetime"
          :header="$t('شروع نمایش')"
          :placeholder="$t('انتخاب تاریخ')"
          :validation="Boolean(errors.startsAt)"
          @update:model-value="form.startsAt = $event || ''"
        />

        <TheIRDatePicker
          :model-value="form.endsAt || null"
          type="datetime"
          :header="$t('پایان نمایش')"
          :placeholder="$t('انتخاب تاریخ')"
          :validation="Boolean(errors.endsAt)"
          @update:model-value="form.endsAt = $event || ''"
        />

        <div class="flex items-end pb-1">
          <UCheckbox
            v-model="form.active"
            :label="$t('فعال')"
          />
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs font-medium text-toned mb-2">
            {{ $t('پیش‌نمایش دسکتاپ') }}
          </div>
          <div class="relative overflow-hidden rounded-2xl border border-muted bg-muted min-h-36">
            <img
              v-if="form.image"
              :src="form.image"
              :alt="form.alt || $t('پیش‌نمایش بنر')"
              class="absolute inset-0 size-full object-cover"
            >
            <div
              v-else
              class="absolute inset-0 grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-12 opacity-60"
              />
            </div>
            <div class="relative z-10 h-full min-h-36 flex items-end p-4">
              <div class="rounded-xl bg-inverted/70 text-inverted text-xs px-3 py-2 max-w-full truncate">
                {{ form.title || form.link || $t('عنوان یا لینک هنوز وارد نشده') }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="text-xs font-medium text-toned mb-2">
            {{ $t('پیش‌نمایش موبایل') }}
          </div>
          <div class="relative overflow-hidden rounded-2xl border border-muted bg-muted min-h-36 max-w-xs">
            <img
              v-if="form.imageMobile || form.image"
              :src="form.imageMobile || form.image"
              :alt="form.alt || $t('پیش‌نمایش موبایل')"
              class="absolute inset-0 size-full object-cover"
            >
            <div
              v-else
              class="absolute inset-0 grid place-items-center"
            >
              <TheIcon
                icon-type="img"
                name="noImage.png"
                class="size-12 opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isEdit && (initial?.createdAt || initial?.updatedAt)"
        class="mt-4 flex flex-wrap gap-4 text-[11px] text-muted"
      >
        <span
          v-if="initial?.createdAt"
          class="num"
          dir="ltr"
        >
          {{ $t('ایجاد') }}: {{ initial.createdAt }}
        </span>
        <span
          v-if="initial?.updatedAt"
          class="num"
          dir="ltr"
        >
          {{ $t('به‌روزرسانی') }}: {{ initial.updatedAt }}
        </span>
      </div>
    </div>

    <TheSellerFormActions>
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت بنر') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
        to="/seller/banners"
      >
        {{ $t('انصراف') }}
      </UButton>
    </TheSellerFormActions>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/products'
import {
  bannerIdPattern,
  emptyBannerForm,
  sellerBannerLinkTypeMeta,
  sellerBannerPlacementMeta,
  sellerBannerTypeMeta,
  toBannerForm,
  type SellerBanner,
  type SellerBannerFormValues,
  type SellerBannerLinkType,
  type SellerBannerPlacement,
  type SellerBannerType,
} from '~/data/seller-banners'
import {
  deriveScheduleStatus,
  sellerScheduleStatusMeta,
} from '~/data/seller-marketing-shared'

const props = defineProps<{
  initial?: SellerBanner | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createBanner, updateBanner } = useSellerBanners()
const { categories, fetchCategories } = useCategories()
const { brands, ensureLoaded: ensureBrands } = useSellerBrands()
const { fetchProducts } = useProducts()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerBannerFormValues>(
  props.initial ? toBannerForm(props.initial) : emptyBannerForm(),
)
const errors = ref<Partial<Record<'id' | 'image' | 'link' | 'productId' | 'categoryId' | 'brandId' | 'campaignId' | 'startsAt' | 'endsAt', string>>>({})
const catalog = ref<Product[]>([])

const scheduleMeta = computed(() => {
  const status = deriveScheduleStatus({
    startsAt: form.value.startsAt || null,
    endsAt: form.value.endsAt || null,
    active: form.value.active,
  })
  return sellerScheduleStatusMeta[status]
})

const typeItems = computed(() =>
  (Object.keys(sellerBannerTypeMeta) as SellerBannerType[]).map(value => ({
    label: t(sellerBannerTypeMeta[value].label),
    value,
  })),
)

const placementItems = computed(() =>
  (Object.keys(sellerBannerPlacementMeta) as SellerBannerPlacement[]).map(value => ({
    label: t(sellerBannerPlacementMeta[value].label),
    value,
  })),
)

const linkTypeItems = computed(() =>
  (Object.keys(sellerBannerLinkTypeMeta) as SellerBannerLinkType[]).map(value => ({
    label: t(sellerBannerLinkTypeMeta[value].label),
    value,
  })),
)

const categoryItems = computed(() => [
  { label: t('بدون دسته'), value: '__none__' },
  ...categories.value.map(c => ({
    label: c.name,
    value: c.id,
  })),
])

const productOptions = computed(() =>
  catalog.value.map(p => ({ label: p.title, value: p.id })),
)

const brandOptions = computed(() =>
  brands.value.map(b => ({ label: b.name, value: b.id })),
)

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toBannerForm(value) : emptyBannerForm()
    errors.value = {}
  },
)

await Promise.all([
  fetchCategories({ withCounts: false }),
  ensureBrands(),
  fetchProducts({ pageSize: 100, sort: 'newest' }).then(({ result }) => {
    catalog.value = result.items
  }),
])

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  const image = form.value.image.trim()

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!bannerIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!image) next.image = t('تصویر الزامی است')

  if (form.value.linkType === 'product' && !form.value.productId.trim()) {
    next.productId = t('انتخاب محصول الزامی است')
  }
  if (form.value.linkType === 'category') {
    const catId = form.value.categoryId.trim()
    if (!catId || catId === '__none__') {
      next.categoryId = t('انتخاب دسته الزامی است')
    }
  }
  if (form.value.linkType === 'brand' && !form.value.brandId.trim()) {
    next.brandId = t('انتخاب برند الزامی است')
  }
  if (form.value.linkType === 'campaign' && !form.value.campaignId.trim()) {
    next.campaignId = t('شناسه کمپین الزامی است')
  }

  if (
    form.value.startsAt
    && form.value.endsAt
    && new Date(form.value.endsAt).getTime() <= new Date(form.value.startsAt).getTime()
  ) {
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
      ? await updateBanner(props.initial!.id, form.value)
      : await createBanner(form.value)

    if (!result.ok) {
      toast.error(t(result.error))
      if (result.error.includes('تکراری')) {
        errors.value = { ...errors.value, id: t(result.error) }
      }
      return
    }

    toast.success(isEdit.value ? t('بنر به‌روز شد') : t('بنر اضافه شد'))
    await router.push('/seller/banners')
  }
  finally {
    saving.value = false
  }
}
</script>
