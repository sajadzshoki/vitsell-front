<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/categories"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت به دسته‌بندی‌ها') }}
      </UButton>
    </div>

    <!-- Basic -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش دسته‌بندی') : $t('افزودن دسته‌بندی') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('تمام فیلدهای مدل دسته را می‌توانید اینجا مدیریت کنید.') }}
          </p>
        </div>
        <div
          v-if="iconPreview"
          class="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0"
        >
          <UIcon
            :name="iconPreview"
            class="size-6"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً mobile')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />
        <TheFormInput
          v-model="form.name"
          :label="$t('نام دسته‌بندی')"
          :placeholder="$t('مثلاً موبایل')"
          :error="errors.name"
          required
        />
        <TheSellerIconPicker
          v-model="form.icon"
          :label="$t('آیکون')"
          required
          :error="errors.icon"
          :help="$t('آیکون را از داخل پنل مدیریت انتخاب کنید')"
        />

        <UFormField
          :label="$t('دسته والد')"
          :help="$t('دسته ریشه یا انتخاب والد — سلسله‌مراتب نامحدود')"
        >
          <USelect
            v-model="form.parentId"
            :items="parentOptions"
            value-key="value"
            class="w-full"
            :placeholder="$t('دسته ریشه (بدون والد)')"
          />
        </UFormField>

        <UFormField
          :label="$t('وضعیت')"
        >
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-model.number="form.sortOrder"
          type="number"
          :label="$t('ترتیب نمایش')"
          :placeholder="$t('۰')"
          dir="ltr"
          icon="i-tabler-arrows-sort"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />
      </div>

      <UFormField
        class="mt-4"
        :label="$t('توضیح کوتاه دسته')"
        :help="$t('متن کوتاه برای صفحه جستجو و دسته')"
      >
        <UTextarea
          v-model="form.text"
          :rows="3"
          autoresize
          class="w-full"
          :placeholder="$t('توضیح کوتاه دسته را بنویسید')"
        />
      </UFormField>

      <div class="mt-4 max-w-sm">
        <TheSellerImageUpload
          v-model="form.image"
          :label="$t('تصویر دسته')"
          :alt="form.name || $t('پیش‌نمایش')"
          icon="i-tabler-photo"
          :hint="$t('پس از انتخاب، پیش‌نمایش بلافاصله نمایش داده می‌شود — می‌توانید از کتابخانه هم انتخاب کنید')"
        />
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

    <!-- Subs -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerCategorySubsEditor v-model="form.subs" />
    </div>

    <!-- pageMeta -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-5">
      <div>
        <h3 class="font-bold text-highlighted">
          {{ $t('متای صفحه دسته') }}
        </h3>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ $t('محتوای hero و SEO برای صفحه /category') }}
        </p>
      </div>

      <div>
        <h4 class="text-sm font-medium text-toned mb-3">
          {{ $t('هیرو') }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2 max-w-md">
            <TheSellerImageUpload
              v-model="form.pageMeta.hero.image"
              :label="$t('تصویر هیرو')"
              :alt="form.pageMeta.hero.title || form.name || $t('پیش‌نمایش هیرو')"
              icon="i-tabler-photo"
              :hint="$t('تصویر اصلی صفحه دسته')"
            />
          </div>
          <TheFormInput
            v-model="form.pageMeta.hero.eyebrow"
            :label="$t('عنوان فرعی')"
          />
          <TheFormInput
            v-model="form.pageMeta.hero.title"
            :label="$t('عنوان هیرو')"
          />
          <UFormField
            class="md:col-span-2"
            :label="$t('توضیح هیرو')"
          >
            <UTextarea
              v-model="form.pageMeta.hero.subtitle"
              :rows="2"
              autoresize
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <USeparator />

      <div>
        <h4 class="text-sm font-medium text-toned mb-3">
          {{ $t('سئو') }}
        </h4>
        <div class="space-y-3">
          <TheFormInput
            v-model="form.pageMeta.seo.heading"
            :label="$t('عنوان سئو')"
          />
          <div
            v-for="(_, pIndex) in form.pageMeta.seo.paragraphs"
            :key="pIndex"
            class="flex items-start gap-2"
          >
            <UFormField
              class="flex-1"
              :label="`${$t('پاراگراف')} ${(pIndex + 1).toLocaleString('fa-IR')}`"
            >
              <UTextarea
                v-model="form.pageMeta.seo.paragraphs[pIndex]"
                :rows="2"
                autoresize
                class="w-full"
              />
            </UFormField>
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              class="mt-7"
              icon="i-tabler-trash"
              :disabled="form.pageMeta.seo.paragraphs.length <= 1"
              :aria-label="$t('حذف پاراگراف')"
              @click="removeParagraph(pIndex)"
            />
          </div>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-tabler-plus"
            @click="form.pageMeta.seo.paragraphs.push('')"
          >
            {{ $t('افزودن پاراگراف') }}
          </UButton>
        </div>
      </div>
    </div>

    <TheSellerSeoFields v-model="form.seo" />

    <!-- suggested -->
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 class="font-bold text-highlighted">
            {{ $t('پیشنهادهای دسته') }}
          </h3>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('کارت‌های پیشنهادی صفحه دسته') }}
          </p>
        </div>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="sm"
          icon="i-tabler-plus"
          @click="addSuggested"
        >
          {{ $t('افزودن پیشنهاد') }}
        </UButton>
      </div>

      <div
        v-if="!form.suggested.length"
        class="rounded-2xl border border-dashed border-muted bg-muted/40 px-4 py-8 text-center text-sm text-muted"
      >
        {{ $t('پیشنهادی ثبت نشده است') }}
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="(item, index) in form.suggested"
          :key="index"
          class="rounded-2xl border border-muted bg-muted/30 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TheFormInput
              v-model="item.id"
              :label="$t('شناسه')"
              dir="ltr"
            />
            <TheFormInput
              v-model="item.title"
              :label="$t('عنوان')"
            />
            <TheFormInput
              v-model="item.query"
              :label="$t('عبارت جستجو')"
            />
            <TheSellerImageUpload
              v-model="item.image"
              :label="$t('تصویر')"
              :alt="item.title || $t('پیش‌نمایش')"
              icon="i-tabler-photo"
            />
          </div>
          <div class="mt-3 flex justify-end">
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              @click="form.suggested.splice(index, 1)"
            >
              {{ $t('حذف') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <TheSellerFormActions>
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        :disabled="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت دسته‌بندی') }}
      </UButton>
      <UButton
        v-if="isEdit && initial?.id"
        type="button"
        color="neutral"
        variant="soft"
        size="lg"
        icon="i-tabler-external-link"
        class="cursor-pointer"
        @click="openStorefront"
      >
        {{ $t('نمایش') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        to="/seller/categories"
        class="cursor-pointer"
      >
        {{ $t('انصراف') }}
      </UButton>
    </TheSellerFormActions>
  </div>
</template>

<script setup lang="ts">
import {
  categoryIdPattern,
  categoryParentOptions,
  emptyCategoryForm,
  emptySuggestedItem,
  resolveCategoryIconName,
  sellerCategoryStatusMeta,
  SELLER_CATEGORY_ROOT_PARENT,
  toCategoryForm,
  type SellerCategory,
  type SellerCategoryFormValues,
} from '~/data/seller-categories'
import { categoryStorefrontHref } from '~/data/categories'

const props = defineProps<{
  initial?: SellerCategory | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { createCategory, updateCategory, categories, ensureLoaded } = useSellerCategories()
const { storeUrl } = useAppMode()
const route = useRoute()

void ensureLoaded()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)

function openStorefront() {
  const id = props.initial?.id?.trim()
  if (!id) return
  const href = categoryStorefrontHref(storeUrl, id)
  if (import.meta.client) window.open(href, '_blank', 'noopener,noreferrer')
}

function parentIdFromQuery() {
  const raw = route.query.parentId
  const value = Array.isArray(raw) ? raw[0] : raw
  return String(value ?? '').trim()
}

function buildCreateForm(): SellerCategoryFormValues {
  const base = emptyCategoryForm()
  const parentFromQuery = parentIdFromQuery()
  if (parentFromQuery) base.parentId = parentFromQuery
  return base
}

const form = ref<SellerCategoryFormValues>(
  props.initial ? toCategoryForm(props.initial) : buildCreateForm(),
)
const errors = ref<Partial<Record<'id' | 'name' | 'icon', string>>>({})
const savedSnapshot = ref('')
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)
const { allowNextNavigation } = useSellerUnsavedGuard(isDirty)

function captureSnapshot() {
  savedSnapshot.value = JSON.stringify(form.value)
}

captureSnapshot()

const iconPreview = computed(() => resolveCategoryIconName(form.value.icon))

const parentOptions = computed(() =>
  categoryParentOptions(categories.value, props.initial?.id),
)

const statusItems = computed(() =>
  (Object.keys(sellerCategoryStatusMeta) as Array<keyof typeof sellerCategoryStatusMeta>).map(id => ({
    value: id,
    label: t(sellerCategoryStatusMeta[id].label),
  })),
)

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toCategoryForm(value) : buildCreateForm()
    errors.value = {}
    captureSnapshot()
  },
)

/** Keep parent preselected when opening /new?parentId=… (incl. client navigations). */
watch(
  () => [isEdit.value, parentIdFromQuery()] as const,
  ([editing, parentFromQuery]) => {
    if (editing) return
    const nextParent = parentFromQuery || SELLER_CATEGORY_ROOT_PARENT
    if (form.value.parentId === nextParent) return
    form.value.parentId = nextParent
    captureSnapshot()
  },
)

function addSuggested() {
  form.value.suggested.push(emptySuggestedItem())
}

function removeParagraph(index: number) {
  if (form.value.pageMeta.seo.paragraphs.length <= 1) return
  form.value.pageMeta.seo.paragraphs.splice(index, 1)
}

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  const name = form.value.name.trim()
  const icon = form.value.icon.trim()

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!categoryIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!name) next.name = t('نام الزامی است')
  if (!icon) next.icon = t('آیکون الزامی است')

  const parentId = form.value.parentId.trim()
  if (
    parentId
    && parentId !== SELLER_CATEGORY_ROOT_PARENT
    && categories.value.length
    && !categories.value.some(c => c.id === parentId)
  ) {
    toast.error(t('دسته والد یافت نشد'))
    errors.value = next
    return false
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
    const payload = form.value
    const result = isEdit.value
      ? await updateCategory(props.initial!.id, payload)
      : await createCategory(payload)

    if (!result.ok) {
      toast.error(result.error)
      if (String(result.error).includes('تکراری')) {
        errors.value = { ...errors.value, id: result.error }
      }
      return
    }

    toast.success(isEdit.value ? t('دسته‌بندی به‌روز شد') : t('دسته‌بندی اضافه شد'))
    allowNextNavigation()
    captureSnapshot()
    const savedId = result.category?.id || props.initial?.id || form.value.id.trim()
    if (savedId) {
      await navigateTo(`/seller/categories/${savedId}`)
    }
    else {
      await navigateTo('/seller/categories')
    }
  }
  finally {
    saving.value = false
  }
}
</script>
