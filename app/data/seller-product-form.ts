import { categories, getCategoryById, getCategoryIcon } from '~/data/categories'
import { resolveCategoryIconName } from '~/data/seller-categories'
import { categoryLabels, type Product, type ProductColor, type ProductSpec } from '~/data/products'
import { isEmptyHtml } from '~/data/seller-blog'
import type { SeoMeta } from '~/data/seo'
import { sanitizeSeoMeta } from '~/data/seo'
import type { SellerAttribute } from '~/data/seller-attributes'
import type { SellerProductVariantAxis as VariantAxis } from '~/data/seller-product-variants'

/** Form-only row id for stable Vue keys / drag-drop; stripped on save. */
export type SellerSpecRow = ProductSpec & { _id: string }

export type SellerProductFormValues = {
  category: string
  title: string
  shortName: string
  brand: string
  shortDesc: string
  description: string
  price: string
  oldPrice: string
  stock: string
  image: string
  imageDark: string
  gallery: string[]
  badge: string
  fastDelivery: boolean
  /** Display colors derived from variant axes (read-only in UI). */
  colors: ProductColor[]
  /** Free-form product specs (key / value rows). Order = storefront order. */
  specs: SellerSpecRow[]
}

export const SELLER_BADGE_NONE = '__none__'

export const sellerProductBadges = [
  SELLER_BADGE_NONE,
  'پیشنهاد ویژه',
  'پرفروش',
  'جدید',
] as const

export type SellerProductCategoryOption = {
  id: string
  name: string
  icon: string
}

export function getSellerCategoryOptions(): SellerProductCategoryOption[] {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.id),
  }))
}

/** Map admin/API categories for product form picker */
export function sellerCategoriesToFormOptions(
  items: Array<{ id: string, name: string, icon: string, status?: string }>,
  options?: { includeInactiveIds?: string[] },
): SellerProductCategoryOption[] {
  const include = new Set(options?.includeInactiveIds?.filter(Boolean) ?? [])
  return items
    .filter(c => c.status !== 'inactive' || include.has(c.id))
    .map(category => ({
      id: category.id,
      name: category.name,
      icon: resolveCategoryIconName(category.icon || 'category'),
    }))
}

const brandOptionsByCategory: Record<string, string[]> = {
  mobile: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor', 'Nokia', 'Google', 'Nothing'],
  laptop: ['Apple', 'ASUS', 'Lenovo', 'HP', 'Acer', 'Microsoft', 'Dell', 'MSI'],
  audio: ['Apple', 'Sony', 'JBL', 'Anker', 'Sennheiser', 'Bose', 'Samsung'],
  tv: ['LG', 'Samsung', 'Sony', 'TCL', 'Xiaomi'],
  camera: ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'GoPro'],
  watch: ['Apple', 'Samsung', 'Garmin', 'Huawei', 'Xiaomi'],
  gaming: ['Sony', 'Microsoft', 'Nintendo', 'Valve'],
  home: ['Xiaomi', 'Dyson', 'Philips', 'Bosch', 'LG', 'Samsung'],
  fashion: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M'],
  beauty: ['Loreal', 'Maybelline', 'Nivea', 'The Ordinary', 'CeraVe'],
}

export function getBrandOptions(categoryId: string): string[] {
  const fromMap = brandOptionsByCategory[categoryId]
  if (fromMap?.length) return fromMap

  const category = getCategoryById(categoryId)
  const brandSub = category?.subs.find(sub =>
    sub.name.includes('برند') || sub.name === 'برندها',
  )
  if (brandSub?.items.length) return brandSub.items

  return ['متفرقه']
}

/** Form-only row id for stable Vue keys / drag-drop; stripped on save. */
export function emptySpecRow(): SellerSpecRow {
  return { _id: crypto.randomUUID(), key: '', value: '' }
}

export function withSpecRowId(row: ProductSpec & { _id?: string }): SellerSpecRow {
  return {
    _id: row._id || crypto.randomUUID(),
    key: row.key ?? '',
    value: row.value ?? '',
  }
}

export function emptySellerProductForm(category = ''): SellerProductFormValues {
  return {
    category,
    title: '',
    shortName: '',
    brand: '',
    shortDesc: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    image: '',
    imageDark: '',
    gallery: [],
    badge: SELLER_BADGE_NONE,
    fastDelivery: false,
    colors: [],
    specs: [emptySpecRow()],
  }
}

