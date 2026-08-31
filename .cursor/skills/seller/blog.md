---
name: seller-blog
description: Blog CRUD rules for the digishop seller (admin) panel.
---

# Seller — Blog CRUD (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/blog` این فایل را بخوان.

## مدل

هم‌راستا با `BlogPostSchema` / `StaticBlogPost` به‌علاوه فیلدهای ادمین:

| فیلد | توضیح |
|---|---|
| `id` | slug لاتین یکتا |
| `title` / `excerpt` / `content` | عنوان، خلاصه، پاراگراف‌ها |
| `image` | URL پس از آپلود فایل (`TheSellerImageUpload` → `POST /upload`) |
| `category` | دسته محتوایی بلاگ |
| `author` / `date` / `readTime` | متادیتا نمایشی |
| `relatedCategories` | id دسته‌های محصول |
| `highlights` | نکات کلیدی |
| `popular` / `engagement` | بج و شمار تعامل در لیست |
| `active` | منتشر / پیش‌نویس |

منبع: `app/data/seller-blog.ts` · منطق: `app/composables/useBlog.ts` (اشتراکی با استورفرانت)

## مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/blog` → `TheSellerBlogPosts` |
| ایجاد | `/seller/blog/new` → `TheSellerBlogForm` |
| ویرایش | `/seller/blog/:id` |
| nav | `{ id: 'blog', label: 'وبلاگ', icon: 'i-tabler-news', to: '/seller/blog' }` |

## قوانین

- تصویر فقط از آپلود فایل (`TheSellerImageUpload`) — نه فقط لینک دستی.
- محتوا: `UTextarea` با پاراگراف‌های جدا با خط خالی.
- فرانت‌only تا API mutate آماده شود؛ state مشترک `site-blog-posts` استورفرانت را هم به‌روز می‌کند.
- استورفرانت: `/blog` (`TheBlogListing`) و `/blog/:id` (`TheBlogPostDetail`).

## چک قبل از اتمام

- [ ] nav + `SellerTabId` + صفحات با layout seller و auth
- [ ] CRUD + toggle انتشار + حذف با تأیید
- [ ] آپلود تصویر فایل
- [ ] فیلتر دسته و صفحه‌بندی در `/blog`
- [ ] i18n / RTL / Nuxt UI / بدون رنگ خام
