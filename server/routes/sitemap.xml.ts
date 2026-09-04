import { staticPagePaths } from '~/data/static-pages'
import { defaultSeoSiteSettings } from '~/data/seo-site'
import { joinSiteUrl } from '~/data/seo'
import {
  buildDefaultSellerBlogPosts,
  isBlogPostPubliclyVisible,
  normalizeBlogPost,
  type SellerBlogPost,
} from '~/data/seller-blog'
import type { StaticBlogPost } from '~/data/static-pages'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toLastmod(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  const t = Date.parse(value)
  if (Number.isNaN(t)) return new Date().toISOString().slice(0, 10)
  return new Date(t).toISOString().slice(0, 10)
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

async function loadPublicBlogPosts(apiBase: string): Promise<SellerBlogPost[]> {
  try {
    const result = await $fetch<StaticBlogPost[]>(`${apiBase.replace(/\/+$/, '')}/blog`, {
      timeout: 4000,
    })
    if (Array.isArray(result) && result.length) {
      return result
        .map(post => normalizeBlogPost(post))
        .filter(p => isBlogPostPubliclyVisible(p))
    }
  }
  catch {
    // fall through to seeded posts
  }
  return buildDefaultSellerBlogPosts().filter(p => isBlogPostPubliclyVisible(p))
}

export default defineEventHandler(async (event) => {
  const settings = defaultSeoSiteSettings()
  const base = settings.siteUrl.replace(/\/+$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)
  const config = useRuntimeConfig()
  const apiBase = String(config.public?.apiBase || '').trim()

  const paths = [
    '/',
    '/about',
    '/blog',
    ...Object.values(staticPagePaths).filter(path => path !== '/about' && path !== '/blog'),
  ]

  const urls = paths.map((path) => {
    const loc = joinSiteUrl(base, path)
    const priority = path === '/' ? '1.0' : path === '/blog' || path === '/about' ? '0.8' : '0.6'
    return urlEntry(loc, lastmod, 'weekly', priority)
  })

  const posts = await loadPublicBlogPosts(apiBase || 'https://digishop-back.vistatest.top/api/v1')
  for (const post of posts) {
    const loc = joinSiteUrl(base, `/blog/${post.id}`)
    const postLastmod = toLastmod(post.updatedAt || post.publishedAt || post.date)
    urls.push(urlEntry(loc, postLastmod, 'weekly', '0.7'))
  }

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
