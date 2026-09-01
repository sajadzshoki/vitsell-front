import {
  buildDefaultAboutPage,
  cloneAboutPage,
  type AboutPagePayload,
} from '~/data/about'

export function useAbout() {
  const about = useState<AboutPagePayload>('site-about-page', () => buildDefaultAboutPage())
  const loaded = useState('site-about-loaded', () => false)
  const pending = useState('site-about-pending', () => false)

  async function ensureLoaded(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) return about.value
    if (pending.value && !options?.force) return about.value

    pending.value = true
    try {
      const { result } = await useGet<AboutPagePayload>('/about', {
        headers: { 'no-error': true },
      })
      if (result && result.title) {
        const defaults = buildDefaultAboutPage()
        about.value = {
          ...defaults,
          ...result,
          story: result.story?.length ? result.story : defaults.story,
          stats: result.stats?.length ? result.stats : defaults.stats,
          values: result.values?.length ? result.values : defaults.values,
          milestones: result.milestones?.length ? result.milestones : defaults.milestones,
          team: result.team?.length ? result.team : defaults.team,
          cta: result.cta ?? defaults.cta,
          seo: { ...defaults.seo, ...(result.seo || {}) },
          sectionVisibility: {
            ...defaults.sectionVisibility,
            ...(result.sectionVisibility || {}),
          },
        }
      }
      else {
        about.value = buildDefaultAboutPage()
      }
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

  function ensureSeeded() {
    if (!loaded.value) {
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
    ensureLoaded,
    ensureSeeded,
    updateAbout,
    resetToDefaults,
  }
}
