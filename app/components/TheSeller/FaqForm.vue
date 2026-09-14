<template>
  <div class="space-y-5">
    <div
      v-if="!ready"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-8 text-primary animate-spin"
      />
    </div>

    <div
      v-else-if="loadError && !page"
      class="py-10 space-y-4 text-center"
    >
      <p class="text-sm text-error">
        {{ loadError }}
      </p>
      <UButton
        type="button"
        color="primary"
        variant="soft"
        class="cursor-pointer"
        :loading="pending"
        @click="load"
      >
        {{ $t('تلاش مجدد') }}
      </UButton>
    </div>

    <template v-else>
      <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
        <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 class="font-bold text-highlighted">
              {{ $t('صفحه سوالات متداول') }}
            </h2>
            <p class="text-xs text-muted mt-1 leading-6">
              {{ $t('عنوان، وضعیت و محتوای FAQ که در /faq نمایش داده می‌شود.') }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              :color="sellerPageStatusMeta[form.status].color"
              variant="subtle"
              size="md"
            >
              {{ $t(sellerPageStatusMeta[form.status].label) }}
            </UBadge>
            <UButton
              to="/faq"
              target="_blank"
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-tabler-external-link"
              class="cursor-pointer"
            >
              {{ $t('مشاهده در سایت') }}
            </UButton>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.title"
            :label="$t('عنوان')"
            required
            :error="errors.title"
            icon="i-tabler-heading"
          />
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="form.status"
              :items="statusItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <TheSellerIconPicker
            v-model="form.icon"
            :label="$t('آیکون')"
          />
          <TheFormInput
            v-model="form.path"
            :label="$t('مسیر')"
            dir="ltr"
            icon="i-tabler-link"
            disabled
          />
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

      <TheSellerFaqEditor
        ref="faqEditorRef"
        v-model:categories="form.faqCategories"
        v-model:items="form.faqItems"
      />

      <TheSellerSeoFields
        v-model="form.seo"
        :preview-title="form.title"
        :preview-description="form.subtitle"
        :preview-url="form.path"
      />

      <TheSellerFormActions>
        <UButton
          v-if="pageExists ? can('pages.update') : can('pages.create')"
          type="button"
          color="primary"
          size="lg"
          class="font-bold cursor-pointer"
          :loading="saving"
          @click="onSave"
        >
          {{ $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          to="/faq"
          target="_blank"
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
        >
          {{ $t('پیش‌نمایش') }}
        </UButton>
      </TheSellerFormActions>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  emptyPageForm,
  sellerPageStatusMeta,
  toPageForm,
  type SellerManagedPage,
  type SellerPageFormValues,
  type SellerPageStatus,
} from '~/data/seller-pages'
import { faqCategories, faqItems, staticPages } from '~/data/static-pages'
import { emptySeoMeta } from '~/data/seo'

const FAQ_ID = 'faq'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { fetchById, createPage, updatePage, pending } = useSellerPages()
const { invalidate } = useStaticPages()

const ready = ref(false)
const loadError = ref('')
const page = ref<SellerManagedPage | null>(null)
const form = ref<SellerPageFormValues>(emptyPageForm())
const saving = ref(false)
const errors = ref<Partial<Record<'title', string>>>({})
const faqEditorRef = ref<{ validate: () => boolean } | null>(null)
const savedSnapshot = ref('')
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)
const { allowNextNavigation } = useSellerUnsavedGuard(isDirty)
const pageExists = ref(false)

const statusItems = computed(() =>
  (Object.keys(sellerPageStatusMeta) as SellerPageStatus[]).map(value => ({
    value,
    label: t(sellerPageStatusMeta[value].label),
  })),
)

function seedFallbackPage(): SellerManagedPage {
  const seed = staticPages.faq
  const now = new Date().toISOString()
  return {
    ...seed,
    id: FAQ_ID,
    sourceId: 'faq',
    status: 'published',
    seo: emptySeoMeta(),
    publishedAt: now,
    template: 'faq',
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        type: 'faq',
        categories: faqCategories.map(c => ({ ...c })),
        items: faqItems.map(i => ({ ...i })),
      },
    ],
  }
}

function applyPage(next: SellerManagedPage, exists = true) {
  pageExists.value = exists
  page.value = next
  form.value = {
    ...toPageForm(next),
    template: 'faq',
    id: FAQ_ID,
    path: next.path || '/faq',
  }
  if (!form.value.faqCategories.length) {
    form.value.faqCategories = faqCategories.map(c => ({ ...c }))
  }
  if (!form.value.faqItems.length) {
    form.value.faqItems = faqItems.map(i => ({ ...i }))
  }
  savedSnapshot.value = JSON.stringify(form.value)
  errors.value = {}
}

async function load() {
  ready.value = false
  loadError.value = ''
  const result = await fetchById(FAQ_ID, { force: true })
  if (!result.ok || !result.page) {
    applyPage(seedFallbackPage(), false)
    loadError.value = result.error
      ? t('بارگذاری از سرور ناموفق بود؛ پیش‌فرض محلی نمایش داده شد')
      : ''
    ready.value = true
    return
  }
  applyPage(result.page, true)
  ready.value = true
}

function validate() {
  const next: typeof errors.value = {}
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  errors.value = next
  const faqOk = faqEditorRef.value?.validate() ?? false
  if (!form.value.faqCategories.length || !form.value.faqItems.length) {
    toast.warning(t('حداقل یک دسته و یک سوال لازم است'))
    return false
  }
  return !Object.keys(next).length && faqOk
}

async function onSave() {
  if (pageExists.value ? !can('pages.update') : !can('pages.create')) {
    toast.error(t('دسترسی ندارید'))
    return
  }
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  saving.value = true
  try {
    const payload: SellerPageFormValues = {
      ...form.value,
      id: FAQ_ID,
      template: 'faq',
      path: form.value.path.trim() || '/faq',
      status: form.value.status || 'published',
    }
    const result = pageExists.value
      ? await updatePage(FAQ_ID, payload)
      : await createPage(payload)
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره ناموفق بود'))
      return
    }
    invalidate(FAQ_ID)
    applyPage(result.page!, true)
    allowNextNavigation()
    toast.success(t('سوالات متداول ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
