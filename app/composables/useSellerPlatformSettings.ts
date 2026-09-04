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

function toSettings(raw: any): SellerPlatformSettings {
  return {
    ...defaultPlatformSettings,
    ...(raw && typeof raw === 'object' ? raw : {}),
    minOrderAmount: Math.max(0, Number(raw?.minOrderAmount) || 0),
    freeShippingThreshold: Math.max(0, Number(raw?.freeShippingThreshold) || 0),
    returnWindowDays: Math.max(0, Math.round(Number(raw?.returnWindowDays) || 0)),
    guestCheckoutEnabled: Boolean(raw?.guestCheckoutEnabled ?? defaultPlatformSettings.guestCheckoutEnabled),
    shippingMethodsVisible: Boolean(
      raw?.shippingMethodsVisible ?? defaultPlatformSettings.shippingMethodsVisible,
    ),
    notifyAdminNewOrder: Boolean(raw?.notifyAdminNewOrder ?? true),
    notifyAdminFailedPayment: Boolean(raw?.notifyAdminFailedPayment ?? true),
    notifyAdminLowStock: Boolean(raw?.notifyAdminLowStock ?? true),
    notifyAdminReturn: Boolean(raw?.notifyAdminReturn ?? true),
    notifyAdminRefund: Boolean(raw?.notifyAdminRefund ?? true),
    notifyCustomerOrderStatus: Boolean(raw?.notifyCustomerOrderStatus ?? true),
    notifyCustomerPayment: Boolean(raw?.notifyCustomerPayment ?? true),
    notifyCustomerShipping: Boolean(raw?.notifyCustomerShipping ?? true),
    notifyCustomerMarketing: Boolean(raw?.notifyCustomerMarketing ?? false),
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
      const payload = { ...settings.value, ...patch }
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
