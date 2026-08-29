import type { StaticPage, StaticPageId } from '~/data/static-pages'

export function useStaticPages() {
  const cache = useState<Partial<Record<StaticPageId, StaticPage>>>(
    'static-pages-cache',
    () => ({}),
  )
  const pendingMap = useState<Partial<Record<StaticPageId, boolean>>>(
    'static-pages-pending',
    () => ({}),
  )
  const inFlight = useState<Partial<Record<StaticPageId, Promise<{
    result: StaticPage | null
    error: any
  }> | undefined>>>('static-pages-inflight', () => ({}))

  function getPage(id: StaticPageId) {
    return cache.value[id] ?? null
  }

  function isPending(id: StaticPageId) {
    return !!pendingMap.value[id]
  }

  async function fetchStaticPage(id: StaticPageId, options?: { force?: boolean }) {
    if (cache.value[id] && !options?.force) {
      return { result: cache.value[id]!, error: null as null }
    }

    const existing = inFlight.value[id]
    if (existing) return existing

    pendingMap.value = { ...pendingMap.value, [id]: true }

    const run = (async () => {
      try {
        const { result, error } = await useGet<StaticPage>(
          `/static-pages/${encodeURIComponent(id)}`,
          { headers: { 'no-error': true } },
        )
        if (error || !result) {
          return { result: null as StaticPage | null, error }
        }

        cache.value = { ...cache.value, [id]: result }
        return { result, error: null as null }
      }
      finally {
        pendingMap.value = { ...pendingMap.value, [id]: false }
        const next = { ...inFlight.value }
        delete next[id]
        inFlight.value = next
      }
    })()

    inFlight.value = { ...inFlight.value, [id]: run }
    return run
  }

  return {
    cache,
    getPage,
    isPending,
    fetchStaticPage,
  }
}
