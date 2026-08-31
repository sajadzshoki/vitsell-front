import type { Product } from '~/data/products'

export type ActivityEventType =
  | 'product_view'
  | 'category_view'
  | 'search'
  | 'add_to_cart'
  | 'wishlist'

export type ActivityEvent = {
  type: ActivityEventType
  productId?: string
  category?: string
  query?: string
  at: number
}

type RecommendationsPayload = {
  items: Product[]
  personalized: boolean
  categories: string[]
}

const STORAGE_KEY = 'digishop-user-activity'
const MAX_LOCAL_EVENTS = 120

const EVENT_WEIGHTS: Record<ActivityEventType, number> = {
  product_view: 1,
  category_view: 3,
  search: 2,
  add_to_cart: 5,
  wishlist: 4,
}

function readLocal(): ActivityEvent[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ActivityEvent[]
    return Array.isArray(parsed) ? parsed.filter(e => e && e.type && e.at) : []
  }
  catch {
    return []
  }
}

function writeLocal(events: ActivityEvent[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_LOCAL_EVENTS)))
  }
  catch {
    /* quota / private mode */
  }
}

function scoreCategories(events: ActivityEvent[], limit = 3): string[] {
  const scores = new Map<string, number>()
  for (const event of events) {
    const cat = (event.category ?? '').trim()
    if (!cat) continue
    scores.set(cat, (scores.get(cat) ?? 0) + (EVENT_WEIGHTS[event.type] ?? 1))
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
    .slice(0, limit)
}

function viewedProductIds(events: ActivityEvent[], limit = 40): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const event of events) {
    if (event.type !== 'product_view' || !event.productId) continue
    if (seen.has(event.productId)) continue
    seen.add(event.productId)
    ids.push(event.productId)
    if (ids.length >= limit) break
  }
  return ids
}

export function useUserActivity() {
  const { token } = useAuth()
  const { bestSellers } = useHome()
  const { remember } = useProducts()

  const events = useState<ActivityEvent[]>('user-activity-events', () => [])
  const recommendations = useState<Product[]>('user-activity-recs', () => [])
  const personalized = useState('user-activity-personalized', () => false)
  const recCategories = useState<string[]>('user-activity-rec-categories', () => [])
  const pending = useState('user-activity-pending', () => false)
  const synced = useState('user-activity-synced', () => false)
  const hydrated = useState('user-activity-hydrated', () => false)

  function hydrateLocal() {
    if (hydrated.value || !import.meta.client) return
    events.value = readLocal()
    hydrated.value = true
  }

  function persist(next: ActivityEvent[]) {
    events.value = next
    writeLocal(next)
  }

  async function pushRemote(batch: ActivityEvent[]) {
    if (!token.value || !batch.length) return
    await usePost('/activity', {
      events: batch.map(e => ({
        type: e.type,
        productId: e.productId,
        category: e.category,
        query: e.query,
        at: e.at,
      })),
    }, { headers: { 'no-error': true } })
  }

  async function track(input: {
    type: ActivityEventType
    productId?: string
    category?: string
    query?: string
  }) {
    hydrateLocal()
    const event: ActivityEvent = {
      type: input.type,
      productId: input.productId,
      category: input.category?.trim() || undefined,
      query: input.query?.trim() || undefined,
      at: Date.now(),
    }

    // de-dupe rapid repeats of the same signal within 30s
    if (event.type === 'product_view' && event.productId) {
      const last = events.value.find(e => e.type === 'product_view' && e.productId === event.productId)
      if (last && event.at - last.at < 30_000) return
    }
    if (event.type === 'category_view' && event.category) {
      const last = events.value.find(e => e.type === 'category_view' && e.category === event.category)
      if (last && event.at - last.at < 60_000) return
    }
    if (event.type === 'search' && event.query) {
      const last = events.value.find(e => e.type === 'search' && e.query === event.query && e.category === event.category)
      if (last && event.at - last.at < 30_000) return
    }

    const next = [event, ...events.value].slice(0, MAX_LOCAL_EVENTS)
    persist(next)
    void pushRemote([event])
  }

  function topCategories(limit = 3) {
    hydrateLocal()
    return scoreCategories(events.value, limit)
  }

  async function syncToServer() {
    if (!token.value) return
    hydrateLocal()
    if (!events.value.length) {
      synced.value = true
      return
    }
    await usePost('/activity/sync', {
      events: events.value.slice(0, 100).map(e => ({
        type: e.type,
        productId: e.productId,
        category: e.category,
        query: e.query,
        at: e.at,
      })),
    }, { headers: { 'no-error': true } })
    synced.value = true
  }

  async function fetchRecommendations(options?: { force?: boolean, limit?: number }) {
    hydrateLocal()
    if (pending.value && !options?.force) return recommendations.value

    pending.value = true
    try {
      const categories = topCategories(3)
      const exclude = viewedProductIds(events.value).slice(0, 20)
      const query: Record<string, string> = {
        limit: String(options?.limit ?? 12),
      }
      if (categories.length) query.categories = categories.join(',')
      if (exclude.length) query.exclude = exclude.join(',')

      const qs = new URLSearchParams(query).toString()
      const { result } = await useGet<RecommendationsPayload>(`/recommendations?${qs}`, {
        headers: { 'no-error': true },
      })

      if (result?.items?.length) {
        recommendations.value = result.items
        personalized.value = Boolean(result.personalized)
        recCategories.value = result.categories ?? categories
        remember(result.items)
        return recommendations.value
      }

      // client fallback from home bestsellers
      const fallback = bestSellers.value.slice(0, options?.limit ?? 12)
      recommendations.value = fallback
      personalized.value = false
      recCategories.value = []
      return fallback
    }
    finally {
      pending.value = false
    }
  }

  return {
    events,
    recommendations,
    personalized,
    recCategories,
    pending,
    synced,
    track,
    topCategories,
    syncToServer,
    fetchRecommendations,
    hydrateLocal,
  }
}
