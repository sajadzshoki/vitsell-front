import { emptySeoMeta, type SeoMeta } from '~/data/seo'

export type SellerProductVariantStatus = 'active' | 'inactive'

export type SellerProductVariantOption = {
  attributeId: string
  attributeName: string
  valueId: string
  label: string
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

export type SellerProductVariantAxis = {
  attributeId: string
  valueIds: string[]
}

/** Extended product commerce fields (frontend until backend variants exist) */
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
