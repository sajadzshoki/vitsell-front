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

  const catId = computed(() => String(route.params.catId ?? ''))
  const category = ref<Category | undefined>()
  const meta = ref<CategoryPageMeta>(emptyMeta())
  const suggestedItems = ref<CategorySuggestedItem[]>([])
  const popularProducts = ref<Product[]>([])
  const dealProducts = ref<Product[]>([])
  const brands = ref<string[]>([])
  const articles = ref<{
    id: string
    title: string
    excerpt: string
    image: string
    category: string
    readTime: string
    to: string
  }[]>([])
  const productCount = ref(0)

  const blogRoute = '/blog'

  const searchAllRoute = computed(() =>
    toSearchRoute({ q: category.value?.name, category: catId.value }),
  )

  function searchRoute(query: string) {
    return toSearchRoute({ q: query, category: catId.value })
  }

  function brandRoute(brand: string) {
    return toSearchRoute({ q: brand, category: catId.value })
  }

  async function load() {
    await fetchCategories({ withCounts: false })
    const id = catId.value
    if (!id) {
      throw createError({ statusCode: 404, statusMessage: t('دسته‌بندی یافت نشد') })
    }

    const { relatedForCategory, ensureLoaded: ensureBlog } = useBlog()
    await ensureBlog()

    const [{ result: cat }, { result: page }, popular, deals] = await Promise.all([
      useGet<Category>(`/categories/${encodeURIComponent(id)}`, { headers: { 'no-error': true } }),
      useGet<CategoryPagePayload>(`/category-pages/${encodeURIComponent(id)}`, {
        headers: { 'no-error': true },
      }),
      fetchProducts({ category: id, sort: 'bestselling', pageSize: 12 }),
      fetchProducts({ category: id, onlyDiscount: true, sort: 'bestselling', pageSize: 8 }),
    ])

    const resolved = cat ?? getCategoryById(id)
    if (!resolved) {
      throw createError({ statusCode: 404, statusMessage: t('دسته‌بندی یافت نشد') })
    }

    category.value = resolved
    meta.value = page?.meta ?? emptyMeta()
    if (!meta.value.hero.title) {
      meta.value = {
        ...meta.value,
        hero: {
          ...meta.value.hero,
          title: resolved.name,
          subtitle: meta.value.hero.subtitle || resolved.name,
        },
        seo: {
          heading: meta.value.seo.heading || resolved.name,
          paragraphs: meta.value.seo.paragraphs,
        },
      }
    }

    popularProducts.value = popular.result.items
    dealProducts.value = deals.result.items
    productCount.value = popular.result.total
    brands.value = Array.from(new Set(popular.result.items.map(p => p.brand)))
      .sort((a, b) => a.localeCompare(b, 'fa'))

    const fallbackImage = meta.value.hero.image || popular.result.items[0]?.image || ''
    const apiSuggested = page?.suggested ?? []
    suggestedItems.value = apiSuggested.map((item, index) => ({
      ...item,
      image:
        item.image
        || popular.result.items.find(p =>
          p.title.includes(item.query) || p.brand.includes(item.query),
        )?.image
        || popular.result.items[index % Math.max(popular.result.items.length, 1)]?.image
        || fallbackImage,
    }))

    const posts = relatedForCategory(id, 4)
    articles.value = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image,
      category: post.category,
      readTime: post.readTime,
      to: `/blog/${post.id}`,
    }))
  }

  watch(catId, () => {
    load()
    if (catId.value) {
      const { track } = useUserActivity()
      void track({ type: 'category_view', category: catId.value })
    }
  }, { immediate: true })

  return {
    catId,
    category: computed(() => category.value),
    categories,
    meta: computed(() => meta.value),
    popularProducts: computed(() => popularProducts.value),
    dealProducts: computed(() => dealProducts.value),
    brands: computed(() => brands.value),
    suggestedItems: computed(() => suggestedItems.value),
    articles: computed(() => articles.value),
    blogRoute,
    productCount: computed(() => productCount.value),
    searchAllRoute,
    searchRoute,
    brandRoute,
  }
}
