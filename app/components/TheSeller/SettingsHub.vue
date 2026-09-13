<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-5">
    <TheSellerPageHeader
      :title="$t('تنظیمات پلتفرم')"
      :description="$t('پیکربندی فروشگاه، هویت بصری و ترجیحات پلتفرم')"
    >
      <template
        v-if="canSave && dirty"
        #actions
      >
        <UButton
          color="primary"
          size="sm"
          class="cursor-pointer font-bold"
          :loading="saving"
          @click="onSave"
        >
          {{ $t('ذخیره') }}
        </UButton>
      </template>
    </TheSellerPageHeader>

    <div class="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      <UButton
        v-for="tab in platformSettingsTabs"
        :key="tab.id"
        type="button"
        size="sm"
        :color="activeTab === tab.id ? 'primary' : 'neutral'"
        :variant="activeTab === tab.id ? 'soft' : 'ghost'"
        class="cursor-pointer shrink-0"
        @click="setTab(tab.id)"
      >
        {{ $t(tab.label) }}
      </UButton>
    </div>

    <p
      v-if="isPrefTab"
      class="text-[11px] text-muted leading-5"
    >
      {{ $t('این بخش در سرور ذخیره می‌شود و روی رفتار فروشگاه اثر می‌گذارد.') }}
    </p>

    <div
      v-if="bootPending"
      class="py-16 grid place-items-center"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="size-7 text-primary animate-spin"
      />
    </div>

    <template v-else>
      <!-- general -->
      <div
        v-if="activeTab === 'general'"
        class="space-y-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheFormInput
            v-model="shopForm.name"
            :label="$t('نام سایت')"
            :disabled="!canSave"
          />
          <TheFormInput
            v-model="shopForm.phone"
            :label="$t('شماره تماس')"
            dir="ltr"
            :disabled="!canSave"
          />
          <TheFormInput
            v-model="shopForm.email"
            :label="$t('ایمیل')"
            dir="ltr"
            :disabled="!canSave"
          />
          <TheFormInput
            v-model="shopForm.city"
            :label="$t('شهر')"
            :disabled="!canSave"
          />
          <TheFormInput
            v-model="platform.brandName"
            :label="$t('نام برند')"
            :disabled="!canSave"
          />
          <TheFormInput
            v-model="platform.brandDescription"
            :label="$t('توضیح برند')"
            :disabled="!canSave"
          />
        </div>
        <UFormField :label="$t('درباره سایت')">
          <UTextarea
            v-model="shopForm.about"
            :rows="4"
            autoresize
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
      </div>

      <!-- branding -->
      <div
        v-else-if="activeTab === 'branding'"
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <TheSellerImageUpload
          v-model="platform.logoUrl"
          :label="$t('لوگو')"
          :disabled="!canSave"
        />
        <TheSellerImageUpload
          v-model="platform.faviconUrl"
          :label="$t('فاوآیکون')"
          :disabled="!canSave"
        />
        <TheSellerImageUpload
          v-model="platform.defaultOgImage"
          :label="$t('تصویر Open Graph')"
          :disabled="!canSave"
        />
      </div>

      <!-- contact -->
      <div
        v-else-if="activeTab === 'contact'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TheFormInput
          v-model="platform.supportPhone"
          :label="$t('تلفن پشتیبانی')"
          dir="ltr"
          :disabled="!canSave"
        />
        <TheFormInput
          v-model="platform.salesPhone"
          :label="$t('تلفن فروش')"
          dir="ltr"
          :disabled="!canSave"
        />
        <TheFormInput
          v-model="platform.supportEmail"
          :label="$t('ایمیل پشتیبانی')"
          dir="ltr"
          :disabled="!canSave"
        />
        <TheFormInput
          v-model="platform.workingHours"
          :label="$t('ساعات کاری')"
          :disabled="!canSave"
        />
        <UFormField
          class="md:col-span-2"
          :label="$t('آدرس')"
        >
          <UTextarea
            v-model="platform.address"
            :rows="3"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
      </div>

      <!-- localization -->
      <div
        v-else-if="activeTab === 'localization'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <UFormField :label="$t('زبان پیش‌فرض')">
          <USelect
            v-model="platform.defaultLocale"
            :items="localeItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
        <UFormField :label="$t('واحد پول')">
          <USelect
            v-model="platform.currencyLabel"
            :items="currencyItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
        <TheFormInput
          v-model="platform.dateFormatHint"
          :label="$t('قالب تاریخ')"
          dir="ltr"
          :disabled="!canSave"
        />
        <UFormField :label="$t('قالب عدد')">
          <USelect
            v-model="platform.numberFormatHint"
            :items="numberFormatItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
        <UFormField
          class="md:col-span-2"
          :label="$t('منطقه زمانی')"
        >
          <USelect
            v-model="platform.timezone"
            :items="timezoneItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
      </div>

      <!-- commerce -->
      <div
        v-else-if="activeTab === 'commerce'"
        class="space-y-4"
      >
        <TheFormInput
          v-model.number="platform.minOrderAmount"
          type="number"
          :label="$t('حداقل مبلغ سفارش')"
          :disabled="!canSave"
        />
        <UCheckbox
          v-model="platform.guestCheckoutEnabled"
          :label="$t('خرید مهمان')"
          :disabled="!canSave"
        />
        <UFormField :label="$t('رفتار ناموجودی')">
          <USelect
            v-model="platform.outOfStockBehavior"
            :items="stockItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
        <UFormField :label="$t('نمایش مالیات')">
          <USelect
            v-model="platform.taxDisplay"
            :items="taxItems"
            value-key="value"
            class="w-full"
            :disabled="!canSave"
          />
        </UFormField>
      </div>

      <!-- orders -->
      <div
        v-else-if="activeTab === 'orders'"
        class="space-y-4"
      >
        <TheFormInput
          v-model.number="platform.returnWindowDays"
          type="number"
          :label="$t('مهلت مرجوعی (روز)')"
          :disabled="!canSave"
        />
        <div>
          <div class="text-sm mb-2">
            {{ $t('وضعیت‌های قابل لغو') }}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <UCheckbox
              v-for="status in cancelStatusOptions"
              :key="status.value"
              :model-value="cancelStatusSet.has(status.value)"
              :label="$t(status.label)"
              :disabled="!canSave"
              @update:model-value="(v: boolean | 'indeterminate') => toggleCancelStatus(status.value, Boolean(v))"
            />
          </div>
        </div>
      </div>

      <!-- shipping -->
      <div
        v-else-if="activeTab === 'shipping'"
        class="space-y-4"
      >
        <TheFormInput
          v-model.number="platform.freeShippingThreshold"
          type="number"
          :label="$t('آستانه ارسال رایگان')"
          :disabled="!canSave"
        />
        <TheFormInput
          v-model="platform.deliveryEstimateText"
          :label="$t('متن تخمین تحویل')"
          :disabled="!canSave"
        />
        <UCheckbox
          v-model="platform.shippingMethodsVisible"
          :label="$t('نمایش روش‌های ارسال')"
          :disabled="!canSave"
        />
        <UButton
          to="/seller/shipping"
          color="neutral"
          variant="outline"
          icon="i-tabler-truck-delivery"
          class="cursor-pointer"
        >
          {{ $t('مدیریت روش‌های ارسال') }}
        </UButton>
      </div>

      <!-- notifications -->
      <div
        v-else-if="activeTab === 'notifications'"
        class="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <UCheckbox
          v-for="item in notifyFields"
          :key="item.key"
          v-model="platform[item.key]"
          :label="$t(item.label)"
          :disabled="!canSave"
        />
      </div>

      <!-- payments -->
      <div
        v-else-if="activeTab === 'payments'"
        class="space-y-4"
      >
        <div class="bg-muted border border-muted rounded-2xl p-4 space-y-3">
          <div class="font-medium text-highlighted">
            {{ $t('روش‌های پرداخت در فروشگاه') }}
          </div>
          <p class="text-[11px] text-muted leading-5">
            {{ $t('روش‌های فعال در مرحله پرداخت سبد خرید نمایش داده می‌شوند.') }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <UCheckbox
              v-model="platform.onlinePaymentEnabled"
              :label="$t('پرداخت آنلاین')"
              :disabled="!canSave"
            />
            <UCheckbox
              v-model="platform.codPaymentEnabled"
              :label="$t('پرداخت در محل')"
              :disabled="!canSave"
            />
            <UCheckbox
              v-model="platform.installmentPaymentEnabled"
              :label="$t('پرداخت اقساطی')"
              :disabled="!canSave"
            />
          </div>
        </div>

        <div
          v-if="systemPending"
          class="py-8 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div
            v-for="card in paymentCards"
            :key="card.id"
            class="bg-muted border border-muted rounded-2xl p-4"
          >
            <div class="font-medium text-highlighted">
              {{ $t(card.title) }}
            </div>
            <p class="text-[11px] text-muted mt-2 leading-5">
              {{ $t(card.note) }}
            </p>
            <UBadge
              class="mt-3"
              :color="card.color"
              variant="subtle"
              size="xs"
            >
              {{ $t(card.status) }}
            </UBadge>
          </div>
        </div>
        <UButton
          to="/seller/finance/gateways"
          color="primary"
          variant="soft"
          icon="i-tabler-credit-card"
          class="cursor-pointer"
        >
          {{ $t('درگاه‌های پرداخت') }}
        </UButton>
      </div>

      <!-- seo -->
      <div
        v-else-if="activeTab === 'seo'"
        class="space-y-4"
      >
        <div
          v-if="seoPending"
          class="py-8 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="bg-muted border border-muted rounded-2xl p-5 space-y-3"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('نام سایت') }}
              </div>
              <div class="text-highlighted font-medium">
                {{ seoSettings.siteName || '—' }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('آدرس سایت') }}
              </div>
              <div
                class="text-highlighted font-medium num"
                dir="ltr"
              >
                {{ seoSettings.siteUrl || '—' }}
              </div>
            </div>
            <div class="sm:col-span-2">
              <div class="text-[11px] text-muted">
                {{ $t('الگوی عنوان') }}
              </div>
              <div
                class="text-highlighted font-medium num"
                dir="ltr"
              >
                {{ seoSettings.titlePattern || '—' }}
              </div>
            </div>
          </div>
        </div>
        <UButton
          to="/seller/seo"
          color="primary"
          variant="soft"
          icon="i-tabler-seo"
          class="cursor-pointer"
        >
          {{ $t('ویرایش سئو') }}
        </UButton>
      </div>

      <!-- footer -->
      <div
        v-else-if="activeTab === 'footer'"
        class="space-y-4"
      >
        <div
          v-if="footerPending"
          class="py-8 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="bg-muted border border-muted rounded-2xl p-5 space-y-3 text-sm"
        >
          <div>
            <div class="text-[11px] text-muted">
              {{ $t('درباره') }}
            </div>
            <p class="text-toned leading-6 line-clamp-3">
              {{ footerSummary.about || '—' }}
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('تلفن‌ها') }}
              </div>
              <div class="text-highlighted">
                {{ footerSummary.phones || '—' }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('ایمیل') }}
              </div>
              <div class="text-highlighted">
                {{ footerSummary.email || '—' }}
              </div>
            </div>
          </div>
          <div class="text-[11px] text-muted">
            {{ footerSummary.counts }}
          </div>
        </div>
        <UButton
          to="/seller/footer"
          color="primary"
          variant="soft"
          icon="i-tabler-layout-bottombar"
          class="cursor-pointer"
        >
          {{ $t('ویرایش فوتر') }}
        </UButton>
      </div>

      <!-- integrations -->
      <div
        v-else-if="activeTab === 'integrations'"
        class="space-y-4"
      >
        <div
          v-if="systemPending"
          class="py-8 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div
            v-for="card in integrationCards"
            :key="card.id"
            class="bg-muted border border-muted rounded-2xl p-4"
          >
            <div class="font-medium text-highlighted">
              {{ $t(card.title) }}
            </div>
            <p class="text-[11px] text-muted mt-2 leading-5">
              {{ $t(card.note) }}
            </p>
            <UBadge
              class="mt-3"
              :color="card.color"
              variant="subtle"
              size="xs"
            >
              {{ $t(card.status) }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- security -->
      <div
        v-else-if="activeTab === 'security'"
        class="space-y-4"
      >
        <div
          v-if="systemPending"
          class="py-8 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-6 text-primary animate-spin"
          />
        </div>
        <div
          v-else
          class="bg-muted border border-muted rounded-2xl p-5 space-y-3"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('ادمین‌های فعال') }}
              </div>
              <div class="text-highlighted font-medium num">
                {{ overview.stats.admins.active }} / {{ overview.stats.admins.total }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('نقش‌ها') }}
              </div>
              <div class="text-highlighted font-medium num">
                {{ overview.stats.roles.total }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('ورود ادمین') }}
              </div>
              <div class="text-highlighted font-medium">
                {{ securityInfo.adminAuthLabel }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted">
                {{ $t('پیامک / OTP') }}
              </div>
              <div class="text-highlighted font-medium">
                {{ securityInfo.otpLabel }}
              </div>
            </div>
          </div>
          <UBadge
            :color="securityInfo.twoFactorColor"
            variant="subtle"
          >
            {{ $t(securityInfo.twoFactorLabel) }}
          </UBadge>
        </div>
        <div class="flex gap-2 flex-wrap">
          <UButton
            to="/seller/admins"
            color="primary"
            variant="soft"
            icon="i-tabler-user-shield"
            class="cursor-pointer"
          >
            {{ $t('کاربران ادمین') }}
          </UButton>
          <UButton
            to="/seller/roles"
            color="neutral"
            variant="outline"
            icon="i-tabler-lock"
            class="cursor-pointer"
          >
            {{ $t('نقش‌ها') }}
          </UButton>
        </div>
      </div>

      <div
        v-if="canSave && dirty && !isLinkOnlyTab"
        class="flex gap-2 flex-wrap pt-2"
      >
        <UButton
          color="primary"
          size="lg"
          class="cursor-pointer font-bold"
          :loading="saving"
          @click="onSave"
        >
          {{ $t('ذخیره تغییرات') }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="cursor-pointer"
          @click="resetDraft"
        >
          {{ $t('انصراف') }}
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  platformSettingsTabs,
  type PlatformSettingsTabId,
  type SellerPlatformSettings,
} from '~/data/seller-platform-settings'
import { adminFullName } from '~/data/seller-admins'
import type { SellerShop } from '~/data/seller'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()
const { can } = useSellerPermissions()
const { settings, pending: settingsPending, fetchSettings, updateSettings } = useSellerPlatformSettings()
const { shop, pending: shopPending, fetchShop, updateShop } = useSeller()
const { applySite } = useSiteSettings()
const { currentAdminUser } = useSellerAdmins()
const { overview, pending: systemPending, fetchOverview } = useSellerSystem()
const {
  settings: seoSettings,
  pending: seoPending,
  fetchSettings: fetchSeoSettings,
} = useSellerSeoSettings()
const { footer, pending: footerPending, fetchFooter } = useFooter()

const bootPending = computed(() => shopPending.value || settingsPending.value)

const shopLoad = await fetchShop({ force: true })
const settingsLoad = await fetchSettings({ force: true })
if (!shopLoad.ok) {
  toast.error(t('بارگذاری تنظیمات سایت ناموفق بود'))
}
if (!settingsLoad.ok) {
  toast.error(t(settingsLoad.error || 'بارگذاری تنظیمات پلتفرم ناموفق بود'))
}
await Promise.all([
  fetchOverview({ force: true }),
  fetchSeoSettings({ force: true }),
  fetchFooter({ force: true, admin: true }),
])

const canSave = computed(() => can('settings.update'))
const saving = ref(false)

const tabFromQuery = computed(() => {
  const raw = String(route.query.tab || 'general')
  return platformSettingsTabs.some(tab => tab.id === raw)
    ? (raw as PlatformSettingsTabId)
    : 'general'
})

const activeTab = ref<PlatformSettingsTabId>(tabFromQuery.value)

watch(tabFromQuery, (v) => {
  activeTab.value = v
})

function setTab(id: PlatformSettingsTabId) {
  activeTab.value = id
  router.replace({ query: { ...route.query, tab: id } })
}

const prefTabs: PlatformSettingsTabId[] = [
  'general',
  'localization',
  'commerce',
  'orders',
  'shipping',
  'payments',
  'notifications',
  'branding',
  'contact',
]
const isPrefTab = computed(() => prefTabs.includes(activeTab.value))
const isLinkOnlyTab = computed(() =>
  ['seo', 'footer', 'integrations', 'security'].includes(activeTab.value),
)

const shopForm = ref<SellerShop>({ ...shop.value })
const platform = ref<SellerPlatformSettings>({ ...settings.value })

function serialize() {
  return JSON.stringify({ shop: shopForm.value, platform: platform.value })
}

const snapshot = ref(serialize())
const dirty = computed(() => serialize() !== snapshot.value)

watch(shop, (v) => {
  if (dirty.value) return
  shopForm.value = { ...v }
  snapshot.value = serialize()
})
watch(settings, (v) => {
  // Don't clobber in-progress edits (e.g. cleared logo before save)
  if (dirty.value) return
  platform.value = { ...v }
  snapshot.value = serialize()
})

const localeItems = [
  { value: 'fa', label: t('فارسی') },
  { value: 'en', label: t('انگلیسی') },
]
const currencyItems = [
  { value: 'تومان', label: t('تومان') },
  { value: 'ریال', label: t('ریال') },
]
const numberFormatItems = [
  { value: 'fa-IR', label: 'fa-IR' },
  { value: 'en-US', label: 'en-US' },
]
const timezoneItems = [
  { value: 'Asia/Tehran', label: 'Asia/Tehran' },
  { value: 'UTC', label: 'UTC' },
]

const stockItems = [
  { value: 'hide', label: t('مخفی') },
  { value: 'show_unavailable', label: t('نمایش ناموجود') },
  { value: 'allow_backorder', label: t('سفارش پیش‌فروش') },
]
const taxItems = [
  { value: 'inclusive', label: t('شامل مالیات') },
  { value: 'exclusive', label: t('بدون مالیات در قیمت') },
  { value: 'none', label: t('بدون مالیات') },
]

const cancelStatusOptions = [
  { value: 'new', label: 'جدید' },
  { value: 'packing', label: 'در حال آماده‌سازی' },
  { value: 'shipped', label: 'ارسال‌شده' },
  { value: 'delivered', label: 'تحویل‌شده' },
]

const cancelStatusSet = computed(() => new Set(
  String(platform.value.cancelAllowedStatuses || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
))

function toggleCancelStatus(status: string, enabled: boolean) {
  const next = new Set(cancelStatusSet.value)
  if (enabled) next.add(status)
  else next.delete(status)
  platform.value.cancelAllowedStatuses = [...next].join(',')
}

const notifyFields = [
  { key: 'notifyAdminNewOrder' as const, label: 'اعلان سفارش جدید به ادمین' },
  { key: 'notifyAdminFailedPayment' as const, label: 'اعلان پرداخت ناموفق' },
  { key: 'notifyAdminLowStock' as const, label: 'اعلان موجودی کم' },
  { key: 'notifyAdminReturn' as const, label: 'اعلان مرجوعی' },
  { key: 'notifyAdminRefund' as const, label: 'اعلان بازپرداخت' },
  { key: 'notifyCustomerOrderStatus' as const, label: 'اعلان وضعیت سفارش به مشتری' },
  { key: 'notifyCustomerPayment' as const, label: 'اعلان پرداخت به مشتری' },
  { key: 'notifyCustomerShipping' as const, label: 'اعلان ارسال به مشتری' },
  { key: 'notifyCustomerMarketing' as const, label: 'اعلان بازاریابی به مشتری' },
]

function mapIntegrationCard(item: { id: string, label: string, status: string, hint?: string }) {
  let color: 'success' | 'info' | 'neutral' | 'warning' = 'neutral'
  let status = 'پیکربندی نشده'
  if (item.status === 'live') {
    color = 'success'
    status = 'زنده'
  }
  else if (item.status === 'sandbox' || item.status === 'mock') {
    color = 'info'
    status = item.status === 'sandbox' ? 'سندباکس' : 'mock'
  }
  else if (item.status === 'unconfigured') {
    color = 'warning'
  }
  return {
    id: item.id,
    title: item.label,
    note: item.hint || '',
    status,
    color,
  }
}

const integrationCards = computed(() => {
  const fromApi = overview.value.integrations
  if (fromApi.length) return fromApi.map(mapIntegrationCard)
  return [
    { id: 'zarinpal', title: 'زرین‌پال', note: 'وضعیت واقعی از درگاه‌های مالی', status: 'زنده', color: 'info' as const },
    { id: 'sms', title: 'پیامک', note: 'سرویس پیامک هنوز متصل نشده', status: 'پیکربندی نشده', color: 'neutral' as const },
    { id: 'email', title: 'ایمیل', note: 'ارسال تراکنشی پیکربندی نشده', status: 'پیکربندی نشده', color: 'neutral' as const },
  ]
})

const paymentCards = computed(() =>
  integrationCards.value.filter(c => c.id === 'zarinpal' || c.title.includes('زرین')),
)

const footerSummary = computed(() => {
  const phones = (footer.value.contact?.phones || []).map(p => p.label).filter(Boolean).join(' ، ')
  const email = footer.value.contact?.email?.label || ''
  const counts = [
    `${(footer.value.columns || []).length} ${t('ستون')}`,
    `${(footer.value.socials || []).length} ${t('سوشال')}`,
    `${(footer.value.trustItems || []).length} ${t('اعتماد')}`,
  ].join(' · ')
  return {
    about: footer.value.about || '',
    phones,
    email,
    counts,
  }
})

const securityInfo = computed(() => {
  const sec = overview.value.security
  return {
    adminAuthLabel: sec?.adminAuth === 'password' ? t('رمز عبور پنل') : String(sec?.adminAuth || '—'),
    otpLabel: sec?.hasSmsProvider
      ? t('کاوه‌نگار فعال')
      : sec?.otpMock
        ? t('OTP mock')
        : t('پیکربندی نشده'),
    twoFactorLabel: sec?.twoFactorConfigured ? '۲FA فعال' : '۲FA پیکربندی نشده',
    twoFactorColor: (sec?.twoFactorConfigured ? 'success' : 'neutral') as 'success' | 'neutral',
  }
})

function resetDraft() {
  shopForm.value = { ...shop.value }
  platform.value = { ...settings.value }
  snapshot.value = serialize()
}

async function onSave() {
  if (!canSave.value) return
  saving.value = true
  try {
    const actor = currentAdminUser()
    const actorPayload = actor
      ? { id: actor.id, name: adminFullName(actor) }
      : undefined

    if (activeTab.value === 'general') {
      const { result, error } = await updateShop(shopForm.value)
      if (error || !result) {
        toast.error(t('ذخیره تنظیمات سایت ناموفق بود'))
        return
      }
      shopForm.value = { ...result }
    }

    const platformResult = await updateSettings({ ...platform.value }, actorPayload)
    if (!platformResult.ok) {
      toast.error(t(platformResult.error || 'ذخیره تنظیمات پلتفرم ناموفق بود'))
      return
    }
    platform.value = { ...platformResult.settings }

    applySite({
      ...shop.value,
      logoUrl: platform.value.logoUrl,
      faviconUrl: platform.value.faviconUrl,
      defaultOgImage: platform.value.defaultOgImage,
      brandName: platform.value.brandName || shop.value.name,
      brandDescription: platform.value.brandDescription,
      supportPhone: platform.value.supportPhone,
      salesPhone: platform.value.salesPhone,
      supportEmail: platform.value.supportEmail,
      address: platform.value.address,
      workingHours: platform.value.workingHours,
      defaultLocale: platform.value.defaultLocale,
      currencyLabel: platform.value.currencyLabel,
      dateFormatHint: platform.value.dateFormatHint,
      numberFormatHint: platform.value.numberFormatHint,
      timezone: platform.value.timezone,
      minOrderAmount: platform.value.minOrderAmount,
      guestCheckoutEnabled: platform.value.guestCheckoutEnabled,
      outOfStockBehavior: platform.value.outOfStockBehavior,
      taxDisplay: platform.value.taxDisplay,
      freeShippingThreshold: platform.value.freeShippingThreshold,
      deliveryEstimateText: platform.value.deliveryEstimateText,
      shippingMethodsVisible: platform.value.shippingMethodsVisible,
      onlinePaymentEnabled: platform.value.onlinePaymentEnabled,
      codPaymentEnabled: platform.value.codPaymentEnabled,
      installmentPaymentEnabled: platform.value.installmentPaymentEnabled,
    })
    try {
      await fetchFooter({ force: true, admin: true })
    }
    catch {
      /* optional */
    }

    snapshot.value = serialize()
    toast.success(t('تنظیمات ذخیره شد'))
  }
  finally {
    saving.value = false
  }
}

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm(t('تغییرات ذخیره نشده‌اند. خروج؟'))
})
</script>
