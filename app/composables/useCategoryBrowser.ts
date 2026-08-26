import {
  categories,
  getCategoryById,
  type Category,
} from '~/data/categories'

export function useCategoryBrowser(initialId?: string) {
  const route = useRoute()
  const router = useRouter()

  const activeId = ref(
    (typeof route.query.cat === 'string' && getCategoryById(route.query.cat))
      ? route.query.cat
      : initialId ?? categories[0]!.id,
  )

  const expandedSubs = ref<Set<string>>(new Set())

  const activeCategory = computed<Category | undefined>(() =>
    getCategoryById(activeId.value),
  )

  watch(
    () => route.query.cat,
    (cat) => {
      if (typeof cat === 'string' && getCategoryById(cat)) {
        activeId.value = cat
      }
    },
  )

  watch(activeId, () => {
    const cat = getCategoryById(activeId.value)
    const first = cat?.subs[0]?.name
    expandedSubs.value = first ? new Set([first]) : new Set()
  }, { immediate: true })

  function selectCategory(id: string) {
    activeId.value = id
    router.replace({ query: { ...route.query, cat: id } })
  }

  function toggleSub(name: string) {
    const next = new Set(expandedSubs.value)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    expandedSubs.value = next
  }

  function isSubExpanded(name: string) {
    return expandedSubs.value.has(name)
  }

  return {
    categories,
    activeId,
    activeCategory,
    selectCategory,
    toggleSub,
    isSubExpanded,
  }
}
