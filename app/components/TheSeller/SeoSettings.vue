<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <TheSellerPageHeader
        :title="$t('تنظیمات سئو')"
        :description="$t('تنظیمات سراسری سئو سایت و ریدایرکت‌ها')"
      />

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-5">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          size="sm"
          :color="activeTab === tab.id ? 'primary' : 'neutral'"
          :variant="activeTab === tab.id ? 'soft' : 'ghost'"
          class="shrink-0 cursor-pointer"
          @click="activeTab = tab.id"
        >
          {{ $t(tab.label) }}
        </UButton>
      </div>

      <template v-if="activeTab === 'general'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.siteName"
            :label="$t('نام سایت')"
            required
            icon="i-tabler-building-store"
          />
          <TheFormInput
            v-model="form.siteUrl"
            :label="$t('آدرس سایت')"
            dir="ltr"
            required
            icon="i-tabler-world"
            placeholder="https://example.com"
          />
          <TheFormInput
            v-model="form.titlePattern"
            class="md:col-span-2"
            :label="$t('الگوی عنوان')"
            dir="ltr"
            :help="$t('از {title} و {site} استفاده کنید')"
            icon="i-tabler-template"
          />
          <UFormField :label="$t('ربات‌های پیش‌فرض')">
            <USelect
              v-model="form.defaultRobots"
              :items="robotItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('کارت توییتر')">
            <USelect
              v-model="form.twitterCard"
              :items="twitterItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <div class="md:col-span-2 max-w-md">
            <TheSellerImageUpload
              v-model="form.defaultOgImage"
              :label="$t('تصویر Open Graph پیش‌فرض')"
              :alt="$t('OG پیش‌فرض')"
              icon="i-tabler-photo"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3 flex-wrap">
          <UButton
            v-if="can('seo.update')"
            type="button"
            color="primary"
            size="lg"
            class="font-bold cursor-pointer"
            :loading="saving"
            @click="onSaveSettings"
          >
            {{ $t('ذخیره تنظیمات') }}
          </UButton>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <p class="text-xs text-muted">
            {{ redirects.length.toLocaleString('fa-IR') }} {{ $t('ریدایرکت') }}
          </p>
          <UButton
            v-if="can('seo.update')"
            type="button"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="openRedirectCreate"
          >
            {{ $t('افزودن ریدایرکت') }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="!redirects.length"
          icon="i-tabler-arrows-right-left"
          :message="$t('هنوز ریدایرکتی ثبت نشده است')"
        />

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="item in redirects"
            :key="item.id"
            class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
          >
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="min-w-0 space-y-1">
                <div
                  class="text-sm font-medium text-highlighted num"
                  dir="ltr"
                >
                  {{ item.source }} → {{ item.destination }}
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <UBadge
                    :color="sellerRedirectTypeMeta[item.type].color"
                    variant="subtle"
                    size="xs"
                  >
                    {{ item.type }}
                  </UBadge>
                  <UBadge
                    :color="item.active ? 'success' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ item.active ? $t('فعال') : $t('غیرفعال') }}
                  </UBadge>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  v-if="can('seo.update')"
                  type="button"
                  color="primary"
                  variant="soft"
                  size="xs"
                  icon="i-tabler-pencil"
                  class="cursor-pointer"
                  @click="openRedirectEdit(item)"
                >
                  {{ $t('ویرایش') }}
                </UButton>
                <UButton
                  v-if="can('seo.update')"
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  class="cursor-pointer"
                  @click="openRedirectDelete(item)"
                >
                  {{ $t('حذف') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <UModal
      v-model:open="redirectFormOpen"
      :title="editingRedirect ? $t('ویرایش ریدایرکت') : $t('افزودن ریدایرکت')"
    >
      <template #body>
        <div class="space-y-4">
          <TheFormInput
            v-model="redirectForm.source"
            :label="$t('مبدأ')"
            dir="ltr"
            required
            placeholder="/old-path"
          />
          <TheFormInput
            v-model="redirectForm.destination"
            :label="$t('مقصد')"
            dir="ltr"
            required
            placeholder="/new-path"
          />
          <UFormField :label="$t('نوع')">
            <USelect
              v-model="redirectForm.type"
              :items="redirectTypeItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UCheckbox
            v-model="redirectForm.active"
            :label="$t('فعال')"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="redirectFormOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="primary"
            class="font-bold cursor-pointer"
            :loading="redirectSaving"
            @click="onSaveRedirect"
          >
            {{ $t('ذخیره') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="redirectDeleteOpen"
      :title="$t('حذف ریدایرکت')"
    >
      <template #body>
        <div
          v-if="pendingRedirectDelete"
          class="text-sm num"
          dir="ltr"
        >
          {{ pendingRedirectDelete.source }} → {{ pendingRedirectDelete.destination }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer"
            @click="redirectDeleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold cursor-pointer"
            @click="confirmRedirectDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { seoRobotsOptions, type SeoRobots } from '~/data/seo'
import type { SellerSeoSiteSettings } from '~/data/seo-site'
import {
  emptyRedirectForm,
  sellerRedirectTypeMeta,
  toRedirectForm,
  type SellerRedirect,
  type SellerRedirectForm,
  type SellerRedirectType,
} from '~/data/seller-redirects'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const { settings, ensureLoaded, updateSettings } = useSellerSeoSettings()
const {
  redirects,
  ensureLoaded: ensureRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
} = useSellerRedirects()

ensureLoaded()
ensureRedirects()

const activeTab = ref<'general' | 'redirects'>('general')
const tabs = [
  { id: 'general' as const, label: 'عمومی' },
  { id: 'redirects' as const, label: 'ریدایرکت‌ها' },
]

const form = ref<SellerSeoSiteSettings>({ ...settings.value })
const saving = ref(false)

watch(settings, (value) => {
  form.value = { ...value }
}, { deep: true })

const robotItems = seoRobotsOptions.map(o => ({
  label: o.label,
  value: o.value as SeoRobots,
}))

const twitterItems = [
  { value: 'summary_large_image', label: t('خلاصه بزرگ') },
  { value: 'summary', label: t('خلاصه') },
]

const redirectFormOpen = ref(false)
const editingRedirect = ref<SellerRedirect | null>(null)
const redirectForm = ref<SellerRedirectForm>(emptyRedirectForm())
const redirectSaving = ref(false)
const redirectDeleteOpen = ref(false)
const pendingRedirectDelete = ref<SellerRedirect | null>(null)

const redirectTypeItems = ([301, 308, 302] as SellerRedirectType[]).map(value => ({
  value,
  label: `${value} — ${t(sellerRedirectTypeMeta[value].label)}`,
}))

function onSaveSettings() {
  if (!can('seo.update')) {
    toast.error(t('دسترسی ندارید'))
    return
  }
  if (!form.value.siteName.trim() || !form.value.siteUrl.trim()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  saving.value = true
  try {
    updateSettings(form.value)
    toast.success(t('تنظیمات سئو ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

function openRedirectCreate() {
  editingRedirect.value = null
  redirectForm.value = emptyRedirectForm()
  redirectFormOpen.value = true
}

function openRedirectEdit(item: SellerRedirect) {
  editingRedirect.value = item
  redirectForm.value = toRedirectForm(item)
  redirectFormOpen.value = true
}

function openRedirectDelete(item: SellerRedirect) {
  pendingRedirectDelete.value = item
  redirectDeleteOpen.value = true
}

function onSaveRedirect() {
  redirectSaving.value = true
  try {
    const result = editingRedirect.value
      ? updateRedirect(editingRedirect.value.id, redirectForm.value)
      : createRedirect(redirectForm.value)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(editingRedirect.value ? t('ریدایرکت به‌روز شد') : t('ریدایرکت اضافه شد'))
    redirectFormOpen.value = false
  }
  finally {
    redirectSaving.value = false
  }
}

function confirmRedirectDelete() {
  if (!pendingRedirectDelete.value) return
  const result = deleteRedirect(pendingRedirectDelete.value.id)
  redirectDeleteOpen.value = false
  pendingRedirectDelete.value = null
  if (!result.ok) {
    toast.error(t(result.error))
    return
  }
  toast.success(t('ریدایرکت حذف شد'))
}
</script>
