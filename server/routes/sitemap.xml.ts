import { staticPagePaths } from '~/data/static-pages'
import { defaultSeoSiteSettings } from '~/data/seo-site'
import { joinSiteUrl } from '~/data/seo'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export default defineEventHandler((event) => {
  const settings = defaultSeoSiteSettings()
  const base = settings.siteUrl.replace(/\/+$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)

  const paths = [
    '/',
    '/about',
    '/blog',
    ...Object.values(staticPagePaths).filter(path => path !== '/about' && path !== '/blog'),
  ]

  const urls = paths.map((path) => {
    const loc = joinSiteUrl(base, path)
    const priority = path === '/' ? '1.0' : path === '/blog' || path === '/about' ? '0.8' : '0.6'
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return xml
})
