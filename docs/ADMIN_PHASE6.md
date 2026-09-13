# Admin Phase 6 — CMS, Blog, Static Pages & Complete SEO

Frontend-first CMS and SEO completion for vitsell seller + storefront.

## Mapping

| Area | Path / module |
|---|---|
| Blog | `/seller/blog` + categories/tags |
| About | `/seller/about` (structured sections) |
| Static pages | `/seller/pages` |
| Global SEO | `/seller/seo` (+ redirects tab) |
| Shared SEO | `SeoMeta`, `TheSellerSeoFields`, `useEntitySeo`, `useJsonLd` |
| Crawl | `server/routes/robots.txt.ts`, `sitemap.xml.ts` |

## Blog

- Status: `draft | scheduled | published | archived` (storefront = published / due scheduled)
- Tags + blog categories (separate from product categories)
- SEO per post, preview `?preview=1`, bulk actions
- Editor: `TheSellerRichTextEditor` (UEditor/TipTap HTML) → `content: string[]` (rich = single HTML blob); image via Media Library + required alt
- Public SEO: auto canonical from path, OG fallback to cover, `noindex` for preview/draft, BlogPosting + BreadcrumbList JSON-LD, article Open Graph times
- Sitemap includes `/blog/:id` for publicly visible posts (`lastmod` from updated/published)

## About

- `sectionVisibility` + `seo` on `AboutPagePayload`
- Public honors visibility; Organization JSON-LD

## Static pages

- Admin CRUD over existing section union (`paragraphs`, `list`, `faq`, …)
- Status draft/published/archived; public skips non-published

## SEO

- Entity override → global defaults → page fallbacks via `resolveSeoMeta` / `useEntitySeo`
- OG/Twitter/canonical/robots applied on public pages
- Soft warnings + social preview in SeoFields
- JSON-LD: BlogPosting, Organization, Product, FAQPage, WebSite

## Redirects

- FE table + `seo-redirect.global` middleware (production edge 301 still a backend gap)

## Permissions

`blog.*`, `blog_categories.*`, `blog_tags.*`, `pages.*` (+ `pages.publish`), `about.*`, `seo.*`, `media.*`

## Backend gaps

- Blog/About/Pages mutate + `seo` columns not in Prisma models
- Sitemap limited to known FE paths/seeds at Nitro runtime
- True CDN/server 301 for redirects
