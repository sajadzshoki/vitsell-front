import type { PublicMegaMenu, PublicMegaMenuSection } from '~/data/mega-menu'

export function useCategoryBrowser(initialId?: string) {
  const route = useRoute()
  const router = useRouter()
  const { menus, pending, loadError, fetchMegaMenu } = useMegaMenu()

  const resolveInitialId = () => {
    const fromQuery = typeof route.query.cat === 'string' ? route.query.cat : ''
    if (fromQuery && menus.value.some(m => m.id === fromQuery)) return fromQuery
    if (initialId && menus.value.some(m => m.id === initialId)) return initialId
    return menus.value[0]?.id ?? ''
  }

  const activeId = ref(resolveInitialId())
  const activeSectionId = ref('')
  const expandedSubs = ref<Set<string>>(new Set())

  const activeMenu = computed<PublicMegaMenu | undefined>(() =>
    menus.value.find(m => m.id === activeId.value),
  )

  const activeSection = computed<PublicMegaMenuSection | null>(() =>
    activeMenu.value?.sections.find(s => s.id === activeSectionId.value) || null,
  )

  function syncActiveSection() {
    const menu = activeMenu.value
    if (!menu?.sections.length) {
      activeSectionId.value = ''
      expandedSubs.value = new Set()
      return
    }
    if (!activeSectionId.value || !menu.sections.some(s => s.id === activeSectionId.value)) {
      activeSectionId.value = menu.sections[0]!.id
    }
    expandedSubs.value = new Set([activeSectionId.value].filter(Boolean))
  }

  watch(
    menus,
    (list) => {
      if (!list.length) {
        activeId.value = ''
        activeSectionId.value = ''
        return
      }
      if (!activeId.value || !list.some(m => m.id === activeId.value)) {
        activeId.value = list[0]!.id
      }
      syncActiveSection()
    },
    { immediate: true },
  )

  watch(
    () => route.query.cat,
    (cat) => {
      if (typeof cat === 'string' && menus.value.some(m => m.id === cat)) {
        activeId.value = cat
      }
    },
  )

  watch(activeId, () => {
    syncActiveSection()
  })

  function selectMenu(id: string) {
    activeId.value = id
    router.replace({ query: { ...route.query, cat: id } })
  }

  function selectSection(id: string) {
    activeSectionId.value = id
  }

  function toggleSub(id: string) {
    const next = new Set(expandedSubs.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedSubs.value = next
  }

  function isSubExpanded(id: string) {
    return expandedSubs.value.has(id)
  }

  return {
    menus,
    pending,
    loadError,
    fetchMegaMenu,
    activeId,
    activeMenu,
    activeSectionId,
    activeSection,
    selectMenu,
    selectSection,
    toggleSub,
    isSubExpanded,
  }
}
