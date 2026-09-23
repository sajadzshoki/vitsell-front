import { staticPagePaths } from '~/data/static-pages'

const PAGE_SIZE = 48
const MAX_PAGES = 400

type SeoBits = { robots?: string | null } | null | undefined

type CatalogProduct = {
  id?: string
  published?: boolean
  seo?: SeoBits
}

type ProductsPage = {
  items?: CatalogProduct[]
  total?: number
  page?: number
  pageSize?: number
}

type CatalogCategory = {
  id?: string
  seo?: SeoBits
}

type CatalogPost = {
  id?: string
  seo?: SeoBits
}

function isProductionStoreHost(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'vitsell.ir' || host === 'www.vitsell.ir'
  }
  catch {
    return false
  }
}

function isIndexable(seo: SeoBits) {
  const robots = String(seo?.robots || 'index,follow').trim().toLowerCase()
  return !robots.startsWith('noindex')
}

function addLoc(locs: Map<string, { loc: string }>, path: string) {
  const loc = path.startsWith('/') ? path : `/${path}`
  if (!loc || loc === '/search' || locs.has(loc)) return
  locs.set(loc, { loc })
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    return await $fetch<T>(url, { timeout: 8000 })
  }
  catch {
    return null
  }
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const storeUrl = String(config.public?.storeUrl || '')
  const appMode = String(config.public?.appMode || 'store')
  if (appMode === 'admin' || !isProductionStoreHost(storeUrl)) return []

  const apiBase = String(config.public?.apiBase || '').replace(/\/+$/, '')
  if (!apiBase) return []

  const locs = new Map<string, { loc: string }>()

  const staticPaths = [
    '/',
    '/category',
    '/blog',
    ...Object.values(staticPagePaths),
  ]
  for (const path of staticPaths) addLoc(locs, path)

  let page = 1
  let total = Number.POSITIVE_INFINITY
  while (page <= MAX_PAGES && (page - 1) * PAGE_SIZE < total) {
    const payload = await fetchJson<ProductsPage>(
      `${apiBase}/products?page=${page}&pageSize=${PAGE_SIZE}`,
    )
    const items = payload?.items
    if (!items?.length) break
    total = Number(payload?.total ?? items.length)
    for (const product of items) {
      const id = String(product?.id || '').trim()
      if (!id || product.published === false || !isIndexable(product.seo)) continue
      addLoc(locs, `/product/${id}`)
    }
    if (items.length < PAGE_SIZE) break
    page += 1
  }

  const categories = await fetchJson<CatalogCategory[]>(`${apiBase}/categories`)
  if (Array.isArray(categories)) {
    for (const category of categories) {
      const id = String(category?.id || '').trim()
      if (!id || !isIndexable(category.seo)) continue
      addLoc(locs, `/category/${id}`)
      addLoc(locs, `/search/category-${id}`)
    }
  }

  const posts = await fetchJson<CatalogPost[]>(`${apiBase}/blog`)
  if (Array.isArray(posts)) {
    for (const post of posts) {
      const id = String(post?.id || '').trim()
      if (!id || !isIndexable(post.seo)) continue
      addLoc(locs, `/blog/${id}`)
    }
  }

  return [...locs.values()]
})
