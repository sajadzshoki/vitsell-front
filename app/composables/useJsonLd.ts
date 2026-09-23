/**
 * Inject JSON-LD structured data. Only pass objects that reflect real public content.
 */
export function useJsonLd(schema: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | null | undefined>) {
  const id = useId()
  useHead(() => {
    const value = toValue(schema)
    if (!value) return {}
    const graph = Array.isArray(value) ? value : [value]
    const cleaned = graph.filter(Boolean)
    if (!cleaned.length) return {}
    return {
      script: cleaned.map((item, index) => ({
        key: `ld-json-${id}-${index}`,
        type: 'application/ld+json',
        children: JSON.stringify(item),
      })),
    }
  })
}

export function blogPostingJsonLd(opts: {
  title: string
  description?: string
  image?: string
  url?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description || undefined,
    image: opts.image || undefined,
    url: opts.url || undefined,
    datePublished: opts.datePublished || undefined,
    dateModified: opts.dateModified || opts.datePublished || undefined,
    author: opts.authorName
      ? { '@type': 'Person', name: opts.authorName }
      : undefined,
  }
}

export function organizationJsonLd(opts: {
  name: string
  description?: string
  url?: string
  logo?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name,
    description: opts.description || undefined,
    url: opts.url || undefined,
    logo: opts.logo || undefined,
  }
}

export function webSiteJsonLd(opts: { name: string, url?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: opts.url || undefined,
  }
}

export function faqPageJsonLd(items: { question: string, answer: string }[]) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export type ProductJsonLdReview = {
  authorName: string
  ratingValue: number
  reviewBody?: string
  /** ISO-8601 preferred; non-ISO values are omitted from output */
  datePublished?: string
}

export type ProductJsonLdOptions = {
  name: string
  description?: string
  image?: string | string[]
  url?: string
  sku?: string
  /** Only pass a real GTIN-13; never invent */
  gtin13?: string
  brand?: string
  category?: string
  color?: string
  size?: string
  additionalProperty?: { name: string, value: string }[]
  price?: number | string
  currency?: string
  inStock?: boolean
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
  sellerName?: string
  sellerUrl?: string
  /** Include AggregateRating only when both are > 0 */
  ratingValue?: number
  reviewCount?: number
  reviews?: ProductJsonLdReview[]
  breadcrumbs?: { name: string, url?: string }[]
}

function isIsoDateHint(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value.trim())
}

/** Prefer GTIN-13 only when barcode is clearly 13 digits (or 12-digit UPC). */
export function barcodeToGtin13(barcode?: string | null) {
  const digits = String(barcode || '').replace(/\D/g, '')
  if (digits.length === 13) return digits
  if (digits.length === 12) return `0${digits}`
  return undefined
}

/**
 * Product (+ optional Offer / AggregateRating / Review / BreadcrumbList).
 * When breadcrumbs are provided, returns a single `@graph` document (preferred for product pages).
 */
export function productJsonLd(opts: ProductJsonLdOptions) {
  const url = opts.url || undefined
  const images = (Array.isArray(opts.image) ? opts.image : [opts.image])
    .map(src => String(src || '').trim())
    .filter(Boolean)
  const uniqueImages = [...new Set(images)].slice(0, 10)

  const priceNum = opts.price != null && opts.price !== ''
    ? Number(opts.price)
    : NaN
  const hasPrice = Number.isFinite(priceNum)

  const additionalProperty = (opts.additionalProperty || [])
    .map(prop => ({
      '@type': 'PropertyValue' as const,
      name: String(prop.name || '').trim(),
      value: String(prop.value || '').trim(),
    }))
    .filter(prop => prop.name && prop.value)
    .slice(0, 24)

  const ratingValue = Number(opts.ratingValue)
  const reviewCount = Math.round(Number(opts.reviewCount) || 0)
  const aggregateRating = reviewCount > 0 && Number.isFinite(ratingValue) && ratingValue > 0
    ? {
        '@type': 'AggregateRating',
        ratingValue: Math.round(ratingValue * 10) / 10,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
    : undefined

  const reviews = (opts.reviews || [])
    .filter(review =>
      review.authorName?.trim()
      && Number.isFinite(review.ratingValue)
      && review.ratingValue >= 1
      && review.ratingValue <= 5
      && String(review.reviewBody || '').trim(),
    )
    .slice(0, 5)
    .map(review => {
      const date = String(review.datePublished || '').trim()
      return {
        '@type': 'Review',
        author: { '@type': 'Person', name: review.authorName.trim() },
        datePublished: date && isIsoDateHint(date) ? date : undefined,
        reviewBody: String(review.reviewBody).trim(),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
      }
    })

  const product: Record<string, unknown> = {
    '@type': 'Product',
    '@id': url ? `${url}#product` : undefined,
    name: opts.name,
    url,
    description: opts.description || undefined,
    image: uniqueImages.length ? uniqueImages : undefined,
    sku: opts.sku || undefined,
    gtin13: opts.gtin13 || undefined,
    brand: opts.brand ? { '@type': 'Brand', name: opts.brand } : undefined,
    category: opts.category || undefined,
    color: opts.color || undefined,
    size: opts.size || undefined,
    additionalProperty: additionalProperty.length ? additionalProperty : undefined,
    aggregateRating,
    review: reviews.length ? reviews : undefined,
    offers: hasPrice
      ? {
          '@type': 'Offer',
          '@id': url ? `${url}#offer` : undefined,
          url,
          price: priceNum,
          priceCurrency: opts.currency || 'IRR',
          availability: opts.inStock === false
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          itemCondition: `https://schema.org/${opts.itemCondition || 'NewCondition'}`,
          seller: opts.sellerName
            ? {
                '@type': 'Organization',
                name: opts.sellerName,
                url: opts.sellerUrl || undefined,
              }
            : undefined,
        }
      : undefined,
  }

  const crumbs = opts.breadcrumbs?.length
    ? {
        '@type': 'BreadcrumbList',
        '@id': url ? `${url}#breadcrumb` : undefined,
        itemListElement: opts.breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url || undefined,
        })),
      }
    : null

  if (crumbs) {
    return {
      '@context': 'https://schema.org',
      '@graph': [product, crumbs],
    }
  }

  return {
    '@context': 'https://schema.org',
    ...product,
  }
}

export function breadcrumbJsonLd(items: { name: string, url?: string }[]) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || undefined,
    })),
  }
}
