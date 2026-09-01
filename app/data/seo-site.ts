import type { SeoRobots } from '~/data/seo'

export type SellerSeoSiteSettings = {
  siteName: string
  siteUrl: string
  titlePattern: string
  defaultRobots: SeoRobots
  defaultOgImage: string
  twitterCard: 'summary' | 'summary_large_image'
  updatedAt: string | null
}

export function defaultSeoSiteSettings(): SellerSeoSiteSettings {
  return {
    siteName: 'Digishop',
    siteUrl: 'https://digishop.local',
    titlePattern: '{title} | {site}',
    defaultRobots: 'index,follow',
    defaultOgImage: '',
    twitterCard: 'summary_large_image',
    updatedAt: null,
  }
}
