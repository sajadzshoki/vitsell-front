import type { Category } from '~/data/categories'

const categoryOrder = [
  'mobile',
  'laptop',
  'audio',
  'tv',
  'camera',
  'watch',
  'gaming',
  'home',
  'fashion',
  'beauty',
] as const

export function sortCategories(list: Category[]) {
  return [...list].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.id as (typeof categoryOrder)[number])
    const bi = categoryOrder.indexOf(b.id as (typeof categoryOrder)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

export function useCategories() {
  const list = useState<Category[]>('categories-list', () => [])
  const productCounts = useState<Record<string, number>>('categories-product-counts', () => ({}))
  const loaded = useState('categories-loaded', () => false)
  const pending = useState('categories-pending', () => false)
  const inFlight = useState<Promise<{
    categories: Category[]
    productCounts: Record<string, number>
  }> | null>('categories-inflight', () => null)

  const categories = computed(() => list.value)
  const rootCategories = computed(() =>
    list.value.filter(c => !c.parentId),
  )

  function getCategoryById(id: string) {
    return list.value.find(c => c.id === id)
  }

  function getChildCategories(parentId: string) {
    const id = String(parentId || '').trim()
    if (!id) return []
    return list.value
      .filter(c => c.parentId === id)
      .slice()
      .sort((a, b) => {
        const order = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
        if (order !== 0) return order
        return a.name.localeCompare(b.name, 'fa')
      })
  }

  async function fetchProductCounts(ids: string[]) {
    if (!ids.length) return
    const results = await Promise.all(
      ids.map(async (id) => {
        const { result } = await useGet<{ total: number }>(
          `/products?category=${encodeURIComponent(id)}&pageSize=1`,
          { headers: { 'no-error': true } },
        )
        return [id, result?.total ?? 0] as const
      }),
    )
    const next: Record<string, number> = { ...productCounts.value }
    for (const [id, total] of results) next[id] = total
    productCounts.value = next
  }

  async function fetchCategories(options?: { withCounts?: boolean, force?: boolean }) {
    const wantCounts = options?.withCounts !== false

    if (loaded.value && list.value.length && !options?.force) {
      if (wantCounts && !Object.keys(productCounts.value).length) {
        await fetchProductCounts(list.value.map(c => c.id))
      }
      return { categories: list.value, productCounts: productCounts.value }
    }

    if (inFlight.value) return inFlight.value

    pending.value = true
    const run = (async () => {
      try {
        const { result } = await useGet<Category[]>('/categories', {
          headers: { 'no-error': true },
        })

        list.value = Array.isArray(result) ? sortCategories(result) : []

        if (wantCounts && list.value.length) {
          await fetchProductCounts(list.value.map(c => c.id))
        }

        loaded.value = true
        return { categories: list.value, productCounts: productCounts.value }
      }
      finally {
        pending.value = false
        inFlight.value = null
      }
    })()

    inFlight.value = run
    return run
  }

  return {
    list,
    categories,
    rootCategories,
    productCounts,
    loaded,
    pending,
    getCategoryById,
    getChildCategories,
    fetchCategories,
    fetchProductCounts,
  }
}
