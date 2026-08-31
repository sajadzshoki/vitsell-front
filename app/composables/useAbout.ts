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
        about.value = {
          ...buildDefaultAboutPage(),
          ...result,
          story: result.story?.length ? result.story : buildDefaultAboutPage().story,
          stats: result.stats?.length ? result.stats : buildDefaultAboutPage().stats,
          values: result.values?.length ? result.values : buildDefaultAboutPage().values,
          milestones: result.milestones?.length ? result.milestones : buildDefaultAboutPage().milestones,
          team: result.team?.length ? result.team : buildDefaultAboutPage().team,
          cta: result.cta ?? buildDefaultAboutPage().cta,
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
