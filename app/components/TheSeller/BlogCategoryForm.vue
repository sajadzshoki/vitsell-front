<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/blog/categories"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به دسته‌ها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-1">
        {{ isEdit ? $t('ویرایش دسته وبلاگ') : $t('افزودن دسته وبلاگ') }}
      </h2>
      <p class="text-xs text-muted mb-5 leading-6">
        {{ $t('نام، اسلاگ، تصویر و وضعیت دسته را تنظیم کنید.') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.name"
          :label="$t('نام')"
          required
          :error="errors.name"
          icon="i-tabler-heading"
        />
        <TheFormInput
          v-model="form.slug"
          :label="$t('اسلاگ (انگلیسی)')"
          dir="ltr"
          :error="errors.slug"
          icon="i-tabler-link"
          :help="$t('خودکار از نام — فقط حروف کوچک انگلیسی و خط تیره')"
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
        />
        <UFormField
          class="md:col-span-2"
          :label="$t('توضیحات')"
        >
          <UTextarea
            v-model="form.description"
            :rows="3"
            class="w-full"
          />
        </UFormField>
        <div class="md:col-span-2 max-w-sm">
          <TheSellerImageUpload
            v-model="form.image"
            :label="$t('تصویر')"
            :alt="form.name || $t('دسته وبلاگ')"
          />
        </div>
      </div>

      <TheSellerSeoFields
        v-model="form.seo"
        class="mt-6"
        :preview-title="form.name"
        :preview-description="form.description"
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
          {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت دسته') }}
        </UButton>
        <UButton
          to="/seller/blog/categories"
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
  emptyBlogCategoryForm,
  isValidLatinSlug,
  slugifyLatin,
  toBlogCategoryForm,
  type SellerBlogCategory,
} from '~/data/seller-blog-taxonomy'

const props = defineProps<{
  initial?: SellerBlogCategory | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { can } = useSellerPermissions()
const { createCategory, updateCategory, ensureLoaded } = useSellerBlogCategories()

ensureLoaded()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const slugTouched = ref(false)
const form = ref(props.initial ? toBlogCategoryForm(props.initial) : emptyBlogCategoryForm())
const errors = ref<Partial<Record<'name' | 'slug', string>>>({})

const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

watch(
  () => form.value.name,
  (name) => {
    if (isEdit.value || slugTouched.value) return
    form.value.slug = slugifyLatin(name)
  },
)

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toBlogCategoryForm(value) : emptyBlogCategoryForm()
    errors.value = {}
    slugTouched.value = false
  },
)

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  const slug = form.value.slug.trim()
  if (slug && !isValidLatinSlug(slug)) next.slug = t('اسلاگ نامعتبر است')
  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!(isEdit.value ? can('blog.update') : can('blog.create'))) {
    toast.error(t('دسترسی ندارید'))
    return
  }
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  saving.value = true
  try {
    const result = isEdit.value
      ? updateCategory(props.initial!.id, form.value)
      : createCategory(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(isEdit.value ? t('دسته به‌روز شد') : t('دسته اضافه شد'))
    await router.push('/seller/blog/categories')
  }
  finally {
    saving.value = false
  }
}
</script>
