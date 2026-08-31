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
        <TheFormInput
          v-model="form.icon"
          :label="$t('آیکون')"
          :placeholder="$t('مثلاً device-mobile')"
          dir="ltr"
          :error="errors.icon"
          required
          icon="i-tabler-icons"
          :help="$t('نام آیکون Tabler بدون پیشوند i-tabler-')"
        />
        <TheFormInput
          v-model="form.image"
          :label="$t('تصویر دسته')"
          :placeholder="$t('آدرس تصویر')"
          dir="ltr"
          icon="i-tabler-photo"
        />
      </div>

      <div class="mt-4 flex items-center gap-3">
        <img
          v-if="form.image"
          :src="form.image"
          :alt="form.name || $t('پیش‌نمایش')"
          class="size-20 rounded-xl object-cover bg-muted border border-muted"
        >
        <div
          v-else
          class="size-20 rounded-xl bg-muted border border-muted grid place-items-center"
        >
          <TheIcon
            icon-type="img"
            name="noImage.png"
            class="size-8 opacity-60"
          />
        </div>
        <UButton
          v-if="form.image"
          type="button"
          color="neutral"
          variant="soft"
          size="sm"
          @click="form.image = ''"
        >
          {{ $t('حذف تصویر') }}
        </UButton>
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
          <TheFormInput
            v-model="form.pageMeta.hero.image"
            class="md:col-span-2"
            :label="$t('تصویر هیرو')"
            dir="ltr"
            icon="i-tabler-photo"
          />
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
            <TheFormInput
              v-model="item.image"
              :label="$t('تصویر')"
              dir="ltr"
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

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت دسته‌بندی') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        to="/seller/categories"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  categoryIdPattern,
  emptyCategoryForm,
  emptySuggestedItem,
  resolveCategoryIconName,
  toCategoryForm,
  type SellerCategory,
  type SellerCategoryFormValues,
} from '~/data/seller-categories'

const props = defineProps<{
  initial?: SellerCategory | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createCategory, updateCategory } = useSellerCategories()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerCategoryFormValues>(
  props.initial ? toCategoryForm(props.initial) : emptyCategoryForm(),
)
const errors = ref<Partial<Record<'id' | 'name' | 'icon', string>>>({})

const iconPreview = computed(() => resolveCategoryIconName(form.value.icon))

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toCategoryForm(value) : emptyCategoryForm()
    errors.value = {}
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
      ? updateCategory(props.initial!.id, payload)
      : createCategory(payload)

    if (!result.ok) {
      toast.error(t(result.error))
      if (result.error.includes('تکراری')) {
        errors.value = { ...errors.value, id: t(result.error) }
      }
      return
    }

    toast.success(isEdit.value ? t('دسته‌بندی به‌روز شد') : t('دسته‌بندی اضافه شد'))
    await router.push('/seller/categories')
  }
  finally {
    saving.value = false
  }
}
</script>
