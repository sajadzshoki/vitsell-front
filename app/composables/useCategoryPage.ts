import type { Category } from '~/data/categories'
import { toSearchRoute } from '~/data/categories'
import type {
  CategoryPageMeta,
  CategorySuggestedItem,
} from '~/data/category-pages'
import type { Product } from '~/data/products'

type CategoryPagePayload = {
  meta: CategoryPageMeta | null
  suggested: CategorySuggestedItem[]
}

type CategoryPageData = {
  category: Category
  meta: CategoryPageMeta
  suggestedItems: CategorySuggestedItem[]
  popularProducts: Product[]
  dealProducts: Product[]
  brands: string[]
  articles: {
    id: string
    title: string
    excerpt: string
    image: string
    category: string
    readTime: string
    to: string
  }[]
  productCount: number
}

const emptyMeta = (): CategoryPageMeta => ({
  hero: {
    image: '',
    eyebrow: '',
    title: '',
    subtitle: '',
  },
  seo: {
    heading: '',
    paragraphs: [],
  },
})

export function useCategoryPage() {
  const route = useRoute()
  const { t } = useI18n()
  const { categories, fetchCategories, getCategoryById } = useCategories()
  const { fetchProducts } = useProducts()
  const { relatedForCategory, ensureLoaded: ensureBlog } = useBlog()

  const catId = computed(() => String(route.params.catId ?? ''))

  const blogRoute = '/blog'

  async function load(id: string): Promise<CategoryPageData> {
    if (!id) {
      throw createError({ statusCode: 404, statusMessage: t('دسته‌بندی یافت نشد') })
    }

    // Start every composable call before the first await so Nuxt context stays available.
    const categoriesPromise = fetchCategories({ withCounts: false })
    const blogPromise = ensureBlog()
    const catPromise = useGet<Category>(`/categories/${encodeURIComponent(id)}`, { headers: { 'no-error': true } })
    const pagePromise = useGet<CategoryPagePayload>(`/category-pages/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    const popularPromise = fetchProducts({ category: id, sort: 'bestselling', pageSize: 12 })
    const dealsPromise = fetchProducts({ category: id, onlyDiscount: true, sort: 'bestselling', pageSize: 8 })

    const [, , catRes, pageRes, popular, deals] = await Promise.all([
      categoriesPromise,
      blogPromise,
      catPromise,
      pagePromise,
      popularPromise,
      dealsPromise,
    ])

    const cat = catRes.result
    const page = pageRes.result

    const resolved = cat ?? getCategoryById(id)
    if (!resolved) {
      throw createError({ statusCode: 404, statusMessage: t('دسته‌بندی یافت نشد') })
    }

    let meta = page?.meta ?? emptyMeta()
    if (!meta.hero.title) {
      meta = {
        ...meta,
        hero: {
          ...meta.hero,
          title: resolved.name,
          subtitle: meta.hero.subtitle || resolved.name,
        },
        seo: {
          heading: meta.seo.heading || resolved.name,
          paragraphs: meta.seo.paragraphs,
        },
      }
    }

    const popularProducts = popular.result.items
    const dealProducts = deals.result.items
    const fallbackImage = meta.hero.image || popularProducts[0]?.image || ''
    const apiSuggested = page?.suggested ?? []
    const suggestedItems = apiSuggested.map((item, index) => ({
      ...item,
      image:
        item.image
        || popularProducts.find(p =>
          p.title.includes(item.query) || p.brand.includes(item.query),
        )?.image
        || popularProducts[index % Math.max(popularProducts.length, 1)]?.image
        || fallbackImage,
    }))

    const posts = relatedForCategory(id, 4)
    return {
      category: resolved,
      meta,
      suggestedItems,
      popularProducts,
      dealProducts,
      brands: Array.from(new Set(popularProducts.map(p => p.brand)))
        .sort((a, b) => a.localeCompare(b, 'fa')),
      articles: posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.image,
        category: post.category,
        readTime: post.readTime,
        to: `/blog/${post.id}`,
      })),
      productCount: popular.result.total,
    }
  }

  const { track } = useUserActivity()

  const asyncData = useAsyncData(
    () => `category-page-${catId.value}`,
    () => load(catId.value),
    { watch: [catId] },
  )
  const { data, pending } = asyncData

  watch(catId, (id, prev) => {
    if (prev && id !== prev) data.value = null
    if (import.meta.client && id) {
      void track({ type: 'category_view', category: id })
    }
  })

  const category = computed(() => data.value?.category)
  const meta = computed(() => data.value?.meta ?? emptyMeta())

  const searchAllRoute = computed(() =>
    toSearchRoute({ q: category.value?.name, category: catId.value }),
  )

  function searchRoute(query: string) {
    return toSearchRoute({ q: query, category: catId.value })
  }

  function brandRoute(brand: string) {
    return toSearchRoute({ q: brand, category: catId.value })
  }

  return {
    catId,
    category,
    categories,
    meta,
    popularProducts: computed(() => data.value?.popularProducts ?? []),
    dealProducts: computed(() => data.value?.dealProducts ?? []),
    brands: computed(() => data.value?.brands ?? []),
    suggestedItems: computed(() => data.value?.suggestedItems ?? []),
    articles: computed(() => data.value?.articles ?? []),
    blogRoute,
    productCount: computed(() => data.value?.productCount ?? 0),
    searchAllRoute,
    searchRoute,
    brandRoute,
    pending,
    loaded: computed(() => Boolean(data.value?.category)),
    ready: asyncData,
  }
}