export function parsePriceInput(value: string): number {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/** Display helper for price text fields: 3000000 → 3,000,000 */
export function formatPriceInput(value: string | number | null | undefined): string {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function slugifyProductTitle(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'product'
}

/** On save: turn spaces into hyphens while keeping the rest of the user-edited slug. */
export function normalizeProductSlug(value: string) {
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function slugifyTitle(title: string) {
  return slugifyProductTitle(title).slice(0, 40)
}

export function normalizeFormSpecs(specs: ProductSpec[]): ProductSpec[] {
  return specs
    .map((row) => {
      const key = String(row.key || '').trim()
      const value = String(row.value || '').trim()
      const group = String(row.group || '').trim()
      if (!key || !value) return null
      return group ? { key, value, group } : { key, value }
    })
    .filter((row): row is ProductSpec => Boolean(row))
}

/** Derive display colors from color-type variant axes. */
export function colorsFromVariantAxes(
  axes: VariantAxis[],
  attributes: SellerAttribute[],
): ProductColor[] {
  const byId = new Map(attributes.map(a => [a.id, a]))
  const colors: ProductColor[] = []
  const seen = new Set<string>()

  for (const axis of axes) {
    const attr = byId.get(axis.attributeId)
    if (!attr || attr.type !== 'color') continue
    for (const valueId of axis.valueIds) {
      const value = attr.values.find(v => v.id === valueId && v.status !== 'inactive')
      if (!value) continue
      const hex = (value.meta || '').trim() || '#9ca3af'
      const dedupe = `${value.label}|${hex}`
      if (seen.has(dedupe)) continue
      seen.add(dedupe)
      colors.push({ name: value.label, hex })
    }
  }

  return colors
}

export function productToSellerForm(
  product: Product,
  stock = 0,
): SellerProductFormValues {
  const specs = (product.specs ?? []).map(s => withSpecRowId(s))
  return {
    category: product.category,
    title: product.title,
    shortName: product.shortName ?? '',
    brand: product.brand,
    shortDesc: product.shortDesc ?? '',
    description: product.description ?? '',
    price: formatPriceInput(product.price || ''),
    oldPrice: product.oldPrice ? formatPriceInput(product.oldPrice) : '',
    stock: String(stock),
    image: product.image || '',
    imageDark: product.imageDark || '',
    gallery: product.gallery ? [...product.gallery] : [],
    badge: product.badge || SELLER_BADGE_NONE,
    fastDelivery: Boolean(product.fastDelivery),
    colors: product.colors ? [...product.colors] : [],
    specs: specs.length ? specs : [emptySpecRow()],
  }
}

export function buildSellerProductFromForm(
  form: SellerProductFormValues,
  options?: {
    id?: string
    base?: Product
    seo?: SeoMeta | null
    tags?: string[]
    colors?: ProductColor[]
  },
): Product | null {
  const title = form.title.trim()
  const brand = form.brand.trim()
  const category = form.category
  const price = parsePriceInput(form.price)
  const stock = Number.parseInt(form.stock.replace(/[^\d]/g, '') || '0', 10)
  const oldPrice = parsePriceInput(form.oldPrice)

  if (!title || !category || price <= 0) return null

  const specs = normalizeFormSpecs(form.specs)
  const colors = options?.colors ?? form.colors
  const tags = (options?.tags ?? []).map(t => t.trim()).filter(Boolean)
  const seo = options && 'seo' in options
    ? (sanitizeSeoMeta(options.seo) ?? undefined)
    : options?.base?.seo

  const id = options?.id
    || `seller-${slugifyTitle(form.shortName || title)}-${Date.now().toString().slice(-5)}`

  const base = options?.base

  return {
    ...base,
    id,
    title,
    shortName: form.shortName.trim() || undefined,
    brand: brand || '',
    category,
    categoryLabel: categoryLabels[category] ?? getCategoryById(category)?.name ?? category,
    price,
    oldPrice: oldPrice > 0 && oldPrice > price ? oldPrice : undefined,
    rating: base?.rating ?? 0,
    reviews: base?.reviews ?? 0,
    image: form.image.trim() || form.gallery[0] || '/images/noImage.png',
    ...(form.imageDark.trim() ? { imageDark: form.imageDark.trim() } : { imageDark: undefined }),
    ...(form.gallery.length ? { gallery: [...form.gallery] } : { gallery: undefined }),
    badge: form.badge && form.badge !== SELLER_BADGE_NONE ? form.badge : undefined,
    colors: colors.length ? colors : undefined,
    inStock: stock > 0,
    fastDelivery: form.fastDelivery,
    shortDesc: isEmptyHtml(form.shortDesc) ? undefined : form.shortDesc.trim(),
    description: isEmptyHtml(form.description) ? undefined : form.description.trim(),
    specs: specs.length ? specs : undefined,
    seo,
    tags,
  }
}

export function validateSellerProductForm(
  form: SellerProductFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.category) errors.category = 'دسته‌بندی را انتخاب کنید'
  if (!form.title.trim()) errors.title = 'عنوان محصول الزامی است'

  const price = parsePriceInput(form.price)
  if (price <= 0) errors.price = 'قیمت معتبر وارد کنید'

  const stockRaw = form.stock.trim()
  if (stockRaw && Number.isNaN(Number.parseInt(stockRaw.replace(/[^\d]/g, ''), 10))) {
    errors.stock = 'موجودی معتبر نیست'
  }

  const oldPrice = parsePriceInput(form.oldPrice)
  if (oldPrice > 0 && oldPrice <= price) {
    errors.oldPrice = 'قیمت قبلی باید بیشتر از قیمت فروش باشد'
  }

  form.specs.forEach((row, index) => {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key && !value) errors[`spec:${index}:value`] = 'مقدار مشخصه الزامی است'
    if (value && !key) errors[`spec:${index}:key`] = 'عنوان مشخصه الزامی است'
  })

  return errors
}
