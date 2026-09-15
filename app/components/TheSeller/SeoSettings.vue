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

      <div
        v-if="bootPending"
        class="py-16 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-7 text-primary animate-spin"
        />
      </div>

      <template v-else-if="activeTab === 'general'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="form.siteName"
            :label="$t('نام سایت')"
            required
            icon="i-tabler-building-store"
            :disabled="!can('seo.update')"
          />
          <TheFormInput
            v-model="form.siteUrl"
            :label="$t('آدرس سایت')"
            dir="ltr"
            required
            icon="i-tabler-world"
            placeholder="https://example.com"
            :disabled="!can('seo.update')"
          />
          <TheFormInput
            v-model="form.titlePattern"
            class="md:col-span-2"
            :label="$t('الگوی عنوان')"
            dir="ltr"
            :help="$t('از {title} و {site} استفاده کنید')"
            icon="i-tabler-template"
            :disabled="!can('seo.update')"
          />
          <UFormField :label="$t('ربات‌های پیش‌فرض')">
            <USelect
              v-model="form.defaultRobots"
              :items="robotItems"
              value-key="value"
              class="w-full"
              :disabled="!can('seo.update')"
            />
          </UFormField>
          <UFormField :label="$t('کارت توییتر')">
            <USelect
              v-model="form.twitterCard"
              :items="twitterItems"
              value-key="value"
              class="w-full"
              :disabled="!can('seo.update')"
            />
          </UFormField>
          <div class="md:col-span-2 max-w-md">
            <TheSellerImageUpload
              v-model="form.defaultOgImage"
              :label="$t('تصویر Open Graph پیش‌فرض')"
              :alt="$t('OG پیش‌فرض')"
              icon="i-tabler-photo"
              :disabled="!can('seo.update')"
            />
          </div>
        </div>

        <TheSellerFormActions v-if="can('seo.update')">
          <UButton
            type="button"
            color="primary"
            size="lg"
            class="font-bold cursor-pointer"
            :loading="saving || seoPending"
            @click="onSaveSettings"
          >
            {{ $t('ذخیره تنظیمات') }}
          </UButton>
        </TheSellerFormActions>
      </template>

      <template v-else>
        <div
          v-if="redirectsPending && !redirects.length"
          class="py-12 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
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
const { settings, pending: seoPending, fetchSettings, updateSettings } = useSellerSeoSettings()
const {
  redirects,
  pending: redirectsPending,
  fetchRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
} = useSellerRedirects()

const bootPending = ref(true)
const seoLoad = await fetchSettings({ force: true, admin: true })
const redirectsLoad = await fetchRedirects({ force: true, admin: true })
bootPending.value = false
if (!seoLoad.ok) {
  toast.error(t(seoLoad.error || 'بارگذاری تنظیمات سئو ناموفق بود'))
}
if (!redirectsLoad.ok) {
  toast.error(t(redirectsLoad.error || 'بارگذاری ریدایرکت‌ها ناموفق بود'))
}

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

async function onSaveSettings() {
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
    const result = await updateSettings(form.value)
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره تنظیمات سئو ناموفق بود'))
      return
    }
    form.value = { ...result.settings }
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

async function onSaveRedirect() {
  if (!can('seo.update')) {
    toast.error(t('دسترسی ندارید'))
    return
  }
  if (!redirectForm.value.source.trim() || !redirectForm.value.destination.trim()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }
  redirectSaving.value = true
  try {
    const result = editingRedirect.value
      ? await updateRedirect(editingRedirect.value.id, redirectForm.value)
      : await createRedirect(redirectForm.value)
    if (!result.ok) {
      toast.error(t(result.error || 'ذخیره ریدایرکت ناموفق بود'))
      return
    }
    toast.success(editingRedirect.value ? t('ریدایرکت به‌روز شد') : t('ریدایرکت اضافه شد'))
    redirectFormOpen.value = false
  }
  finally {
    redirectSaving.value = false
  }
}

async function confirmRedirectDelete() {
  if (!pendingRedirectDelete.value) return
  const id = pendingRedirectDelete.value.id
  redirectDeleteOpen.value = false
  pendingRedirectDelete.value = null
  const result = await deleteRedirect(id)
  if (!result.ok) {
    toast.error(t(result.error || 'حذف ریدایرکت ناموفق بود'))
    return
  }
  toast.success(t('ریدایرکت حذف شد'))
}
</script>
