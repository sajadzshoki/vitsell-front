import type { SellerShop } from '~/data/seller'
import { defaultSellerShop } from '~/data/seller'
import { defaultPlatformSettings } from '~/data/seller-platform-settings'

export type SiteSettings = SellerShop

function syncPlatformPrefs(site: SiteSettings) {
  try {
    useState('platform-currency-label', () => defaultPlatformSettings.currencyLabel).value =
      site.currencyLabel || defaultPlatformSettings.currencyLabel
    useState('platform-number-format', () => defaultPlatformSettings.numberFormatHint).value =
      site.numberFormatHint || defaultPlatformSettings.numberFormatHint
    useState('platform-default-locale', () => defaultPlatformSettings.defaultLocale).value =
      site.defaultLocale || defaultPlatformSettings.defaultLocale
  }
  catch {
    // outside Nuxt context
  }
}

function normalizeSite(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  const stock = String(raw?.outOfStockBehavior || '')
  const tax = String(raw?.taxDisplay || '')
  const next: SiteSettings = {
    ...defaultSellerShop,
    ...(raw && typeof raw === 'object' ? raw : {}),
    name: String(raw?.name ?? defaultSellerShop.name),
    slug: String(raw?.slug ?? defaultSellerShop.slug),
    phone: String(raw?.phone ?? defaultSellerShop.phone),
    email: String(raw?.email ?? defaultSellerShop.email),
    city: String(raw?.city ?? defaultSellerShop.city),
    about: String(raw?.about ?? defaultSellerShop.about),
    rating: Number(raw?.rating ?? defaultSellerShop.rating) || 0,
    reviewCount: Number(raw?.reviewCount ?? defaultSellerShop.reviewCount) || 0,
    joinDate: String(raw?.joinDate ?? defaultSellerShop.joinDate ?? ''),
    logoUrl: String(raw?.logoUrl ?? ''),
    faviconUrl: String(raw?.faviconUrl ?? ''),
    defaultOgImage: String(raw?.defaultOgImage ?? ''),
    brandName: String(raw?.brandName ?? ''),
    brandDescription: String(raw?.brandDescription ?? ''),
    supportPhone: String(raw?.supportPhone ?? ''),
    salesPhone: String(raw?.salesPhone ?? ''),
    supportEmail: String(raw?.supportEmail ?? ''),
    address: String(raw?.address ?? ''),
    workingHours: String(raw?.workingHours ?? ''),
    defaultLocale: String(raw?.defaultLocale ?? defaultPlatformSettings.defaultLocale),
    currencyLabel: String(raw?.currencyLabel ?? defaultPlatformSettings.currencyLabel),
    dateFormatHint: String(raw?.dateFormatHint ?? defaultPlatformSettings.dateFormatHint),
    numberFormatHint: String(raw?.numberFormatHint ?? defaultPlatformSettings.numberFormatHint),
    timezone: String(raw?.timezone ?? defaultPlatformSettings.timezone),
    minOrderAmount: Math.max(0, Number(raw?.minOrderAmount) || 0),
    guestCheckoutEnabled: raw?.guestCheckoutEnabled !== false,
    outOfStockBehavior:
      stock === 'hide' || stock === 'allow_backorder' || stock === 'show_unavailable'
        ? stock
        : defaultPlatformSettings.outOfStockBehavior,
    taxDisplay:
      tax === 'inclusive' || tax === 'exclusive' || tax === 'none'
        ? tax
        : defaultPlatformSettings.taxDisplay,
    freeShippingThreshold: Math.max(0, Number(raw?.freeShippingThreshold) || 0),
    deliveryEstimateText: String(
      raw?.deliveryEstimateText ?? defaultPlatformSettings.deliveryEstimateText,
    ),
    shippingMethodsVisible: raw?.shippingMethodsVisible !== false,
    onlinePaymentEnabled: raw?.onlinePaymentEnabled !== false,
    codPaymentEnabled: raw?.codPaymentEnabled !== false,
    installmentPaymentEnabled: raw?.installmentPaymentEnabled !== false,
  }
  syncPlatformPrefs(next)
  return next
}

export function useSiteSettings() {
  const site = useState<SiteSettings>('site-settings', () => ({ ...defaultSellerShop }))
  const loaded = useState('site-settings-loaded', () => false)
  const pending = useState('site-settings-pending', () => false)

  async function fetchSite(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) return site.value
    pending.value = true
    try {
      const path = options?.admin ? '/seller/shop' : '/site'
      const { result, error } = await useGet<Partial<SiteSettings>>(path, {
        headers: { 'no-error': true },
      })
      if (error || !result) {
        if (!loaded.value) {
          site.value = normalizeSite(defaultSellerShop)
        }
        return site.value
      }
      site.value = normalizeSite(result)
      loaded.value = true
      return site.value
    }
    finally {
      pending.value = false
    }
  }

  function applySite(payload: Partial<SiteSettings>) {
    site.value = normalizeSite({ ...site.value, ...payload })
    loaded.value = true
    return site.value
  }

  const currencyLabel = computed(
    () => site.value.currencyLabel || defaultPlatformSettings.currencyLabel,
  )

  return {
    site,
    loaded,
    pending,
    currencyLabel,
    fetchSite,
    applySite,
  }
}
