import type { Product } from '~/data/products'

export type ProductsQuery = {
  q?: string
  category?: string
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  onlyDiscount?: boolean
  onlyInStock?: boolean
  fastDelivery?: boolean
  minRating?: number
  sort?: string
  page?: number
  pageSize?: number
}

export type ProductsResult = {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

function toQueryString(query: ProductsQuery) {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.category) params.set('category', query.category)
  if (query.brands?.length) params.set('brands', query.brands.join(','))
  if (query.minPrice != null) params.set('minPrice', String(query.minPrice))
  if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice))
  if (query.onlyDiscount) params.set('onlyDiscount', 'true')
  if (query.onlyInStock) params.set('onlyInStock', 'true')
  if (query.fastDelivery) params.set('fastDelivery', 'true')
  if (query.minRating) params.set('minRating', String(query.minRating))
  if (query.sort) params.set('sort', query.sort)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useProducts() {
  const cache = useState<Record<string, Product>>('products-by-id', () => ({}))

  function remember(products: Product[]) {
    const next = { ...cache.value }
    for (const p of products) next[p.id] = p
    cache.value = next
  }

  async function fetchProducts(query: ProductsQuery = {}) {
    const { result, error } = await useGet<ProductsResult>(
      `/products${toQueryString(query)}`,
      { headers: { 'no-error': true } },
    )
    if (result?.items) remember(result.items)
    return { result: result ?? { items: [], total: 0, page: 1, pageSize: query.pageSize ?? 12 }, error }
  }

  async function fetchProduct(id: string) {
    if (cache.value[id]) {
      return { result: cache.value[id], error: undefined }
    }
    const { result, error } = await useGet<Product>(`/products/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (result) remember([result])
    return { result, error }
  }

  function getCachedProduct(id: string) {
    return cache.value[id]
  }

  return {
    cache,
    fetchProducts,
    fetchProduct,
    getCachedProduct,
    remember,
  }
}
