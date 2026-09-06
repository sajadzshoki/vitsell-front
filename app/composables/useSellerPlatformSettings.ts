import {
  defaultPlatformSettings,
  type SellerPlatformSettings,
} from '~/data/seller-platform-settings'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function str(value: unknown, fallback = '') {
  if (value == null) return fallback
  return String(value)
}

function toSettings(raw: any): SellerPlatformSettings {
  const src = raw && typeof raw === 'object' ? raw : {}
  return {
    ...defaultPlatformSettings,
    ...src,
    defaultLocale: str(src.defaultLocale, defaultPlatformSettings.defaultLocale),
    currencyLabel: str(src.currencyLabel, defaultPlatformSettings.currencyLabel),
    dateFormatHint: str(src.dateFormatHint, defaultPlatformSettings.dateFormatHint),
    numberFormatHint: str(src.numberFormatHint, defaultPlatformSettings.numberFormatHint),
    timezone: str(src.timezone, defaultPlatformSettings.timezone),
    logoUrl: str(src.logoUrl),
    faviconUrl: str(src.faviconUrl),
    defaultOgImage: str(src.defaultOgImage),
    brandName: str(src.brandName),
    brandDescription: str(src.brandDescription),
    supportPhone: str(src.supportPhone),
    salesPhone: str(src.salesPhone),
    supportEmail: str(src.supportEmail),
    address: str(src.address),
    workingHours: str(src.workingHours, defaultPlatformSettings.workingHours),
    minOrderAmount: Math.max(0, Number(src.minOrderAmount) || 0),
    freeShippingThreshold: Math.max(0, Number(src.freeShippingThreshold) || 0),
    returnWindowDays: Math.max(0, Math.round(Number(src.returnWindowDays) || 0)),
    guestCheckoutEnabled: Boolean(src.guestCheckoutEnabled ?? defaultPlatformSettings.guestCheckoutEnabled),
    shippingMethodsVisible: Boolean(
      src.shippingMethodsVisible ?? defaultPlatformSettings.shippingMethodsVisible,
    ),
    outOfStockBehavior:
      src.outOfStockBehavior === 'hide'
      || src.outOfStockBehavior === 'allow_backorder'
      || src.outOfStockBehavior === 'show_unavailable'
        ? src.outOfStockBehavior
        : defaultPlatformSettings.outOfStockBehavior,
    taxDisplay:
      src.taxDisplay === 'inclusive'
      || src.taxDisplay === 'exclusive'
      || src.taxDisplay === 'none'
        ? src.taxDisplay
        : defaultPlatformSettings.taxDisplay,
    cancelAllowedStatuses: str(src.cancelAllowedStatuses, defaultPlatformSettings.cancelAllowedStatuses),
    deliveryEstimateText: str(
      src.deliveryEstimateText,
      defaultPlatformSettings.deliveryEstimateText,
    ),
    notifyAdminNewOrder: Boolean(src.notifyAdminNewOrder ?? true),
    notifyAdminFailedPayment: Boolean(src.notifyAdminFailedPayment ?? true),
    notifyAdminLowStock: Boolean(src.notifyAdminLowStock ?? true),
    notifyAdminReturn: Boolean(src.notifyAdminReturn ?? true),
    notifyAdminRefund: Boolean(src.notifyAdminRefund ?? true),
    notifyCustomerOrderStatus: Boolean(src.notifyCustomerOrderStatus ?? true),
    notifyCustomerPayment: Boolean(src.notifyCustomerPayment ?? true),
    notifyCustomerShipping: Boolean(src.notifyCustomerShipping ?? true),
    notifyCustomerMarketing: Boolean(src.notifyCustomerMarketing ?? false),
  }
}

export function useSellerPlatformSettings() {
  const settings = useState<SellerPlatformSettings>(
    'seller-platform-settings',
    () => ({ ...defaultPlatformSettings }),
  )
  const loaded = useState('seller-platform-settings-loaded', () => false)
  const pending = useState('seller-platform-settings-pending', () => false)

  async function fetchSettings(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const { result, error } = await useGet<SellerPlatformSettings>('/seller/settings', {
        headers: { 'no-error': true },
        server: false,
      })
      if (error || result == null) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری تنظیمات ناموفق بود'),
        }
      }
      settings.value = toSettings(result)
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    await fetchSettings(options)
    return settings.value
  }

  async function updateSettings(
    patch: Partial<SellerPlatformSettings>,
    actor?: { id: string, name: string },
  ) {
    pending.value = true
    try {
      const payload = toSettings({ ...settings.value, ...patch })
      const { result, error } = await usePut<SellerPlatformSettings>('/seller/settings', payload, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        return {
          ok: false as const,
          settings: settings.value,
          error: apiErrorMessage(error, 'ذخیره تنظیمات ناموفق بود'),
        }
      }
      const prev = { ...settings.value }
      settings.value = toSettings(result)
      loaded.value = true
      if (actor) {
        const { appendLog } = useSellerAudit()
        appendLog({
          actorId: actor.id,
          actorName: actor.name,
          action: 'update',
          entity: 'settings',
          entityId: 'platform',
          summary: 'تنظیمات پلتفرم به‌روزرسانی شد',
          previousValue: JSON.stringify(prev).slice(0, 200),
          newValue: JSON.stringify(settings.value).slice(0, 200),
        })
      }
      return { ok: true as const, settings: settings.value, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function resetToDefaults() {
    return updateSettings({ ...defaultPlatformSettings })
  }

  return {
    settings,
    loaded,
    pending,
    ensureLoaded,
    fetchSettings,
    updateSettings,
    resetToDefaults,
  }
}
