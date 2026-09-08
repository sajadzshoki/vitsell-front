<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/promotions?tab=promos"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
      >
        {{ $t('بازگشت') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <h2 class="font-bold text-highlighted mb-4">
        {{ isEdit ? $t('ویرایش پرومو') : $t('افزودن پرومو') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه')"
          :placeholder="$t('مثلاً plus')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
        />
        <UFormField :label="$t('تم رنگی')">
          <USelect
            v-model="form.tone"
            :items="toneItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <TheFormInput
          v-model="form.eyebrow"
          :label="$t('عنوان فرعی')"
          class="md:col-span-2"
        />
        <TheFormInput
          v-model="form.title"
          :label="$t('عنوان')"
          class="md:col-span-2"
          :error="errors.title"
          required
        />
        <UFormField
          class="md:col-span-2"
          :label="$t('توضیحات')"
          required
          :error="errors.subtitle"
        >
          <UTextarea
            v-model="form.subtitle"
            :rows="3"
            autoresize
            class="w-full"
          />
        </UFormField>
        <TheSellerIconPicker
          v-model="form.icon"
          :label="$t('آیکون')"
        />
        <div class="flex items-end pb-1">
          <UCheckbox
            v-model="form.active"
            :label="$t('فعال')"
          />
        </div>
        <TheFormInput
          v-model="form.primaryCtaLabel"
          :label="$t('متن دکمه اصلی')"
          :error="errors.primaryCtaLabel"
          required
        />
        <TheFormInput
          v-model="form.primaryCtaTo"
          :label="$t('لینک دکمه اصلی')"
          dir="ltr"
          icon="i-tabler-link"
        />
        <TheFormInput
          v-model="form.secondaryCtaLabel"
          :label="$t('متن دکمه فرعی')"
        />
        <TheFormInput
          v-model="form.secondaryCtaTo"
          :label="$t('لینک دکمه فرعی')"
          dir="ltr"
          icon="i-tabler-link"
        />
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
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت پرومو') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        to="/seller/promotions?tab=promos"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emptyContentPromoForm,
  promoIdPattern,
  sellerPromoToneMeta,
  toContentPromoForm,
  type SellerContentPromo,
  type SellerContentPromoForm,
  type SellerPromoTone,
} from '~/data/seller-promotions'

const props = defineProps<{
  initial?: SellerContentPromo | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createPromo, updatePromo } = useSellerPromotions()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerContentPromoForm>(
  props.initial ? toContentPromoForm(props.initial) : emptyContentPromoForm(),
)
const errors = ref<Partial<Record<'id' | 'title' | 'subtitle' | 'primaryCtaLabel', string>>>({})

const toneItems = computed(() =>
  (Object.keys(sellerPromoToneMeta) as SellerPromoTone[]).map(value => ({
    label: t(sellerPromoToneMeta[value].label),
    value,
  })),
)

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toContentPromoForm(value) : emptyContentPromoForm()
    errors.value = {}
  },
)

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!promoIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  if (!form.value.subtitle.trim()) next.subtitle = t('توضیحات الزامی است')
  if (!form.value.primaryCtaLabel.trim()) next.primaryCtaLabel = t('متن دکمه اصلی الزامی است')
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
      ? await updatePromo(props.initial!.id, form.value)
      : await createPromo(form.value)
    if (!result.ok) {
      toast.error(result.error)
      if (String(result.error).includes('تکراری')) {
        errors.value = { ...errors.value, id: result.error }
      }
      return
    }
    toast.success(isEdit.value ? t('پرومو به‌روز شد') : t('پرومو ثبت شد'))
    await router.push('/seller/promotions?tab=promos')
  }
  finally {
    saving.value = false
  }
}
</script>
