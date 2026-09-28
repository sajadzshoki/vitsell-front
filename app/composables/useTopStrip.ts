export type TopStripLink = {
  id: string
  label: string
  to: string
}

export type TopStripSettings = {
  enabled: boolean
  supportLabel: string
  supportPhone: string
  highlight: string
  links: TopStripLink[]
}

export const TOP_STRIP_MAX_LINKS = 6

export const defaultTopStripSettings: TopStripSettings = {
  enabled: true,
  supportLabel: 'پشتیبانی ۲۴ ساعته:',
  supportPhone: '۰۲۱-۹۱۰۰۰۰۰۰',
  highlight: 'ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان',
  links: [
    { id: 'orders', label: 'پیگیری سفارش', to: '/account/orders' },
    { id: 'app', label: 'اپلیکیشن موبایل', to: '' },
  ],
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

export function cleanTopStripHref(value: unknown) {
  const to = String(value ?? '').trim()
  if (!to) return ''
  if (to.startsWith('/') || /^https?:\/\//i.test(to)) return to
  return ''
}

function cloneDefaults(): TopStripSettings {
  return {
    ...defaultTopStripSettings,
    links: defaultTopStripSettings.links.map(link => ({ ...link })),
  }
}

export function normalizeTopStripSettings(raw: unknown): TopStripSettings {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const linksRaw = Array.isArray(src.links) ? src.links : defaultTopStripSettings.links
  const links = linksRaw
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {}
      const label = String(row.label ?? '').trim()
      if (!label) return null
      const id = String(row.id || `link-${index + 1}`).trim() || `link-${index + 1}`
      return {
        id: id.slice(0, 80),
        label: label.slice(0, 80),
        to: cleanTopStripHref(row.to),
      }
    })
    .filter((item): item is TopStripLink => item != null)
    .slice(0, TOP_STRIP_MAX_LINKS)

  return {
    enabled: src.enabled === false ? false : true,
    supportLabel: String(src.supportLabel ?? defaultTopStripSettings.supportLabel).trim().slice(0, 80),
    supportPhone: String(src.supportPhone ?? defaultTopStripSettings.supportPhone).trim().slice(0, 40),
    highlight: String(src.highlight ?? defaultTopStripSettings.highlight).trim().slice(0, 160),
    links,
  }
}

export function topStripHasContent(settings: TopStripSettings) {
  return Boolean(
    settings.supportLabel.trim()
    || settings.supportPhone.trim()
    || settings.highlight.trim()
    || settings.links.some(link => link.label.trim()),
  )
}

export function createTopStripLink(): TopStripLink {
  return {
    id: `link-${crypto.randomUUID()}`,
    label: '',
    to: '/',
  }
}

export function useTopStrip() {
  const settings = useState<TopStripSettings>('top-strip-settings', cloneDefaults)
  const loaded = useState('top-strip-loaded', () => false)
  const pending = useState('top-strip-pending', () => false)

  const visible = computed(() => settings.value.enabled && topStripHasContent(settings.value))

  async function fetchTopStrip(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const path = options?.admin ? '/seller/top-strip' : '/top-strip'
      const { result, error } = await useGet<TopStripSettings>(path, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        if (!loaded.value) settings.value = cloneDefaults()
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری نوار بالا ناموفق بود'),
        }
      }
      settings.value = normalizeTopStripSettings(result)
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function saveTopStrip(payload: TopStripSettings) {
    pending.value = true
    try {
      const body = normalizeTopStripSettings(payload)
      const { result, error } = await usePut<TopStripSettings>('/seller/top-strip', body, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'ذخیره نوار بالا ناموفق بود'),
        }
      }
      settings.value = normalizeTopStripSettings(result)
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  return {
    settings,
    loaded,
    pending,
    visible,
    fetchTopStrip,
    saveTopStrip,
  }
}
