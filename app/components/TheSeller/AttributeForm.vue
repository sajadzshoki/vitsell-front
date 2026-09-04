<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/attributes"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به ویژگی‌ها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ isEdit ? $t('ویرایش ویژگی') : $t('افزودن ویژگی') }}
      </h2>
      <p class="text-xs text-muted mb-5 leading-6">
        {{ $t('نام، نوع، مقادیر و ترتیب نمایش ویژگی را تنظیم کنید.') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.name"
          :label="$t('نام')"
          required
          :error="errors.name"
        />
        <TheFormInput
          v-model="form.slug"
          :label="$t('اسلاگ (انگلیسی)')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.slug"
          icon="i-tabler-link"
          :help="isEdit ? $t('اسلاگ بعد از ایجاد قابل تغییر نیست') : $t('خودکار از نام — فقط حروف کوچک انگلیسی و خط تیره')"
          @update:model-value="slugTouched = true"
        />
        <UFormField
          :label="$t('نوع')"
          required
        >
          <USelect
            v-model="form.type"
            :items="typeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="$t('وضعیت')">
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
          dir="ltr"
          icon="i-tabler-arrows-sort"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <UCheckbox
          v-model="form.filterable"
          :label="$t('قابل فیلتر در جستجو')"
        />
        <UCheckbox
          v-model="form.searchable"
          :label="$t('قابل جستجو')"
        />
        <UCheckbox
          v-model="form.variantDefining"
          :label="$t('تعریف‌کننده واریانت')"
        />
      </div>

      <div class="mt-6">
        <div class="text-sm font-medium text-highlighted mb-1">
          {{ $t('دسته‌بندی‌های مرتبط') }}
        </div>
        <p class="text-[11px] text-muted mb-3 leading-6">
          {{ $t('خالی = همه دسته‌ها. فقط دسته‌های انتخاب‌شده این ویژگی را می‌بینند.') }}
        </p>
        <div
          v-if="categoriesPending"
          class="rounded-xl border border-muted p-4"
        >
          <USkeleton class="h-6 w-full mb-2" />
          <USkeleton class="h-6 w-full mb-2" />
          <USkeleton class="h-6 w-2/3" />
        </div>
        <div
          v-else-if="!categoryOptions.length"
          class="rounded-xl border border-dashed border-muted p-4 text-sm text-muted text-center"
        >
          {{ $t('دسته‌بندی‌ای یافت نشد') }}
        </div>
        <div
          v-else
          class="max-h-48 overflow-y-auto rounded-xl border border-muted p-3 space-y-2"
        >
          <UCheckbox
            v-for="cat in categoryOptions"
            :key="cat.id"
            :model-value="form.categoryIds.includes(cat.id)"
            :label="cat.name"
            @update:model-value="toggleCategory(cat.id, !!$event)"
          />
        </div>
      </div>

      <div class="mt-6">
        <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div>
            <div class="text-sm font-medium text-highlighted">
              {{ $t('مقادیر') }}
            </div>
            <p class="text-[11px] text-muted mt-0.5">
              {{ $t('گزینه‌های قابل انتخاب برای این ویژگی') }}
            </p>
          </div>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="xs"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="addValue"
          >
            {{ $t('افزودن مقدار') }}
          </UButton>
        </div>

        <div
          v-if="!form.values.length"
          class="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted"
        >
          {{ $t('هنوز مقداری اضافه نشده') }}
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="(row, index) in form.values"
            :key="row.id"
            class="bg-muted border border-muted rounded-xl p-3 sm:p-4"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TheFormInput
                v-model="row.label"
                :label="$t('برچسب')"
                :placeholder="$t('مثلاً قرمز')"
              />
              <TheFormInput
                v-model="row.value"
                :label="$t('مقدار (انگلیسی)')"
                dir="ltr"
                :placeholder="$t('مثلاً red')"
              />
              <UFormField :label="$t('وضعیت مقدار')">
                <USelect
                  :model-value="row.status ?? 'active'"
                  :items="valueStatusItems"
                  value-key="value"
                  class="w-full"
                  @update:model-value="row.status = String($event ?? 'active') as 'active' | 'inactive'"
                />
              </UFormField>
              <div
                v-if="form.type === 'color'"
                class="sm:col-span-2"
              >
                <UFormField :label="$t('رنگ (Hex)')">
                  <div class="flex items-center gap-3">
                    <input
                      :value="row.meta ?? '#000000'"
                      type="color"
                      class="size-11 rounded-lg border border-muted cursor-pointer shrink-0"
                      @input="row.meta = ($event.target as HTMLInputElement).value"
                    >
                    <TheFormInput
                      :model-value="row.meta ?? ''"
                      dir="ltr"
                      :placeholder="$t('#2563eb')"
                      class="flex-1"
                      @update:model-value="row.meta = $event || null"
                    />
                  </div>
                </UFormField>
              </div>
            </div>
            <div class="mt-3 flex justify-end">
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                class="cursor-pointer"
                :disabled="form.values.length <= 1"
                @click="removeValue(index)"
              >
                {{ $t('حذف') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap mt-6">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت ویژگی') }}
        </UButton>
        <UButton
          to="/seller/attributes"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
        >
          {{ $t('انصراف') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  attributeSlugPattern,
  emptyAttributeForm,
  emptyAttributeValue,
  sellerAttributeTypeMeta,
  toAttributeForm,
  type SellerAttribute,
  type SellerAttributeFormValues,
  type SellerAttributeType,
} from '~/data/seller-attributes'

const props = defineProps<{
  initial?: SellerAttribute | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { createAttribute, updateAttribute } = useSellerAttributes()
const { categories, ensureLoaded: ensureCategories, pending: categoriesPending } = useSellerCategories()

ensureCategories()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const slugTouched = ref(false)
const form = ref<SellerAttributeFormValues>(
  props.initial ? toAttributeForm(props.initial) : emptyAttributeForm(),
)
const errors = ref<Partial<Record<'name' | 'slug', string>>>({})

const typeItems = computed(() =>
  (Object.keys(sellerAttributeTypeMeta) as SellerAttributeType[]).map(value => ({
    label: t(sellerAttributeTypeMeta[value].label),
    value,
  })),
)

const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

const valueStatusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

const categoryOptions = computed(() =>
  categories.value.map(c => ({ id: c.id, name: c.name })),
)

function toggleCategory(id: string, on: boolean) {
  if (on) {
    if (!form.value.categoryIds.includes(id)) {
      form.value.categoryIds = [...form.value.categoryIds, id]
    }
  }
  else {
    form.value.categoryIds = form.value.categoryIds.filter(x => x !== id)
  }
}

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toAttributeForm(value) : emptyAttributeForm()
    errors.value = {}
    slugTouched.value = false
  },
)

watch(
  () => form.value.name,
  (name) => {
    if (isEdit.value || slugTouched.value) return
    if (!form.value.slug.trim()) {
      form.value.slug = slugifyLatin(name)
    }
  },
)

function slugifyLatin(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function addValue() {
  form.value.values.push(emptyAttributeValue(form.value.values.length))
}

function removeValue(index: number) {
  if (form.value.values.length <= 1) return
  form.value.values.splice(index, 1)
}

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  const slug = form.value.slug.trim().toLowerCase()
  if (!isEdit.value) {
    if (!slug) next.slug = t('اسلاگ الزامی است')
    else if (!attributeSlugPattern.test(slug)) next.slug = t('اسلاگ فقط حروف کوچک، عدد و خط تیره')
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
    const payload = {
      ...form.value,
      slug: form.value.slug.trim().toLowerCase() || slugifyLatin(form.value.name),
    }
    const result = isEdit.value
      ? await updateAttribute(props.initial!.id, payload)
      : await createAttribute(payload)

    if (!result.ok) {
      toast.error(t(result.error))
      return
    }

    toast.success(isEdit.value ? t('ویژگی به‌روز شد') : t('ویژگی اضافه شد'))
    await navigateTo('/seller/attributes')
  }
  finally {
    saving.value = false
  }
}
</script>
