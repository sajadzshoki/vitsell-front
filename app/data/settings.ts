import { staticPagePaths } from '~/data/static-pages'

export type SettingsLinkItem = {
  id: string
  label: string
  icon: string
  to: string
}

export const settingsLinkItems: SettingsLinkItem[] = [
  // { id: 'seller', label: 'پنل فروشنده', icon: 'i-tabler-building-store', to: '/seller' },
  { id: 'faq', label: 'پرسش‌های متداول', icon: 'i-tabler-help', to: staticPagePaths.faq },
  { id: 'privacy', label: 'حریم خصوصی', icon: 'i-tabler-lock', to: staticPagePaths.privacy },
  { id: 'terms', label: 'شرایط استفاده', icon: 'i-tabler-file-text', to: staticPagePaths.terms },
  { id: 'contact', label: 'تماس با ما', icon: 'i-tabler-phone', to: staticPagePaths.contact },
]

export const settingsPageTitle = 'تنظیمات'

export const appVersion = '1.0.0'
