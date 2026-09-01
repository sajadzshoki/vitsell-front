import type { SellerFilterDef, SellerFilterValues } from '~/data/seller-filters'
import {
  clearFilterValues,
  countActiveFilters,
  filterValuesToQuery,
  parseFilterQuery,
} from '~/data/seller-filters'

/**
 * Declarative filters synced to the route query string.
 */
export function useSellerFilters(defs: MaybeRefOrGetter<SellerFilterDef[]>) {
  const route = useRoute()
  const router = useRouter()

  const resolvedDefs = computed(() => toValue(defs))

  const values = computed<SellerFilterValues>(() =>
    parseFilterQuery(route.query as Record<string, unknown>, resolvedDefs.value),
  )

  const activeCount = computed(() => countActiveFilters(values.value, resolvedDefs.value))

  async function setValues(partial: SellerFilterValues, options?: { resetPage?: boolean }) {
    const next = { ...values.value, ...partial }
    const filterQuery = filterValuesToQuery(next, resolvedDefs.value)
    const query: Record<string, string | string[] | undefined> = {
      ...route.query as Record<string, string | string[] | undefined>,
      ...filterQuery,
    }
    if (options?.resetPage !== false) {
      query.page = undefined
    }
    // Drop empty keys
    for (const key of Object.keys(query)) {
      const v = query[key]
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) {
        delete query[key]
      }
    }
    await router.replace({ query })
  }

  async function setFilter(key: string, value: string | string[] | boolean | null | undefined) {
    await setValues({ [key]: value })
  }

  async function clear() {
    const cleared = clearFilterValues(resolvedDefs.value)
    await setValues(cleared)
  }

  function getString(key: string, fallback = '') {
    const v = values.value[key]
    return typeof v === 'string' ? v : fallback
  }

  return {
    defs: resolvedDefs,
    values,
    activeCount,
    setValues,
    setFilter,
    clear,
    getString,
  }
}
