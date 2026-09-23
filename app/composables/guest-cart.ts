import type { Product } from '~/data/products'
import { variantLabel as formatVariantLabel } from '~/data/seller-product-variants'

export type CartLine = {
  id: string
  qty: number
  product: Product
  variantId?: string | null
  variantLabel?: string
}

const STORAGE_KEY = 'vitsell-guest-cart'

export function guestCartLineId(productId: string, variantId?: string | null) {
  return `guest:${productId}:${variantId || '_'}`
}

export function readGuestCart(): CartLine[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(line =>
      line
      && typeof line.id === 'string'
      && typeof line.qty === 'number'
      && line.qty > 0
      && line.product
      && typeof line.product.id === 'string',
    )
  }
  catch {
    return []
  }
}

export function writeGuestCart(lines: CartLine[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }
  catch {
    /* quota / private mode */
  }
}

export function clearGuestCartStorage() {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

/** Apply variant price/image onto a product snapshot for guest cart display. */
export function productForGuestLine(product: Product, variantId?: string | null): {
  product: Product
  variantLabel?: string
} {
  if (!variantId) return { product }
  const variant = product.variants?.find(v => v.id === variantId)
  if (!variant) return { product }

  const price = variant.salePrice != null && variant.salePrice > 0
    ? variant.salePrice
    : variant.price
  const oldPrice = product.oldPrice != null && product.oldPrice > price
    ? product.oldPrice
    : (variant.price > price ? variant.price : undefined)

  return {
    product: {
      ...product,
      price,
      ...(oldPrice != null ? { oldPrice } : { oldPrice: undefined }),
      image: variant.image || product.image,
      inStock: variant.status === 'active' && variant.stock > 0,
      stock: Math.max(0, variant.stock || 0),
      sku: variant.sku || product.sku,
      barcode: variant.barcode || product.barcode,
      weight: variant.weight || product.weight,
    },
    variantLabel: formatVariantLabel(variant) || undefined,
  }
}
