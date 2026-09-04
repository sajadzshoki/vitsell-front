<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/brands"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به برندها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ isEdit ? $t('ویرایش برند') : $t('افزودن برند') }}
      </h2>
      <p class="text-xs text-muted mb-5 leading-6">
        {{ $t('نام، لوگو، توضیحات و ترتیب نمایش برند را تنظیم کنید.') }}
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

      <div class="mt-4 max-w-sm">
        <TheSellerImageUpload
          v-model="form.logo"
          :label="$t('لوگو')"
          :alt="form.name || $t('لوگوی برند')"
        />
      </div>

      <UFormField
        class="mt-4"
        :label="$t('توضیحات')"
      >
        <UTextarea
          v-model="form.description"
          :rows="3"
          autoresize
          class="w-full"
          :placeholder="$t('توضیح کوتاه درباره برند')"
        />
      </UFormField>

      <TheSellerSeoFields
        v-model="form.seo"
        class="mt-6"
        :preview-title="form.name"
        :preview-description="form.description"
        :preview-url="form.slug ? `/brand/${form.slug}` : ''"
      />

      <div class="flex items-center gap-3 flex-wrap mt-6">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت برند') }}
        </UButton>
        <UButton
          to="/seller/brands"
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
  brandSlugPattern,
  emptyBrandForm,
  toBrandForm,
  type SellerBrand,
  type SellerBrandFormValues,
} from '~/data/seller-brands'

const props = defineProps<{
  initial?: SellerBrand | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const { createBrand, updateBrand } = useSellerBrands()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const slugTouched = ref(false)
const form = ref<SellerBrandFormValues>(
  props.initial ? toBrandForm(props.initial) : emptyBrandForm(),
)
const errors = ref<Partial<Record<'name' | 'slug', string>>>({})

const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toBrandForm(value) : emptyBrandForm()
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

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  const slug = form.value.slug.trim().toLowerCase()
  if (!isEdit.value) {
    if (!slug) next.slug = t('اسلاگ الزامی است')
    else if (!brandSlugPattern.test(slug)) next.slug = t('اسلاگ فقط حروف کوچک، عدد و خط تیره')
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
      ? await updateBrand(props.initial!.id, payload)
      : await createBrand(payload)

    if (!result.ok) {
      toast.error(t(result.error))
      return
    }

    toast.success(isEdit.value ? t('برند به‌روز شد') : t('برند اضافه شد'))
    await navigateTo('/seller/brands')
  }
  finally {
    saving.value = false
  }
}
</script>
