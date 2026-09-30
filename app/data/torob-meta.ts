import type { Product } from '~/data/products'
import { toPublicSeoImage } from '~/data/seo'

/** Unhead: before theme CSS/scripts so no-JS crawlers see tags in the first bytes of <head>. */
const TOROB_TAG_PRIORITY = -30

const ASCII_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/

type TorobMetaTag = {
  key: string
  name?: string
  property?: string
  content: string
  tagPriority: number
}

/**
 * Torob's sample tag is numeric (`content="2234"`). Slug IDs with Persian
 * letters are unique in our catalog but their crawler does not treat them as
 * a product id. Latin/digit ids stay as-is; everything else is a stable
 * 64-bit FNV-1a of the real primary key (same id → same number, forever).
 */
export function torobStableProductId(productId: string): string {
  const raw = String(productId || '').trim()
  if (!raw) return ''
  if (ASCII_ID_RE.test(raw)) return raw
  return fnv1a64Decimal(raw)
}

function fnv1a64Decimal(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let hash = 0xcbf29ce484222325n
  const prime = 0x100000001b3n
  for (const byte of bytes) {
    hash ^= BigInt(byte)
    hash = (hash * prime) & 0xffffffffffffffffn
  }
  return hash.toString(10)
}

export function guaranteeLabel(product: Product) {
  const spec = product.specs?.find(item => /گارانتی|guarantee|warranty/i.test(item.key))
  const fromSpec = spec?.value?.trim()
  if (fromSpec) return fromSpec
  const note = product.buyNotes?.find(item => /گارانتی|guarantee|warranty/i.test(item.text))
  return note?.text?.trim() || ''
}

export function torobProductHeadMeta(input: {
  product: Product
  offer: Product
  siteUrl: string
  ogImage?: string | null
}): { meta: TorobMetaTag[] } {
  const { product, offer, siteUrl } = input
  const productId = torobStableProductId(product.id)
  if (!productId) return { meta: [] }

  const price = Math.round(Number(offer.price))
  const oldPrice = Math.round(Number(offer.oldPrice || 0))
  const image = toPublicSeoImage(input.ogImage || product.image || '', siteUrl)
  const guarantee = guaranteeLabel(product)
  const availability = offer.inStock === false ? 'outofstock' : 'instock'

  const tags: TorobMetaTag[] = []

  const named = (name: string, content: string) => {
    tags.push({
      key: `torob-${name}`,
      name,
      content,
      tagPriority: TOROB_TAG_PRIORITY,
    })
  }

  named('product_id', productId)
  named('productid', productId)
  named('product_name', product.title)
  named('productname', product.title)
  named('availability', availability)
  if (Number.isFinite(price)) {
    named('product_price', String(price))
    named('productprice', String(price))
  }
  if (Number.isFinite(oldPrice) && oldPrice > price) {
    named('product_old_price', String(oldPrice))
    named('productoldprice', String(oldPrice))
  }
  if (image) {
    tags.push({
      key: 'torob-og-image',
      property: 'og:image',
      content: image,
      tagPriority: TOROB_TAG_PRIORITY,
    })
  }
  if (guarantee) named('guarantee', guarantee)

  return { meta: tags }
}
