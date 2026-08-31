import {
  type Category,
} from '~/data/categories'

export function useCategoryBrowser(initialId?: string) {
  const route = useRoute()
  const router = useRouter()
  const { categories, getCategoryById, productCounts } = useCategories()

  const resolveInitialId = () => {
    const fromQuery = typeof route.query.cat === 'string' ? route.query.cat : ''
    if (fromQuery && getCategoryById(fromQuery)) return fromQuery
    if (initialId && getCategoryById(initialId)) return initialId
    return categories.value[0]?.id ?? 'mobile'
  }

  const activeId = ref(resolveInitialId())

  const expandedSubs = ref<Set<string>>(new Set())

  const activeCategory = computed<Category | undefined>(() =>
    getCategoryById(activeId.value),
  )

  watch(
    categories,
    (list) => {
      if (!getCategoryById(activeId.value) && list[0]) {
        activeId.value = list[0].id
      }
    },
    { immediate: true },
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
    productCounts,
    activeId,
    activeCategory,
    selectCategory,
    toggleSub,
    isSubExpanded,
  }
}
