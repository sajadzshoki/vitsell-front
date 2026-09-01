import {
  defaultSeoSiteSettings,
  type SellerSeoSiteSettings,
} from '~/data/seo-site'

export function useSellerSeoSettings() {
  const settings = useState<SellerSeoSiteSettings>('seller-seo-site', () => defaultSeoSiteSettings())
  const seeded = useState('seller-seo-site-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      settings.value = defaultSeoSiteSettings()
      seeded.value = true
    }
    return settings.value
  }

  function updateSettings(partial: Partial<SellerSeoSiteSettings>) {
    ensureLoaded()
    settings.value = {
      ...settings.value,
      ...partial,
      siteName: (partial.siteName ?? settings.value.siteName).trim() || 'Digishop',
      siteUrl: (partial.siteUrl ?? settings.value.siteUrl).trim().replace(/\/+$/, ''),
      titlePattern: (partial.titlePattern ?? settings.value.titlePattern).trim() || '{title} | {site}',
      updatedAt: new Date().toISOString(),
    }
    return { ok: true as const, settings: settings.value }
  }

  return {
    settings: computed(() => {
      ensureLoaded()
      return settings.value
    }),
    ensureLoaded,
    updateSettings,
  }
}
