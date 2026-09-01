import type { HeroFeature, HeroSlide } from '~/data/hero'
import type {
  HomeBannerRow,
  HomeCategoryShelf,
  HomeCircleItem,
  HomePromo,
  HomeSeoBlock,
  HomeTopBrand,
  HomeAppStore,
} from '~/data/home'
import {
  homeBannerRows,
  homeCategoryShelves,
  homeSeoBlocks,
  homeTopMobileBrands,
  homeAppStores,
} from '~/data/home'
import { products as localProducts, type Product } from '~/data/products'

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

function uniqueProducts(list: Product[]) {
  const seen = new Set<string>()
  return list.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
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
  const newArrivals = computed(() => home.value.newArrivals)

  const catalogProducts = computed(() => {
    const fromApi = uniqueProducts([
      ...home.value.dealsOfTheDay,
      ...home.value.bestSellers,
      ...home.value.newArrivals,
    ])
    return fromApi.length ? fromApi : localProducts
  })

  const bannerRows = computed<HomeBannerRow[]>(() => homeBannerRows)
  const topMobileBrands = computed<HomeTopBrand[]>(() => homeTopMobileBrands)
  const categoryShelves = computed<HomeCategoryShelf[]>(() => homeCategoryShelves)
  const seoBlocks = computed<HomeSeoBlock[]>(() => homeSeoBlocks)
  const appStores = computed<HomeAppStore[]>(() => homeAppStores)
  const { publishedPosts, ensureLoaded: ensureBlogLoaded } = useBlog()
  const homeBlogPosts = computed(() =>
    publishedPosts.value.slice(0, 8).map(p => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      category: p.category,
      readTime: p.readTime,
      author: p.author,
      image: p.image,
      relatedCategories: [...p.relatedCategories],
      content: [...p.content],
      highlights: p.highlights ? [...p.highlights] : undefined,
      popular: p.popular,
      engagement: p.engagement,
      active: p.active,
    })),
  )

  function productsForCategory(category: string, limit = 10): Product[] {
    const fromCatalog = catalogProducts.value
      .filter(p => p.category === category)
      .slice(0, limit)
    if (fromCatalog.length >= 4) return fromCatalog
    return localProducts.filter(p => p.category === category).slice(0, limit)
  }

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
          ensureBlogLoaded(),
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
    newArrivals,
    catalogProducts,
    bannerRows,
    topMobileBrands,
    categoryShelves,
    seoBlocks,
    appStores,
    homeBlogPosts,
    productsForCategory,
    fetchHome,
  }
}
