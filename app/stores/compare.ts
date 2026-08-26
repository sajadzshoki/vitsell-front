import { COMPARE_MAX } from '~/data/compare'
import { products as allProducts, type Product } from '~/data/products'

const STORAGE_KEY = 'digishop-compare'

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

  const count = computed(() => ids.value.length)

  const products = computed<Product[]>(() =>
    ids.value
      .map(id => allProducts.find(product => product.id === id))
      .filter((product): product is Product => Boolean(product)),
  )

  const hasItems = computed(() => count.value > 0)

  watch(ids, (value) => {
    writeStoredIds(value)
  }, { deep: true })

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

  return {
    ids,
    count,
    products,
    hasItems,
    isInCompare,
    toggleCompare,
    clearCompare,
  }
})
