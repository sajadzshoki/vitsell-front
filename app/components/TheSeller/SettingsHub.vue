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

    <!-- general -->
    <div
      v-if="activeTab === 'general'"
      class="space-y-4"
    >
      <div
        v-if="bootPending"
        class="py-10 grid place-items-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-7 text-primary animate-spin"
        />
      </div>
      <template v-else>
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
      </template>
    </div>

    <!-- branding -->
    <div
      v-else-if="activeTab === 'branding'"
      class="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <TheSellerImageUpload
        v-model="platform.logoUrl"
        :label="$t('لوگو')"
      />
      <TheSellerImageUpload
        v-model="platform.faviconUrl"
        :label="$t('فاوآیکون')"
      />
      <TheSellerImageUpload
        v-model="platform.defaultOgImage"
        :label="$t('تصویر Open Graph')"
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
      <TheFormInput
        v-model="platform.defaultLocale"
        :label="$t('زبان پیش‌فرض')"
        dir="ltr"
        :disabled="!canSave"
      />
      <TheFormInput
        v-model="platform.currencyLabel"
        :label="$t('واحد پول')"
        :disabled="!canSave"
      />
      <TheFormInput
        v-model="platform.dateFormatHint"
        :label="$t('قالب تاریخ')"
        dir="ltr"
        :disabled="!canSave"
      />
      <TheFormInput
        v-model="platform.numberFormatHint"
        :label="$t('قالب عدد')"
        dir="ltr"
        :disabled="!canSave"
      />
      <TheFormInput
        v-model="platform.timezone"
        :label="$t('منطقه زمانی')"
        dir="ltr"
        :disabled="!canSave"
      />
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
      <TheFormInput
        v-model="platform.cancelAllowedStatuses"
        :label="$t('وضعیت‌های قابل لغو')"
        dir="ltr"
        :disabled="!canSave"
        :help="$t('جدا شده با ویرگول')"
      />
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

    <!-- payments / seo / footer links -->
    <div
      v-else-if="activeTab === 'payments'"
      class="bg-muted border border-muted rounded-2xl p-5"
    >
      <p class="text-sm text-toned leading-7 mb-4">
        {{ $t('مدیریت درگاه‌ها در بخش مالی انجام می‌شود.') }}
      </p>
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

    <div
      v-else-if="activeTab === 'seo'"
      class="bg-muted border border-muted rounded-2xl p-5"
    >
      <p class="text-sm text-toned leading-7 mb-4">
        {{ $t('تنظیمات سئوی سراسری در صفحه اختصاصی است.') }}
      </p>
      <UButton
        to="/seller/seo"
        color="primary"
        variant="soft"
        icon="i-tabler-seo"
        class="cursor-pointer"
      >
        {{ $t('سئو') }}
      </UButton>
    </div>

    <div
      v-else-if="activeTab === 'footer'"
      class="bg-muted border border-muted rounded-2xl p-5"
    >
      <p class="text-sm text-toned leading-7 mb-4">
        {{ $t('محتوای فوتر از صفحه فوتر ویرایش می‌شود.') }}
      </p>
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

    <!-- security -->
    <div
      v-else-if="activeTab === 'security'"
      class="bg-muted border border-muted rounded-2xl p-5 space-y-3"
    >
      <p class="text-sm text-toned leading-7">
        {{ $t('احراز هویت ادمین از مسیر ورود پنل انجام می‌شود. اجبار ۲FA هنوز پیکربندی نشده است.') }}
      </p>
      <UBadge
        color="neutral"
        variant="subtle"
      >
        {{ $t('۲FA پیکربندی نشده') }}
      </UBadge>
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
const { currentAdminUser } = useSellerAdmins()
const { overview, fetchOverview } = useSellerSystem()

const bootPending = computed(() => shopPending.value || settingsPending.value)

await Promise.all([
  fetchShop({ force: false }),
  fetchSettings({ force: true }),
])
void fetchOverview({ force: false })

const canSave = computed(() => can('settings.update'))
const saving = ref(false)

const tabFromQuery = computed(() => {
  const raw = String(route.query.tab || 'general')
  return platformSettingsTabs.some(t => t.id === raw)
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
  'localization', 'commerce', 'orders', 'shipping', 'notifications', 'branding', 'contact',
]
const isPrefTab = computed(() => prefTabs.includes(activeTab.value))
const isLinkOnlyTab = computed(() =>
  ['payments', 'seo', 'footer', 'integrations', 'security'].includes(activeTab.value),
)

const shopForm = ref<SellerShop>({ ...shop.value })
const platform = ref<SellerPlatformSettings>({ ...settings.value })
const snapshot = ref(serialize())

watch(shop, (v) => {
  shopForm.value = { ...v }
  snapshot.value = serialize()
})
watch(settings, (v) => {
  platform.value = { ...v }
  snapshot.value = serialize()
})

function serialize() {
  return JSON.stringify({ shop: shopForm.value, platform: platform.value })
}

const dirty = computed(() => serialize() !== snapshot.value)

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

const integrationCards = computed(() => {
  const fromApi = overview.value.integrations
  if (fromApi.length) {
    return fromApi.map((item) => {
      let color: 'success' | 'info' | 'neutral' = 'neutral'
      let status = 'پیکربندی نشده'
      if (item.status === 'live') {
        color = 'success'
        status = 'زنده'
      }
      else if (item.status === 'sandbox' || item.status === 'mock') {
        color = 'info'
        status = item.status === 'sandbox' ? 'سندباکس' : 'mock'
      }
      return {
        id: item.id,
        title: item.label,
        note: item.hint || '',
        status,
        color,
      }
    })
  }
  return [
    { id: 'zarinpal', title: 'زرین‌پال', note: 'وضعیت واقعی از درگاه‌های مالی', status: 'زنده', color: 'info' as const },
    { id: 'sms', title: 'پیامک', note: 'سرویس پیامک هنوز متصل نشده', status: 'پیکربندی نشده', color: 'neutral' as const },
    { id: 'email', title: 'ایمیل', note: 'ارسال تراکنشی پیکربندی نشده', status: 'پیکربندی نشده', color: 'neutral' as const },
  ]
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
