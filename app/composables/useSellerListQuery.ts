/**
 * Sync common list query params (search, status, sort, page) to the URL.
 * Use with useSellerFilters for advanced/declarative filters.
 */
export function useSellerListQuery(options?: {
  defaultStatus?: string
  defaultSort?: string
  defaultPage?: number
  searchKey?: string
  statusKey?: string
  sortKey?: string
  pageKey?: string
}) {
  const route = useRoute()
  const router = useRouter()

  const searchKey = options?.searchKey ?? 'q'
  const statusKey = options?.statusKey ?? 'status'
  const sortKey = options?.sortKey ?? 'sort'
  const pageKey = options?.pageKey ?? 'page'
  const defaultStatus = options?.defaultStatus ?? 'all'
  const defaultSort = options?.defaultSort ?? ''
  const defaultPage = options?.defaultPage ?? 1

  const search = computed({
    get: () => String(route.query[searchKey] ?? ''),
    set: (value: string) => {
      void patchQuery({ [searchKey]: value.trim() || undefined, [pageKey]: undefined })
    },
  })

  const status = computed({
    get: () => String(route.query[statusKey] ?? defaultStatus),
    set: (value: string) => {
      const next = !value || value === defaultStatus ? undefined : value
      void patchQuery({ [statusKey]: next, [pageKey]: undefined })
    },
  })

  const sort = computed({
    get: () => String(route.query[sortKey] ?? defaultSort),
    set: (value: string) => {
      void patchQuery({ [sortKey]: value || undefined, [pageKey]: undefined })
    },
  })

  const page = computed({
    get: () => {
      const raw = Number(route.query[pageKey])
      return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : defaultPage
    },
    set: (value: number) => {
      const next = value <= defaultPage ? undefined : String(value)
      void patchQuery({ [pageKey]: next })
    },
  })

  const hasActiveFilters = computed(() => {
    return Boolean(
      search.value
      || (status.value && status.value !== defaultStatus)
      || (sort.value && sort.value !== defaultSort)
      || page.value !== defaultPage,
    )
  })

  async function patchQuery(partial: Record<string, string | undefined>) {
    const query: Record<string, string | string[] | undefined> = {
      ...(route.query as Record<string, string | string[] | undefined>),
      ...partial,
    }
    for (const key of Object.keys(query)) {
      const v = query[key]
      if (v == null || v === '') delete query[key]
    }
    await router.replace({ query })
  }

  async function clearFilters() {
    await patchQuery({
      [searchKey]: undefined,
      [statusKey]: undefined,
      [sortKey]: undefined,
      [pageKey]: undefined,
    })
  }

  return {
    search,
    status,
    sort,
    page,
    hasActiveFilters,
    clearFilters,
    patchQuery,
  }
}
