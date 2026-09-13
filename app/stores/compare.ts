import { COMPARE_MAX } from '~/data/compare'
import type { Product } from '~/data/products'

const STORAGE_KEY = 'vitsell-compare'

function readStoredIds(): string[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  }
  catch {
    return []
  }
}

function writeStoredIds(ids: string[]) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export const useCompareStore = defineStore('compare', () => {
  const ids = ref<string[]>(readStoredIds())
  const productsById = ref<Record<string, Product>>({})
  const templates = ref<{ sections: unknown[], radarCriteria: string[] }>({
    sections: [],
    radarCriteria: [],
  })

  const { fetchProduct } = useProducts()

  const count = computed(() => ids.value.length)

  const products = computed<Product[]>(() =>
    ids.value
      .map(id => productsById.value[id])
      .filter((product): product is Product => Boolean(product)),
  )

  const hasItems = computed(() => count.value > 0)

  watch(ids, (value) => {
    writeStoredIds(value)
    hydrateProducts()
  }, { deep: true })

  async function hydrateProducts() {
    await Promise.all(ids.value.map(async (id) => {
      if (productsById.value[id]) return
      const { result } = await fetchProduct(id)
      if (result) {
        productsById.value = { ...productsById.value, [id]: result }
      }
    }))
  }

  async function fetchTemplates(category: string) {
    if (!category) {
      templates.value = { sections: [], radarCriteria: [] }
      return templates.value
    }
    const { result } = await useGet<{ sections: unknown[], radarCriteria: string[] }>(
      `/compare/templates/${encodeURIComponent(category)}`,
      { headers: { 'no-error': true } },
    )
    templates.value = result ?? { sections: [], radarCriteria: [] }
    return templates.value
  }

  function isInCompare(id: string) {
    return ids.value.includes(id)
  }

  function toggleCompare(id: string): 'added' | 'removed' | 'limit' {
    if (ids.value.includes(id)) {
      ids.value = ids.value.filter(item => item !== id)
      return 'removed'
    }

    if (ids.value.length >= COMPARE_MAX) {
      return 'limit'
    }

    ids.value = [...ids.value, id]
    return 'added'
  }

  function clearCompare() {
    ids.value = []
  }

  if (import.meta.client) {
    hydrateProducts()
  }

  return {
    ids,
    count,
    products,
    hasItems,
    templates,
    isInCompare,
    toggleCompare,
    clearCompare,
    hydrateProducts,
    fetchTemplates,
  }
})
