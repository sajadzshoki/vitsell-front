import {
  resolveSeoMeta,
  type ResolveSeoInput,
  type SeoMeta,
} from '~/data/seo'

/**
 * Apply resolved SEO to the document head via Nuxt useSeoMeta.
 * Call from page setup with entity SeoMeta + fallbacks.
 */
export function useEntitySeo(input: MaybeRefOrGetter<ResolveSeoInput & {
  entity?: Partial<SeoMeta> | null
}>) {
  const { settings, ensureLoaded } = useSellerSeoSettings()
  ensureLoaded()

  const resolved = computed(() => {
    const raw = toValue(input)
    return resolveSeoMeta({
      ...raw,
      defaults: {
        titlePattern: settings.value.titlePattern,
        siteName: settings.value.siteName,
        siteUrl: settings.value.siteUrl,
        defaultRobots: settings.value.defaultRobots,
        defaultOgImage: settings.value.defaultOgImage,
        twitterCard: settings.value.twitterCard,
        ...raw.defaults,
      },
    })
  })

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description || undefined,
    robots: () => resolved.value.robots,
    ogTitle: () => resolved.value.ogTitle,
    ogDescription: () => resolved.value.ogDescription || undefined,
    ogImage: () => resolved.value.ogImage || undefined,
    ogType: () => 'website',
    twitterCard: () => resolved.value.twitterCard as 'summary' | 'summary_large_image',
    twitterTitle: () => resolved.value.twitterTitle,
    twitterDescription: () => resolved.value.twitterDescription || undefined,
    twitterImage: () => resolved.value.twitterImage || undefined,
  })

  useHead(() => ({
    link: resolved.value.canonical
      ? [{ rel: 'canonical', href: resolved.value.canonical }]
      : [],
  }))

  return { resolved }
}
