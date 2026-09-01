import { defaultSeoSiteSettings } from '~/data/seo-site'

export default defineEventHandler((event) => {
  const settings = defaultSeoSiteSettings()
  const sitemapUrl = `${settings.siteUrl.replace(/\/+$/, '')}/sitemap.xml`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /seller',
    'Disallow: /seller/',
    'Disallow: /account',
    'Disallow: /account/',
    'Disallow: /login',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n')
})
