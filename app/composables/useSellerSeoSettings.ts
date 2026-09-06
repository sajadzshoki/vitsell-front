import {
  defaultSeoSiteSettings,
  type SellerSeoSiteSettings,
} from '~/data/seo-site'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toSeo(raw: any): SellerSeoSiteSettings {
  const defaults = defaultSeoSiteSettings()
  const robots = String(raw?.defaultRobots || defaults.defaultRobots)
  const card = String(raw?.twitterCard || defaults.twitterCard)
  return {
    siteName: String(raw?.siteName || defaults.siteName).trim() || defaults.siteName,
    siteUrl: String(raw?.siteUrl || defaults.siteUrl).trim().replace(/\/+$/, '') || defaults.siteUrl,
    titlePattern: String(raw?.titlePattern || defaults.titlePattern).trim() || defaults.titlePattern,
    defaultRobots:
      robots === 'noindex,follow'
      || robots === 'index,nofollow'
      || robots === 'noindex,nofollow'
      || robots === 'index,follow'
        ? robots as SellerSeoSiteSettings['defaultRobots']
        : defaults.defaultRobots,
    defaultOgImage: String(raw?.defaultOgImage || ''),
    twitterCard: card === 'summary' ? 'summary' : 'summary_large_image',
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : null,
  }
}

export function useSellerSeoSettings() {
  const settings = useState<SellerSeoSiteSettings>(
    'seller-seo-site',
    () => defaultSeoSiteSettings(),
  )
  const loaded = useState('seller-seo-site-loaded', () => false)
  const pending = useState('seller-seo-site-pending', () => false)

  async function fetchSettings(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const { result, error } = await useGet<SellerSeoSiteSettings>('/seller/seo', {
        headers: { 'no-error': true },
        server: false,
      })
      if (error || result == null) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری تنظیمات سئو ناموفق بود'),
        }
      }
      settings.value = toSeo(result)
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  function ensureLoaded() {
    if (!loaded.value && !pending.value) {
      void fetchSettings()
    }
    return settings.value
  }

  async function updateSettings(partial: Partial<SellerSeoSiteSettings>) {
    pending.value = true
    try {
      const payload = toSeo({ ...settings.value, ...partial })
      const { result, error } = await usePut<SellerSeoSiteSettings>('/seller/seo', payload, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        return {
          ok: false as const,
          settings: settings.value,
          error: apiErrorMessage(error, 'ذخیره تنظیمات سئو ناموفق بود'),
        }
      }
      settings.value = toSeo(result)
      loaded.value = true
      return { ok: true as const, settings: settings.value, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  return {
    settings: computed(() => settings.value),
    pending,
    loaded,
    ensureLoaded,
    fetchSettings,
    updateSettings,
  }
}
