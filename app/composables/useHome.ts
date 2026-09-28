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
  homeSeoBlocks,
  homeAppStores,
} from '~/data/home'
import { type Product } from '~/data/products'

export type HomeCategoryShelfPayload = HomeCategoryShelf & {
  products?: Product[]
}

export type HomePayload = {
  heroSlides: HeroSlide[]
  heroFeatures: HeroFeature[]
  brands: string[]
  circles: HomeCircleItem[]
  promos: HomePromo[]
  bannerRows: HomeBannerRow[]
  categoryShelves: HomeCategoryShelfPayload[]
  topMobileBrands: HomeTopBrand[]
  dealsOfTheDay: Product[]
  bestSellers: Product[]
  newArrivals: Product[]
  seoBlocks: HomeSeoBlock[]
}

function emptyHome(): HomePayload {
  return {
    heroSlides: [],
    heroFeatures: [],
    brands: [],
    circles: [],
    promos: [],
    bannerRows: [],
    categoryShelves: [],
    topMobileBrands: [],
    dealsOfTheDay: [],
    bestSellers: [],
    newArrivals: [],
    seoBlocks: [],
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

function asBannerRows(raw: unknown): HomeBannerRow[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row, index) => {
      const items = Array.isArray(row?.items)
        ? row.items.map((item: any, i: number) => ({
            id: String(item?.id || `banner-${index}-${i}`),
            title: String(item?.title || ''),
            subtitle: item?.subtitle ? String(item.subtitle) : undefined,
            image: String(item?.image || ''),
            to: String(item?.to || '/'),
            tone: (['primary', 'secondary', 'warning', 'success', 'inverted'].includes(item?.tone)
              ? item.tone
              : 'primary') as HomeBannerRow['items'][number]['tone'],
          })).filter((item: { image: string }) => Boolean(item.image))
        : []
      return {
        id: String(row?.id || `row-${index + 1}`),
        items,
      }
    })
    .filter(row => row.items.length > 0)
}

function asCategoryShelves(raw: unknown): HomeCategoryShelfPayload[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((shelf: any, index: number) => ({
      id: String(shelf?.id || `shelf-${index + 1}`),
      title: String(shelf?.title || ''),
      category: String(shelf?.category || ''),
      viewAllTo: String(shelf?.viewAllTo || `/search/category-${encodeURIComponent(String(shelf?.category || ''))}`),
      products: Array.isArray(shelf?.products) ? shelf.products as Product[] : [],
    }))
    .filter(shelf => shelf.category && shelf.title)
}

function asSeoBlocks(raw: unknown): HomeSeoBlock[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((block: any) => {
      const title = String(block?.title || '').trim()
      const paragraphs = Array.isArray(block?.paragraphs)
        ? block.paragraphs.map((item: unknown) => String(item || '').trim()).filter(Boolean)
        : []
      const label = String(block?.inlineLink?.label || '').trim()
      const to = String(block?.inlineLink?.to || '').trim()
      if (!title || !paragraphs.length) return null
      const next: HomeSeoBlock = { title, paragraphs }
      if (label && to) next.inlineLink = { label, to }
      return next
    })
    .filter((block): block is HomeSeoBlock => Boolean(block))
}

function asTopMobileBrands(raw: unknown): HomeTopBrand[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((brand: any) => ({
      id: String(brand?.id || ''),
      name: String(brand?.name || ''),
      image: String(brand?.image || ''),
      to: String(brand?.to || '/search'),
    }))
    .filter(brand => brand.id && brand.name && brand.image)
}

export function useHome() {
  const home = useState<HomePayload>('home-payload', emptyHome)
  const loaded = useState('home-loaded', () => false)
  const pending = useState('home-pending', () => false)
  const error = useState<string | null>('home-error', () => null)
  const inFlight = useRequestRef<Promise<{ home: HomePayload }> | null>('home-inflight', () => null)
  const { categories, fetchCategories } = useCategories()

  const heroSlides = computed(() => home.value.heroSlides)
  const heroFeatures = computed(() => home.value.heroFeatures)
  const brands = computed(() => home.value.brands)
  const circles = computed(() => home.value.circles)
  const promos = computed(() => home.value.promos)
  const dealsOfTheDay = computed(() => home.value.dealsOfTheDay)
  const bestSellers = computed(() => home.value.bestSellers)
  const newArrivals = computed(() => home.value.newArrivals)

  const catalogProducts = computed(() =>
    uniqueProducts([
      ...home.value.dealsOfTheDay,
      ...home.value.bestSellers,
      ...home.value.newArrivals,
      ...home.value.categoryShelves.flatMap(s => s.products || []),
    ]),
  )

  const bannerRows = computed<HomeBannerRow[]>(() => home.value.bannerRows)
  const topMobileBrands = computed<HomeTopBrand[]>(() => home.value.topMobileBrands)
  const categoryShelves = computed<HomeCategoryShelf[]>(() =>
    home.value.categoryShelves.map(({ products: _p, ...shelf }) => shelf),
  )
  const seoBlocks = computed<HomeSeoBlock[]>(() =>
    home.value.seoBlocks.length ? home.value.seoBlocks : homeSeoBlocks,
  )

  const { footer, fetchFooter } = useFooter()
  const appStores = computed<HomeAppStore[]>(() => {
    const fromFooter = footer.value.appStores || []
    if (fromFooter.length) {
      return fromFooter.map(s => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        href: s.href,
      }))
    }
    return homeAppStores
  })

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
    const shelf = home.value.categoryShelves.find(s => s.category === category)
    if (shelf?.products?.length) {
      return shelf.products.slice(0, limit)
    }
    return catalogProducts.value
      .filter(p => p.category === category)
      .slice(0, limit)
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
          fetchFooter(),
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
          bannerRows: asBannerRows(homeResult.bannerRows),
          categoryShelves: asCategoryShelves(homeResult.categoryShelves),
          topMobileBrands: asTopMobileBrands(homeResult.topMobileBrands),
          dealsOfTheDay: homeResult.dealsOfTheDay ?? [],
          bestSellers: homeResult.bestSellers ?? [],
          newArrivals: homeResult.newArrivals ?? [],
          seoBlocks: asSeoBlocks(homeResult.seoBlocks),
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
