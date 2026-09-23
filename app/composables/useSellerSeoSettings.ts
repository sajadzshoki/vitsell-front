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

function isPlaceholderSiteUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')
  }
  catch {
    return true
  }
}

function runtimeSeoDefaults(): SellerSeoSiteSettings {
  const defaults = defaultSeoSiteSettings()
  try {
    const storeUrl = String(useRuntimeConfig().public.storeUrl || '').trim().replace(/\/+$/, '')
    if (storeUrl && !isPlaceholderSiteUrl(storeUrl)) defaults.siteUrl = storeUrl
  }
  catch {
    /* outside Nuxt context */
  }
  return defaults
}

function toSeo(raw: any): SellerSeoSiteSettings {
  const defaults = runtimeSeoDefaults()
  const robots = String(raw?.defaultRobots || defaults.defaultRobots)
  const card = String(raw?.twitterCard || defaults.twitterCard)
  const rawSiteUrl = String(raw?.siteUrl || '').trim().replace(/\/+$/, '')
  const siteUrl = rawSiteUrl && !isPlaceholderSiteUrl(rawSiteUrl) ? rawSiteUrl : defaults.siteUrl
  return {
    siteName: String(raw?.siteName || defaults.siteName).trim() || defaults.siteName,
    siteUrl,
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

type SeoFetchResult = {
  ok: boolean
  error: string | null
  settings?: SellerSeoSiteSettings
}

export function useSellerSeoSettings() {
  const settings = useState<SellerSeoSiteSettings>(
    'seller-seo-site',
    () => runtimeSeoDefaults(),
  )
  const loaded = useState('seller-seo-site-loaded', () => false)
  const pending = useState('seller-seo-site-pending', () => false)

  async function fetchSettings(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
      _seoSettingsInflight?: Record<string, Promise<SeoFetchResult>>
    }
    const inflight = (nuxtApp._seoSettingsInflight ||= {})
    const inflightKey = options?.admin ? 'admin' : 'public'
    if (inflight[inflightKey] && !options?.force) return inflight[inflightKey]

    const task = (async () => {
    pending.value = true
    try {
      // Storefront uses public `/seo` during SSR. Admin CRUD stays client-only.
      const path = options?.admin ? '/seller/seo' : '/seo'
      const { result, error } = await useGet<SellerSeoSiteSettings>(path, {
        headers: { 'no-error': true },
        ...(options?.admin ? { server: false } : {}),
      })
      if (error || result == null) {
        loaded.value = true
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
    })()

    inflight[inflightKey] = task
    try {
      return await task
    }
    finally {
      if (inflight[inflightKey] === task) delete inflight[inflightKey]
    }
  }

  async function ensureLoaded() {
    if (!loaded.value) await fetchSettings()
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
