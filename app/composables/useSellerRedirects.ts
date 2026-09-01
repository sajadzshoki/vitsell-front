export type SellerRedirect = {
  id: string
  source: string
  destination: string
  enabled: boolean
  permanent: boolean
}

function normalizePath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

function defaultRedirects(): SellerRedirect[] {
  return []
}

export function useSellerRedirects() {
  const redirects = useState<SellerRedirect[]>('seller-seo-redirects', () => defaultRedirects())
  const seeded = useState('seller-seo-redirects-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      redirects.value = defaultRedirects()
      seeded.value = true
    }
    return redirects.value
  }

  function findByPath(path: string) {
    ensureLoaded()
    const target = normalizePath(path)
    return redirects.value.find(item =>
      item.enabled && normalizePath(item.source) === target,
    )
  }

  function upsertRedirect(input: Omit<SellerRedirect, 'id'> & { id?: string }) {
    ensureLoaded()
    const id = input.id || `redir-${Date.now().toString(36)}`
    const next: SellerRedirect = {
      id,
      source: normalizePath(input.source),
      destination: input.destination.trim(),
      enabled: input.enabled !== false,
      permanent: Boolean(input.permanent),
    }
    const index = redirects.value.findIndex(r => r.id === id)
    if (index === -1) {
      redirects.value = [...redirects.value, next]
    }
    else {
      const copy = [...redirects.value]
      copy[index] = next
      redirects.value = copy
    }
    return next
  }

  function removeRedirect(id: string) {
    ensureLoaded()
    redirects.value = redirects.value.filter(r => r.id !== id)
  }

  return {
    redirects: computed(() => {
      ensureLoaded()
      return redirects.value
    }),
    ensureLoaded,
    findByPath,
    upsertRedirect,
    removeRedirect,
  }
}
