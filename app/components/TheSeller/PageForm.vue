<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/pages"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به صفحات') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش صفحه') : $t('افزودن صفحه') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('عنوان، مسیر، وضعیت، محتوا و سئوی صفحه را تنظیم کنید.') }}
          </p>
        </div>
        <UBadge
          :color="sellerPageStatusMeta[form.status].color"
          variant="subtle"
          size="md"
        >
          {{ $t(sellerPageStatusMeta[form.status].label) }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          dir="ltr"
          :disabled="isEdit"
          required
          :error="errors.id"
          icon="i-tabler-id"
        />
        <TheFormInput
          v-model="form.path"
          :label="$t('مسیر')"
          dir="ltr"
          required
          :error="errors.path"
          icon="i-tabler-link"
          placeholder="/example"
        />
        <TheFormInput
          v-model="form.title"
          :label="$t('عنوان')"
          required
          :error="errors.title"
          icon="i-tabler-heading"
        />
        <TheFormInput
          v-model="form.icon"
          :label="$t('آیکون')"
          dir="ltr"
          placeholder="i-tabler-file-text"
          icon="i-tabler-icons"
        />
        <UFormField :label="$t('وضعیت')">
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="$t('قالب')">
          <USelect
            v-model="form.template"
            :items="templateItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField
          class="md:col-span-2"
          :label="$t('زیرعنوان')"
        >
          <UTextarea
            v-model="form.subtitle"
            :rows="2"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="font-bold text-highlighted">
          {{ $t('پاراگراف‌ها') }}
        </h3>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="xs"
          icon="i-tabler-plus"
          class="cursor-pointer"
          @click="form.paragraphSections.push({ itemsText: '' })"
        >
          {{ $t('افزودن بلوک') }}
        </UButton>
      </div>
      <div
        v-for="(block, index) in form.paragraphSections"
        :key="`p-${index}`"
        class="space-y-2 rounded-xl border border-muted p-3 bg-muted/30"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-muted">{{ $t('بلوک') }} {{ (index + 1).toLocaleString('fa-IR') }}</span>
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="xs"
            icon="i-tabler-trash"
            class="cursor-pointer"
            :disabled="form.paragraphSections.length <= 1"
            @click="form.paragraphSections.splice(index, 1)"
          />
        </div>
        <UTextarea
          v-model="block.itemsText"
          :rows="5"
          class="w-full"
          :placeholder="$t('هر پاراگراف را با خط خالی جدا کنید')"
        />
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="font-bold text-highlighted">
          {{ $t('فهرست‌ها') }}
        </h3>
        <UButton
          type="button"
          color="primary"
          variant="soft"
          size="xs"
          icon="i-tabler-plus"
          class="cursor-pointer"
          @click="form.listSections.push({ title: '', itemsText: '' })"
        >
          {{ $t('افزودن فهرست') }}
        </UButton>
      </div>
      <div
        v-for="(block, index) in form.listSections"
        :key="`l-${index}`"
        class="space-y-3 rounded-xl border border-muted p-3 bg-muted/30"
      >
        <div class="flex items-center justify-between gap-2">
          <TheFormInput
            v-model="block.title"
            class="flex-1"
            :label="$t('عنوان فهرست')"
          />
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-tabler-trash"
            class="cursor-pointer shrink-0 mt-7"
            @click="form.listSections.splice(index, 1)"
          />
        </div>
        <UFormField
          :label="$t('آیتم‌ها')"
          :help="$t('هر خط یک آیتم')"
        >
          <UTextarea
            v-model="block.itemsText"
            :rows="4"
            class="w-full"
          />
        </UFormField>
      </div>
      <p
        v-if="!form.listSections.length"
        class="text-xs text-muted"
      >
        {{ $t('فهرستی اضافه نشده است') }}
      </p>
    </div>

    <TheSellerSeoFields
      v-model="form.seo"
      :preview-title="form.title"
      :preview-description="form.subtitle"
      :preview-url="form.path"
    />

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        v-if="canSave"
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت صفحه') }}
      </UButton>
      <UButton
        to="/seller/pages"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emptyPageForm,
  pageIdPattern,
  sellerPageStatusMeta,
  sellerPageTemplates,
  toPageForm,
  type SellerManagedPage,
  type SellerPageStatus,
} from '~/data/seller-pages'

const props = defineProps<{
  initial?: SellerManagedPage | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { can } = useSellerPermissions()
const { createPage, updatePage, ensureLoaded } = useSellerPages()

ensureLoaded()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref(props.initial ? toPageForm(props.initial) : emptyPageForm())
const errors = ref<Partial<Record<'id' | 'title' | 'path', string>>>({})
const savedSnapshot = ref(JSON.stringify(form.value))
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)
const { allowNextNavigation } = useSellerUnsavedGuard(isDirty)

const canSave = computed(() =>
  isEdit.value ? can('pages.update') : can('pages.create'),
)

const statusItems = computed(() =>
  (Object.keys(sellerPageStatusMeta) as SellerPageStatus[]).map(value => ({
    value,
    label: t(sellerPageStatusMeta[value].label),
  })),
)

const templateItems = sellerPageTemplates.map(tItem => ({
  value: tItem.value,
  label: t(tItem.label),
}))

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toPageForm(value) : emptyPageForm()
    savedSnapshot.value = JSON.stringify(form.value)
    errors.value = {}
  },
)

function validate() {
  const next: typeof errors.value = {}
  if (!isEdit.value) {
    const id = form.value.id.trim()
    if (!id) next.id = t('شناسه الزامی است')
    else if (!pageIdPattern().test(id)) next.id = t('شناسه نامعتبر است')
  }
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  if (!form.value.path.trim()) next.path = t('مسیر الزامی است')
  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!canSave.value) {
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
      ? updatePage(props.initial!.id, form.value)
      : createPage(form.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(isEdit.value ? t('صفحه به‌روز شد') : t('صفحه اضافه شد'))
    allowNextNavigation()
    savedSnapshot.value = JSON.stringify(form.value)
    await router.push('/seller/pages')
  }
  finally {
    saving.value = false
  }
}
</script>
