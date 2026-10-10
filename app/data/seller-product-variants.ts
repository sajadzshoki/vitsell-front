import { emptySeoMeta, type SeoMeta } from '~/data/seo'

export type SellerProductVariantStatus = 'active' | 'inactive'

export type SellerProductVariantOption = {
  attributeId: string
  attributeName: string
  valueId: string
  label: string
  meta?: string | null
}

export type SellerProductVariant = {
  id: string
  key: string
  options: SellerProductVariantOption[]
  sku: string
  barcode: string
  price: number
  salePrice: number | null
  stock: number
  lowStockThreshold: number
  weight: string
  image: string
  status: SellerProductVariantStatus
}

export type SellerProductVariantAxisValueMeta = {
  label: string
  attributeName: string
  meta?: string | null
}

export type SellerProductVariantAxis = {
  attributeId: string
  valueIds: string[]
  /** Product-specific price delta for each selected value (can be negative). */
  priceAdjustments?: Record<string, number>
  /**
   * Denormalized option labels for the storefront.
   * Keeps axis values visible even when price adjustment is 0 / unset.
   */
  valueMeta?: Record<string, SellerProductVariantAxisValueMeta>
}

/** Extended product commerce fields (persisted via listing product payload) */
export type SellerProductCommerce = {
  productId: string
  slug: string
  featured: boolean
  published: boolean
  sku: string
  barcode: string
  weight: string
  tags: string[]
  seo: SeoMeta
  variantAxes: SellerProductVariantAxis[]
  variants: SellerProductVariant[]
  lowStockThreshold: number
  warehouseId: string | null
}

export function emptyProductCommerce(productId = ''): SellerProductCommerce {
  return {
    productId,
    slug: productId,
    featured: false,
    published: true,
    sku: '',
    barcode: '',
    weight: '',
    tags: [],
    seo: emptySeoMeta(),
    variantAxes: [],
    variants: [],
    lowStockThreshold: 5,
    warehouseId: 'wh-tehran',
  }
}

export function variantLabel(variant: SellerProductVariant) {
  return variant.options.map(o => o.label).join(' / ')
}

export function variantPriceAdjustment(
  axes: SellerProductVariantAxis[] | null | undefined,
  variant: SellerProductVariant | null | undefined,
) {
  if (!variant) return 0
  const byAttribute = new Map((axes ?? []).map(axis => [axis.attributeId, axis]))
  return variant.options.reduce((sum, option) => {
    const value = Number(byAttribute.get(option.attributeId)?.priceAdjustments?.[option.valueId])
    return sum + (Number.isFinite(value) ? value : 0)
  }, 0)
}

export function variantFinalPrice(
  basePrice: number,
  axes: SellerProductVariantAxis[] | null | undefined,
  variant: SellerProductVariant | null | undefined,
) {
  return Math.max(0, Number(basePrice || 0) + variantPriceAdjustment(axes, variant))
}

export function variantMatchesSelection(
  variant: SellerProductVariant,
  selection: Record<string, string>,
) {
  return variant.options.every(option => selection[option.attributeId] === option.valueId)
}

/** Storefront query key for the active product variant (`?v=<id>`). */
export const PRODUCT_VARIANT_QUERY_KEY = 'v'

export function selectionFromVariant(variant: SellerProductVariant | null | undefined) {
  if (!variant?.options?.length) return {} as Record<string, string>
  return Object.fromEntries(
    variant.options.map(option => [option.attributeId, option.valueId]),
  )
}

export function preferredProductVariant(variants: SellerProductVariant[]) {
  if (!variants.length) return null
  return variants.find(variant => variant.status === 'active' && variant.stock > 0)
    ?? variants.find(variant => variant.status === 'active')
    ?? variants[0]
    ?? null
}

/** Resolve by stable `id`, with `key` as fallback for older shared links. */
export function findVariantByQuery(
  variants: SellerProductVariant[] | undefined | null,
  queryValue: unknown,
) {
  const raw = Array.isArray(queryValue)
    ? String(queryValue[0] ?? '').trim()
    : String(queryValue ?? '').trim()
  if (!raw || raw === 'null' || raw === 'undefined' || !variants?.length) return null
  return variants.find(variant => variant.id === raw || variant.key === raw) ?? null
}

export function createVariantFromCombo(
  combo: {
    key: string
    options: SellerProductVariantOption[]
  },
  defaults?: Partial<Pick<SellerProductVariant, 'price' | 'salePrice' | 'stock' | 'lowStockThreshold' | 'weight'>>,
): SellerProductVariant {
  return {
    id: `var-${combo.key}-${Date.now().toString(36)}`,
    key: combo.key,
    options: combo.options.map(o => ({ ...o })),
    sku: '',
    barcode: '',
    price: defaults?.price ?? 0,
    salePrice: defaults?.salePrice ?? null,
    stock: defaults?.stock ?? 0,
    lowStockThreshold: defaults?.lowStockThreshold ?? 5,
    weight: defaults?.weight ?? '',
    image: '',
    status: 'active',
  }
}
