---
name: seller-blog
description: Blog CRUD rules for the vitsell seller (admin) panel.
---

# Seller — Blog CRUD (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE6.md](../../../docs/ADMIN_PHASE6.md). هنگام کار روی `/seller/blog` این فایل را بخوان.

## مدل

- منبع ادمین: `useSellerBlog` → `/seller/blog` (فیلتر/صفحه‌بندی سروری)
- استورفرانت: `useBlog` → `/blog` (عمومی)

| فیلد | توضیح |
|---|---|
| `id` | slug لاتین یکتا |
| `status` | `draft \| scheduled \| published \| archived` |
| `publishedAt` / `scheduledAt` | زمان انتشار / زمان‌بندی |
| `featured` | برجسته (هم‌راستا با `popular` برای سازگاری) |
| `title` / `excerpt` / `content` | عنوان، خلاصه، پاراگراف‌ها (`string[]`) |
| `image` / `imageAlt` | کاور + alt |
| `category` | نام/slug دسته بلاگ (نه دسته محصول) |
| `tags` | برچسب‌های بلاگ |
| `relatedPostIds` | پست‌های مرتبط |
| `seo` | `SeoMeta` |
| `active` | مشتق برای سازگاری API/seed (`published`) |

ویژگی عمومی: `isBlogPostPubliclyVisible` — فقط published یا scheduled گذشته؛ پیش‌نمایش با `?preview=1` + سشن ادمین.

دسته‌ها/برچسب‌ها جدا از محصول: `seller-blog-taxonomy.ts` + `useSellerBlogCategories` / `useSellerBlogTags`.

## مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/blog` → `TheSellerBlogPosts` |
| ایجاد / ویرایش | `/seller/blog/new`, `/seller/blog/:id` → `TheSellerBlogForm` |
| دسته‌ها | `/seller/blog/categories` |
| برچسب‌ها | `/seller/blog/tags` |

## قوانین

- ادیتور: `TheSellerRichTextEditor` (Nuxt UI `UEditor` / TipTap، HTML) — تیتر H2–H4، فهرست، لینک؛ تصویر از Media Library با **alt اجباری**.
- ذخیره: `content: string[]`؛ سند غنی به‌صورت یک آیتم HTML؛ پست‌های قدیمی همچنان پاراگراف‌های متنی.
- تصویر کاور از `TheSellerImageUpload` / Media Library.
- سئو با `TheSellerSeoFields`؛ عمومی: canonical خودکار، OG از کاور، `noindex` برای پیش‌نویس/پیش‌نمایش، `BlogPosting` + `BreadcrumbList`، sitemap تک‌پست.
- فیلتر/بالک وضعیت در لیست؛ RBAC: `blog.*`, `blog_categories.*`, `blog_tags.*`.

## چک قبل از اتمام

- [ ] draft → schedule → publish → archive
- [ ] دسته‌ها/برچسب‌ها جدا از دسته‌های محصول
- [ ] پیش‌نمایش پیش‌نویس؛ استورفرانت فقط منتشرشده
- [ ] SEO + JSON-LD روی `/blog/:id`
