/**
 * Inject JSON-LD structured data. Only pass objects that reflect real public content.
 */
export function useJsonLd(schema: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | null | undefined>) {
  useHead(() => {
    const value = toValue(schema)
    if (!value) return {}
    const graph = Array.isArray(value) ? value : [value]
    const cleaned = graph.filter(Boolean)
    if (!cleaned.length) return {}
    return {
      script: cleaned.map((item, index) => ({
        key: `ld-json-${index}`,
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

export function productJsonLd(opts: {
  name: string
  description?: string
  image?: string
  url?: string
  sku?: string
  brand?: string
  price?: number | string
  currency?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description || undefined,
    image: opts.image || undefined,
    sku: opts.sku || undefined,
    brand: opts.brand ? { '@type': 'Brand', name: opts.brand } : undefined,
    offers: opts.price != null && opts.price !== ''
      ? {
          '@type': 'Offer',
          price: opts.price,
          priceCurrency: opts.currency || 'IRR',
          availability: 'https://schema.org/InStock',
          url: opts.url || undefined,
        }
      : undefined,
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
