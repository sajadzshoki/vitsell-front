import type { HeroFeature, HeroSlide } from '~/data/hero'
import type { HomeCircleItem, HomePromo } from '~/data/home'
import type { Product } from '~/data/products'

export type HomePayload = {
  heroSlides: HeroSlide[]
  heroFeatures: HeroFeature[]
  brands: string[]
  circles: HomeCircleItem[]
  promos: HomePromo[]
  dealsOfTheDay: Product[]
  bestSellers: Product[]
  newArrivals: Product[]
}

function emptyHome(): HomePayload {
  return {
    heroSlides: [],
    heroFeatures: [],
    brands: [],
    circles: [],
    promos: [],
    dealsOfTheDay: [],
    bestSellers: [],
    newArrivals: [],
  }
}

export function useHome() {
  const home = useState<HomePayload>('home-payload', emptyHome)
  const loaded = useState('home-loaded', () => false)
  const pending = useState('home-pending', () => false)
  const error = useState<string | null>('home-error', () => null)
  const inFlight = useState<Promise<{ home: HomePayload }> | null>('home-inflight', () => null)
  const { categories, fetchCategories } = useCategories()

  const heroSlides = computed(() => home.value.heroSlides)
  const heroFeatures = computed(() => home.value.heroFeatures)
  const brands = computed(() => home.value.brands)
  const circles = computed(() => home.value.circles)
  const promos = computed(() => home.value.promos)
  const dealsOfTheDay = computed(() => home.value.dealsOfTheDay)
  const bestSellers = computed(() => home.value.bestSellers)

  async function fetchHome(options?: { force?: boolean }) {
    if (loaded.value && !options?.force) {
      return { home: home.value, categories: categories.value }
    }
    if (inFlight.value) return inFlight.value

    pending.value = true
    error.value = null

    const run = (async () => {
      try {
        const [{ result: homeResult, error: homeError }] = await Promise.all([
          useGet<HomePayload>('/home', { headers: { 'no-error': true } }),
          fetchCategories({ withCounts: false }),
        ])

        if (homeError || !homeResult) {
          home.value = emptyHome()
          error.value = 'home_fetch_failed'
          loaded.value = true
          return { home: home.value, categories: categories.value }
        }

        home.value = {
          heroSlides: homeResult.heroSlides ?? [],
          heroFeatures: homeResult.heroFeatures ?? [],
          brands: homeResult.brands ?? [],
          circles: homeResult.circles ?? [],
          promos: homeResult.promos ?? [],
          dealsOfTheDay: homeResult.dealsOfTheDay ?? [],
          bestSellers: homeResult.bestSellers ?? [],
          newArrivals: homeResult.newArrivals ?? [],
        }
        loaded.value = true
        return { home: home.value, categories: categories.value }
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
    home,
    categories,
    loaded,
    pending,
    error,
    heroSlides,
    heroFeatures,
    brands,
    circles,
    promos,
    dealsOfTheDay,
    bestSellers,
    fetchHome,
  }
}
