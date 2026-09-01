---
name: seller-blog
description: Blog CRUD rules for the digishop seller (admin) panel.
---

# Seller — Blog CRUD (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE6.md](../../../docs/ADMIN_PHASE6.md). هنگام کار روی `/seller/blog` این فایل را بخوان.

## مدل

منبع: `app/data/seller-blog.ts` · منطق: `app/composables/useBlog.ts`

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

- ادیتور: `UTextarea` → پاراگراف‌ها با خط خالی — **بدون TipTap**.
- تصویر از `TheSellerImageUpload` / Media Library.
- سئو با `TheSellerSeoFields`؛ عمومی با `useEntitySeo` + `BlogPosting` JSON-LD.
- فیلتر/بالک وضعیت در لیست؛ RBAC: `blog.*`, `blog_categories.*`, `blog_tags.*`.

## چک قبل از اتمام

- [ ] draft → schedule → publish → archive
- [ ] دسته‌ها/برچسب‌ها جدا از دسته‌های محصول
- [ ] پیش‌نمایش پیش‌نویس؛ استورفرانت فقط منتشرشده
- [ ] SEO + JSON-LD روی `/blog/:id`
