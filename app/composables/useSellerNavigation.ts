import {
  bottomNavItems as seedBottom,
  navQuickLinks as seedQuick,
  type BottomNavItem,
  type NavQuickLink,
} from '~/data/nav-links'

export type SellerNavLinkForm = NavQuickLink & {
  enabled: boolean
  external?: boolean
}

export type SellerBottomNavForm = BottomNavItem & {
  enabled: boolean
}

export type SellerNavigationPayload = {
  quickLinks: SellerNavLinkForm[]
  bottomLinks: SellerBottomNavForm[]
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function cloneQuick(list: NavQuickLink[]): SellerNavLinkForm[] {
  return list.map(l => ({
    ...l,
    enabled: true,
    external: Boolean(l.to?.startsWith('http')),
  }))
}

function cloneBottom(list: BottomNavItem[]): SellerBottomNavForm[] {
  return list.map(l => ({ ...l, enabled: true }))
}

function toQuick(raw: any, index: number): SellerNavLinkForm {
  const id = String(raw?.id || `quick-${index + 1}`)
  const to = String(raw?.to || '')
  return {
    id,
    label: String(raw?.label || id),
    icon: raw?.icon ? String(raw.icon) : '',
    to: to || undefined,
    badge: raw?.badge ? String(raw.badge) : undefined,
    accent: Boolean(raw?.accent),
    enabled: raw?.enabled === false ? false : true,
    external: Boolean(raw?.external ?? to.startsWith('http')),
  }
}

function toBottom(raw: any, index: number): SellerBottomNavForm {
  const id = String(raw?.id || `bottom-${index + 1}`)
  const badge = raw?.badge ? String(raw.badge) : undefined
  return {
    id,
    label: String(raw?.label || id),
    icon: String(raw?.icon || 'circle'),
    iconActive: raw?.iconActive ? String(raw.iconActive) : '',
    to: raw?.to ? String(raw.to) : undefined,
    badge: badge === 'cart' ? 'cart' : badge as SellerBottomNavForm['badge'],
    enabled: raw?.enabled === false ? false : true,
  }
}

function toPayload(raw: any): SellerNavigationPayload {
  const quick = Array.isArray(raw?.quickLinks) ? raw.quickLinks.map(toQuick) : cloneQuick(seedQuick)
  const bottom = Array.isArray(raw?.bottomLinks) ? raw.bottomLinks.map(toBottom) : cloneBottom(seedBottom)
  return {
    quickLinks: quick.length ? quick : cloneQuick(seedQuick),
    bottomLinks: bottom.length ? bottom : cloneBottom(seedBottom),
  }
}

export function useSellerNavigation() {
  const quickLinks = useState<SellerNavLinkForm[]>(
    'seller-public-nav-quick',
    () => cloneQuick(seedQuick),
  )
  const bottomLinks = useState<SellerBottomNavForm[]>(
    'seller-public-nav-bottom',
    () => cloneBottom(seedBottom),
  )
  const loaded = useState('seller-public-nav-loaded', () => false)
  const pending = useState('seller-public-nav-pending', () => false)

  const publicQuickLinks = computed(() => quickLinks.value.filter(l => l.enabled))
  const publicBottomLinks = computed(() => bottomLinks.value.filter(l => l.enabled))

  async function fetchNavigation(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      const path = options?.admin ? '/seller/navigation' : '/navigation'
      const { result, error } = await useGet<SellerNavigationPayload>(path, {
        headers: { 'no-error': true },
        server: false,
      })
      if (error || result == null) {
        if (!loaded.value) {
          quickLinks.value = cloneQuick(seedQuick)
          bottomLinks.value = cloneBottom(seedBottom)
        }
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری منوی سایت ناموفق بود'),
        }
      }
      const next = toPayload(result)
      quickLinks.value = next.quickLinks
      bottomLinks.value = next.bottomLinks
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function saveNavigation(
    payload: SellerNavigationPayload,
    actor?: { id: string, name: string },
  ) {
    pending.value = true
    try {
      const body = {
        quickLinks: payload.quickLinks.map(l => ({ ...l })),
        bottomLinks: payload.bottomLinks.map(l => ({ ...l })),
      }
      const { result, error } = await usePut<SellerNavigationPayload>('/seller/navigation', body, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'ذخیره منوی سایت ناموفق بود'),
        }
      }
      const next = toPayload(result)
      quickLinks.value = next.quickLinks
      bottomLinks.value = next.bottomLinks
      loaded.value = true
      if (actor) {
        const { appendLog } = useSellerAudit()
        appendLog({
          actorId: actor.id,
          actorName: actor.name,
          action: 'update',
          entity: 'settings',
          entityId: 'navigation',
          summary: 'منوی سایت به‌روزرسانی شد',
        })
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  /** @deprecated use saveNavigation */
  async function saveQuickLinks(next: SellerNavLinkForm[], actor?: { id: string, name: string }) {
    return saveNavigation({ quickLinks: next, bottomLinks: bottomLinks.value }, actor)
  }

  /** @deprecated use saveNavigation */
  async function saveBottomLinks(next: SellerBottomNavForm[], actor?: { id: string, name: string }) {
    return saveNavigation({ quickLinks: quickLinks.value, bottomLinks: next }, actor)
  }

  function moveQuick(index: number, dir: -1 | 1) {
    const next = [...quickLinks.value]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    const tmp = next[index]!
    next[index] = next[j]!
    next[j] = tmp
    quickLinks.value = next
  }

  return {
    quickLinks,
    bottomLinks,
    publicQuickLinks,
    publicBottomLinks,
    loaded,
    pending,
    fetchNavigation,
    saveNavigation,
    saveQuickLinks,
    saveBottomLinks,
    moveQuick,
  }
}
