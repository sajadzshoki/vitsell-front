import {
  categories,
  getCategoryById,
  toSearchRoute,
  type Category,
} from '~/data/categories'
import {
  buildSuggestedItems,
  getCategoryPageMeta,
  type CategoryPageMeta,
  type CategorySuggestedItem,
} from '~/data/category-pages'
import {
  getBlogPostPath,
  getRelatedBlogPosts,
  staticPagePaths,
} from '~/data/static-pages'
import { products } from '~/data/products'

export function useCategoryPage() {
  const route = useRoute()
  const { t } = useI18n()

  const catId = computed(() => String(route.params.catId ?? ''))

  const category = computed<Category | undefined>(() => getCategoryById(catId.value))

  watch(
    category,
    (value) => {
      if (catId.value && !value) {
        throw createError({
          statusCode: 404,
          statusMessage: t('دسته‌بندی یافت نشد'),
        })
      }
    },
    { immediate: true },
  )

  const meta = computed<CategoryPageMeta>(() => getCategoryPageMeta(catId.value))

  const categoryProducts = computed(() =>
    products.filter(p => p.category === catId.value),
  )

  const popularProducts = computed(() =>
    [...categoryProducts.value]
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 12),
  )

  const dealProducts = computed(() =>
    categoryProducts.value
      .filter(p => p.oldPrice)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 8),
  )

  const brands = computed(() =>
    Array.from(new Set(categoryProducts.value.map(p => p.brand)))
      .sort((a, b) => a.localeCompare(b, 'fa')),
  )

  const suggestedItems = computed<CategorySuggestedItem[]>(() => {
    const cat = category.value
    if (!cat) return []

    const fallback = meta.value.hero.image
    const base = buildSuggestedItems(cat, fallback)

    return base.map((item, index) => {
      const match = categoryProducts.value.find(p =>
        p.title.includes(item.query) || p.brand.includes(item.query),
      )
      return {
        ...item,
        image: match?.image ?? categoryProducts.value[index % Math.max(categoryProducts.value.length, 1)]?.image ?? fallback,
      }
    })
  })

  const articles = computed(() =>
    getRelatedBlogPosts(catId.value).map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image,
      category: post.category,
      readTime: post.readTime,
      to: getBlogPostPath(post.id),
    })),
  )

  const blogRoute = staticPagePaths.blog

  const productCount = computed(() => categoryProducts.value.length)

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
    popularProducts,
    dealProducts,
    brands,
    suggestedItems,
    articles,
    blogRoute,
    productCount,
    searchAllRoute,
    searchRoute,
    brandRoute,
  }
}
