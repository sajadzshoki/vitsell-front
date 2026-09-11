import type { PublicMegaMenu } from '~/data/mega-menu'

function toPublicMenu(raw: Record<string, unknown>): PublicMegaMenu {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    slug: String(raw.slug || ''),
    icon: raw.icon ? String(raw.icon) : null,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    ...(raw.href ? { href: String(raw.href) } : {}),
    sections: Array.isArray(raw.sections)
      ? raw.sections.map(row => toPublicSection(row as Record<string, unknown>))
      : [],
  }
}

function toPublicSection(raw: Record<string, unknown>): PublicMegaMenu['sections'][number] {
  const category = raw.category && typeof raw.category === 'object'
    ? {
        id: String((raw.category as { id?: unknown }).id || ''),
        name: String((raw.category as { name?: unknown }).name || ''),
        icon: String((raw.category as { icon?: unknown }).icon || ''),
        image: (raw.category as { image?: unknown }).image
          ? String((raw.category as { image: unknown }).image)
          : null,
      }
    : undefined

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    slug: raw.slug != null ? String(raw.slug) : null,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    ...(raw.href ? { href: String(raw.href) } : {}),
    ...(category?.id ? { category } : {}),
    items: Array.isArray(raw.items)
      ? raw.items.map(row => toPublicItem(row as Record<string, unknown>))
      : [],
    sections: Array.isArray(raw.sections)
      ? raw.sections.map(row => toPublicSection(row as Record<string, unknown>))
      : [],
  }
}

function toPublicItem(raw: Record<string, unknown>): PublicMegaMenu['sections'][number]['items'][number] {
  const type = raw.type === 'filter' || raw.type === 'link' ? raw.type : 'category'
  const category = raw.category && typeof raw.category === 'object'
    ? {
        id: String((raw.category as { id?: unknown }).id || ''),
        name: String((raw.category as { name?: unknown }).name || ''),
        icon: String((raw.category as { icon?: unknown }).icon || ''),
        image: (raw.category as { image?: unknown }).image
          ? String((raw.category as { image: unknown }).image)
          : null,
      }
    : undefined
  const filter = raw.filter && typeof raw.filter === 'object' && !Array.isArray(raw.filter)
    ? raw.filter as PublicMegaMenu['sections'][number]['items'][number]['filter']
    : undefined

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    slug: raw.slug != null ? String(raw.slug) : null,
    type,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    ...(raw.href ? { href: String(raw.href) } : {}),
    ...(type === 'category' && category?.id ? { category } : {}),
    ...(type === 'filter' && filter ? { filter } : {}),
    ...(type === 'link' && raw.url ? { url: String(raw.url) } : {}),
  }
}

export function useMegaMenu() {
  const items = useState<PublicMegaMenu[]>('public-mega-menu-items', () => [])
  const loaded = useState('public-mega-menu-loaded', () => false)
  const pending = useState('public-mega-menu-pending', () => false)
  const loadError = useState<string | null>('public-mega-menu-error', () => null)
  const inFlight = useState<Promise<PublicMegaMenu[]> | null>('public-mega-menu-inflight', () => null)

  const menus = computed(() => items.value)

  async function fetchMegaMenu(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) return items.value
    if (inFlight.value) return inFlight.value

    pending.value = true
    loadError.value = null
    const job = (async () => {
      const { result, error } = await useGet<{ items?: unknown[] }>('/mega-menu', {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        loadError.value = 'بارگذاری منو ناموفق بود'
        items.value = []
        loaded.value = false
        return items.value
      }
      items.value = Array.isArray(result.items)
        ? result.items.map(row => toPublicMenu(row as Record<string, unknown>))
        : []
      loaded.value = true
      return items.value
    })()

    inFlight.value = job
    try {
      return await job
    }
    finally {
      pending.value = false
      inFlight.value = null
    }
  }

  return {
    menus,
    pending,
    loaded,
    loadError,
    fetchMegaMenu,
  }
}
