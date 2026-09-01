---
name: seller-pages
description: Static pages CMS for the digishop seller (admin) panel.
---

# Seller — Static pages (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE6.md](../../../docs/ADMIN_PHASE6.md). هنگام کار روی `/seller/pages` این فایل را بخوان.

## مدل

منبع: `app/data/seller-pages.ts` + `static-pages.ts` · منطق: `useSellerPages` / `useStaticPages`

| فیلد | توضیح |
|---|---|
| `id` / slug / path | شناسه و مسیر عمومی |
| `status` | `draft \| published \| archived` |
| `template` | `standard \| faq \| contact \| jobs \| guide` |
| `sections` | همان union موجود (paragraphs/list/faq/contact/jobs/steps/stats) — فرم ساخت‌یافته، نه page-builder |
| `seo` | `SeoMeta` |

## مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/pages` → `TheSellerPages` |
| فرم | `/seller/pages/new`, `/seller/pages/:id` → `TheSellerPageForm` |

## قوانین

- فقط سکشن‌های موجود را ویرایش کن؛ DnD builder اضافه نکن.
- عمومی: پیش‌نویس/آرشیو حذف؛ FAQ → `FAQPage` JSON-LD.
- RBAC: `pages.*` شامل `pages.publish`.
- تصویر/OG از Media Library.

## چک

- [ ] CRUD + وضعیت انتشار
- [ ] یکتایی slug در برابر StaticPageId + صفحات سفارشی
- [ ] SEO عمومی + robots/sitemap بدون draft
