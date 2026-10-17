import type { Product } from '~/data/products'
import { normalizeRelatedProductIds } from '~/data/products'

/** Load seller-curated related products by id list (order preserved). */
export function useRelatedProducts() {
  const { fetchProducts, getCachedProduct, remember } = useProducts()

  async function fetchRelatedByIds(ids: string[], options?: { excludeIds?: string[] }) {
    const exclude = new Set((options?.excludeIds || []).map(String))
    const ordered = normalizeRelatedProductIds(ids).filter(id => !exclude.has(id))
    if (!ordered.length) return [] as Product[]

    const missing = ordered.filter(id => !getCachedProduct(id))
    if (missing.length) {
      const { result } = await fetchProducts({
        ids: missing,
        pageSize: Math.min(100, missing.length),
        page: 1,
      })
      if (result?.items?.length) remember(result.items)
    }

    const out: Product[] = []
    for (const id of ordered) {
      const product = getCachedProduct(id)
      if (product) out.push(product)
    }
    return out
  }

  async function fetchRelatedForProduct(product: Product | null | undefined) {
    if (!product) return [] as Product[]
    return fetchRelatedByIds(product.relatedProductIds || [], { excludeIds: [product.id] })
  }

  /** Union of related ids from cart lines, excluding products already in cart. */
  async function fetchRelatedForCart(cartProductIds: string[]) {
    const ids = [...new Set(cartProductIds.map(String).filter(Boolean))]
    const inCart = new Set(ids)
    if (!ids.length) return [] as Product[]

    // Refresh cart products so relatedProductIds is current (not a stale cache).
    const { result } = await fetchProducts({
      ids,
      pageSize: Math.min(100, ids.length),
      page: 1,
    })
    if (result?.items?.length) remember(result.items)

    const ordered: string[] = []
    const seen = new Set<string>()
    for (const id of ids) {
      const product = getCachedProduct(id) || result?.items?.find(p => p.id === id)
      for (const relatedId of normalizeRelatedProductIds(product?.relatedProductIds)) {
        if (inCart.has(relatedId) || seen.has(relatedId)) continue
        seen.add(relatedId)
        ordered.push(relatedId)
      }
    }

    return fetchRelatedByIds(ordered, { excludeIds: [...inCart] })
  }

  return {
    fetchRelatedByIds,
    fetchRelatedForProduct,
    fetchRelatedForCart,
  }
}
