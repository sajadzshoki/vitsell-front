import {
  buildDefaultAboutPage,
  cloneAboutPage,
  type AboutPagePayload,
} from '~/data/about'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function mergeAbout(result: Partial<AboutPagePayload> | null | undefined): AboutPagePayload {
  const defaults = buildDefaultAboutPage()
  if (!result || typeof result !== 'object') return defaults
  return {
    ...defaults,
    ...result,
    story: Array.isArray(result.story) && result.story.length ? result.story.map(String) : defaults.story,
    stats: Array.isArray(result.stats) && result.stats.length ? result.stats : defaults.stats,
    values: Array.isArray(result.values) && result.values.length ? result.values : defaults.values,
    milestones: Array.isArray(result.milestones) && result.milestones.length
      ? result.milestones
      : defaults.milestones,
    team: Array.isArray(result.team) && result.team.length ? result.team : defaults.team,
    cta: { ...defaults.cta, ...(result.cta || {}) },
    seo: { ...defaults.seo, ...(result.seo || {}) },
    sectionVisibility: {
      ...defaults.sectionVisibility,
      ...(result.sectionVisibility || {}),
    },
  }
}

export function useAbout() {
  const about = useState<AboutPagePayload>('site-about-page', () => buildDefaultAboutPage())
  const loaded = useState('site-about-loaded', () => false)
  const pending = useState('site-about-pending', () => false)
  const adminLoaded = useState('site-about-admin-loaded', () => false)

  /** استورفرانت: GET /about */
  async function ensureLoaded(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) return about.value
    if (pending.value && !options?.force) return about.value

    pending.value = true
    try {
      const { result } = await useGet<AboutPagePayload>('/about', {
        headers: { 'no-error': true },
      })
      about.value = mergeAbout(result)
      loaded.value = true
    }
    catch {
      about.value = buildDefaultAboutPage()
      loaded.value = true
    }
    finally {
      pending.value = false
    }

    return about.value
  }

  /** پنل ادمین: GET /seller/about */
  async function fetchAdmin(options?: { force?: boolean }) {
    if (adminLoaded.value && !options?.force) return { ok: true as const, error: null as null }
    pending.value = true
    try {
      const { result, error } = await useGet<AboutPagePayload | null>('/seller/about', {
        headers: { 'no-error': true },
        server: false,
      })
      if (error) {
        return { ok: false as const, error }
      }
      about.value = mergeAbout(result)
      adminLoaded.value = true
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function saveAbout(payload: AboutPagePayload) {
    pending.value = true
    try {
      const { result, error } = await usePut<AboutPagePayload>('/seller/about', payload, {
        headers: { 'no-error': true },
      })
      if (error) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'ذخیره درباره ما ناموفق بود'),
        }
      }
      about.value = mergeAbout(result || payload)
      adminLoaded.value = true
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  function ensureSeeded() {
    if (!loaded.value && !adminLoaded.value) {
      about.value = buildDefaultAboutPage()
      loaded.value = true
    }
    return about.value
  }

  function updateAbout(payload: AboutPagePayload) {
    about.value = cloneAboutPage(payload)
    loaded.value = true
  }

  function resetToDefaults() {
    about.value = buildDefaultAboutPage()
    loaded.value = true
  }

  return {
    about,
    loaded,
    pending,
    adminLoaded,
    ensureLoaded,
    fetchAdmin,
    saveAbout,
    ensureSeeded,
    updateAbout,
    resetToDefaults,
  }
}
