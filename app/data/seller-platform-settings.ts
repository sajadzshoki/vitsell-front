/** Platform configuration prefs — persisted via GET|PUT /seller/settings. Shop identity stays on /seller/shop. */

export type SellerPlatformSettings = {
  // Localization
  defaultLocale: string
  currencyLabel: string
  dateFormatHint: string
  numberFormatHint: string
  timezone: string
  // Branding (URLs from media library)
  logoUrl: string
  faviconUrl: string
  defaultOgImage: string
  brandName: string
  brandDescription: string
  // Contact extras
  supportPhone: string
  salesPhone: string
  supportEmail: string
  address: string
  workingHours: string
  // Commerce
  minOrderAmount: number
  guestCheckoutEnabled: boolean
  outOfStockBehavior: 'hide' | 'show_unavailable' | 'allow_backorder'
  taxDisplay: 'inclusive' | 'exclusive' | 'none'
  // Orders
  returnWindowDays: number
  cancelAllowedStatuses: string
  notifyAdminNewOrder: boolean
  notifyAdminFailedPayment: boolean
  notifyAdminLowStock: boolean
  notifyAdminReturn: boolean
  notifyAdminRefund: boolean
  notifyCustomerOrderStatus: boolean
  notifyCustomerPayment: boolean
  notifyCustomerShipping: boolean
  notifyCustomerMarketing: boolean
  // Shipping
  freeShippingThreshold: number
  deliveryEstimateText: string
  shippingMethodsVisible: boolean
  // Payments (storefront checkout methods)
  onlinePaymentEnabled: boolean
  codPaymentEnabled: boolean
  installmentPaymentEnabled: boolean
}

export const defaultPlatformSettings: SellerPlatformSettings = {
  defaultLocale: 'fa',
  currencyLabel: 'تومان',
  dateFormatHint: 'YYYY/MM/DD',
  numberFormatHint: 'fa-IR',
  timezone: 'Asia/Tehran',
  logoUrl: '',
  faviconUrl: '',
  defaultOgImage: '',
  brandName: '',
  brandDescription: '',
  supportPhone: '',
  salesPhone: '',
  supportEmail: '',
  address: '',
  workingHours: 'شنبه تا پنج‌شنبه ۹ تا ۱۸',
  minOrderAmount: 0,
  guestCheckoutEnabled: true,
  outOfStockBehavior: 'show_unavailable',
  taxDisplay: 'inclusive',
  returnWindowDays: 7,
  cancelAllowedStatuses: 'new,packing',
  notifyAdminNewOrder: true,
  notifyAdminFailedPayment: true,
  notifyAdminLowStock: true,
  notifyAdminReturn: true,
  notifyAdminRefund: true,
  notifyCustomerOrderStatus: true,
  notifyCustomerPayment: true,
  notifyCustomerShipping: true,
  notifyCustomerMarketing: false,
  freeShippingThreshold: 0,
  deliveryEstimateText: '۱ تا ۳ روز کاری',
  shippingMethodsVisible: true,
  onlinePaymentEnabled: true,
  codPaymentEnabled: true,
  installmentPaymentEnabled: true,
}

export const platformSettingsTabs = [
  { id: 'general', label: 'عمومی' },
  { id: 'branding', label: 'هویت بصری' },
  { id: 'contact', label: 'تماس' },
  { id: 'localization', label: 'زبان و قالب' },
  { id: 'commerce', label: 'فروشگاه' },
  { id: 'orders', label: 'سفارش' },
  { id: 'shipping', label: 'ارسال' },
  { id: 'payments', label: 'پرداخت' },
  { id: 'notifications', label: 'اعلان‌ها' },
  { id: 'seo', label: 'سئو' },
  { id: 'footer', label: 'فوتر' },
  { id: 'integrations', label: 'یکپارچه‌سازی' },
  { id: 'security', label: 'امنیت' },
] as const

export type PlatformSettingsTabId = (typeof platformSettingsTabs)[number]['id']
