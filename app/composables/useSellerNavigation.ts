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

function cloneQuick(list: NavQuickLink[]): SellerNavLinkForm[] {
  return list.map(l => ({ ...l, enabled: true, external: Boolean(l.to?.startsWith('http')) }))
}

function cloneBottom(list: BottomNavItem[]): SellerBottomNavForm[] {
  return list.map(l => ({ ...l, enabled: true }))
}

export function useSellerNavigation() {
  const quickLinks = useState<SellerNavLinkForm[]>('seller-public-nav-quick', () => cloneQuick(seedQuick))
  const bottomLinks = useState<SellerBottomNavForm[]>('seller-public-nav-bottom', () => cloneBottom(seedBottom))

  const publicQuickLinks = computed(() => quickLinks.value.filter(l => l.enabled))
  const publicBottomLinks = computed(() => bottomLinks.value.filter(l => l.enabled))

  function saveQuickLinks(next: SellerNavLinkForm[], actor?: { id: string, name: string }) {
    quickLinks.value = next.map(l => ({ ...l }))
    if (actor) {
      const { appendLog } = useSellerAudit()
      appendLog({
        actorId: actor.id,
        actorName: actor.name,
        action: 'update',
        entity: 'settings',
        entityId: 'navigation-quick',
        summary: 'منوی سریع سایت به‌روزرسانی شد',
      })
    }
    return { ok: true as const }
  }

  function saveBottomLinks(next: SellerBottomNavForm[], actor?: { id: string, name: string }) {
    bottomLinks.value = next.map(l => ({ ...l }))
    if (actor) {
      const { appendLog } = useSellerAudit()
      appendLog({
        actorId: actor.id,
        actorName: actor.name,
        action: 'update',
        entity: 'settings',
        entityId: 'navigation-bottom',
        summary: 'منوی پایین سایت به‌روزرسانی شد',
      })
    }
    return { ok: true as const }
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
    saveQuickLinks,
    saveBottomLinks,
    moveQuick,
  }
}
