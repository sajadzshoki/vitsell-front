<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/banners"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
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
            {{ $t('تصویر، لینک، نوع بنر، دسته و وضعیت فعال بودن را تنظیم کنید.') }}
          </p>
        </div>
        <UBadge
          :color="sellerBannerTypeMeta[form.type].color"
          variant="subtle"
          size="md"
          class="font-medium"
        >
          {{ $t(sellerBannerTypeMeta[form.type].label) }}
        </UBadge>
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

        <TheFormInput
          v-model="form.image"
          class="md:col-span-2"
          :label="$t('تصویر بنر')"
          :placeholder="$t('آدرس تصویر')"
          dir="ltr"
          :error="errors.image"
          required
          icon="i-tabler-photo"
        />

        <TheFormInput
          v-model="form.link"
          class="md:col-span-2"
          :label="$t('لینک')"
          :placeholder="$t('مثلاً /search?category=mobile')"
          dir="ltr"
          :error="errors.link"
          required
          icon="i-tabler-link"
        />

        <UFormField
          :label="$t('دسته‌بندی')"
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

        <div class="flex items-end pb-1">
          <UCheckbox
            v-model="form.active"
            :label="$t('فعال')"
          />
        </div>
      </div>

      <div class="mt-5">
        <div class="text-xs font-medium text-toned mb-2">
          {{ $t('پیش‌نمایش') }}
        </div>
        <div class="relative overflow-hidden rounded-2xl border border-muted bg-muted min-h-36 max-w-xl">
          <img
            v-if="form.image"
            :src="form.image"
            :alt="$t('پیش‌نمایش بنر')"
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
            <div class="rounded-xl bg-inverted/70 text-inverted text-xs px-3 py-2 max-w-full truncate num" dir="ltr">
              {{ form.link || $t('لینک هنوز وارد نشده') }}
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

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold"
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
        to="/seller/banners"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  bannerIdPattern,
  emptyBannerForm,
  sellerBannerTypeMeta,
  toBannerForm,
  type SellerBanner,
  type SellerBannerFormValues,
  type SellerBannerType,
} from '~/data/seller-banners'

const props = defineProps<{
  initial?: SellerBanner | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createBanner, updateBanner } = useSellerBanners()
const { categories, fetchCategories } = useCategories()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerBannerFormValues>(
  props.initial ? toBannerForm(props.initial) : emptyBannerForm(),
)
const errors = ref<Partial<Record<'id' | 'image' | 'link', string>>>({})

const typeItems = computed(() =>
  (Object.keys(sellerBannerTypeMeta) as SellerBannerType[]).map(value => ({
    label: t(sellerBannerTypeMeta[value].label),
    value,
  })),
)

const categoryItems = computed(() => [
  { label: t('بدون دسته'), value: '' },
  ...categories.value.map(c => ({
    label: c.name,
    value: c.id,
  })),
])

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toBannerForm(value) : emptyBannerForm()
    errors.value = {}
  },
)

await fetchCategories({ withCounts: false })

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  const image = form.value.image.trim()
  const link = form.value.link.trim()

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!bannerIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!image) next.image = t('تصویر الزامی است')
  if (!link) next.link = t('لینک الزامی است')

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
      ? updateBanner(props.initial!.id, form.value)
      : createBanner(form.value)

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
