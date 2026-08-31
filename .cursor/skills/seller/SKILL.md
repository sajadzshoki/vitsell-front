---
name: seller
description: >-
  Builds and extends the digishop seller panel (/seller), which is the site admin
  panel (not a multi-vendor marketplace). Use when adding seller/admin pages,
  category CRUD, products, orders, shop settings, or any /seller UI, nav, or API wiring.
---

# Seller panel — digishop (ادمین سایت)

قبل از ساخت یا تغییر هر بخش `/seller` این فایل را بخوان. برای UI عمومی حتماً اسکیل [nuxt-ui](../nuxt-ui/SKILL.md) را هم رعایت کن.

## هویت پنل (اجباری)

- مسیر و کد فعلی: `seller` (`/seller`, layout `seller`, `TheSeller/*`, `useSeller`).
- **معنا:** پنل ادمین / مدیریت سایت — نه مارکت‌پلیس چندفروشنده.
- فعلاً سایت marketplace نیست؛ فرض «یک فروشگاه / یک ادمین» بمان مگر صریحاً خلافش گفته شود.
- در UI می‌توان برچسب‌هایی مثل «پنل مدیریت» استفاده کرد، ولی مسیرها و نام فایل‌ها را بدون درخواست کاربر عوض نکن (`/seller` بماند).

## ساختار موجود

| لایه | مسیر |
|---|---|
| Layout | `app/layouts/seller.vue` |
| Nav | `app/data/seller.ts` → `sellerNavItems` + `TheSellerSidebar` / `TheSellerMobileMenu` |
| Layout helpers | `app/composables/useSellerLayout.ts` |
| Data / mock | `app/data/seller.ts`, `app/data/seller-product-form.ts` |
| Composable | `app/composables/useSeller.ts` |
| صفحات | `app/pages/seller/**` |
| کامپوننت‌ها | `app/components/TheSeller/**` |
| API (عمومی) | `ROUTES.md` — prefix `/api/v1` |

الگو صفحه: `pages/seller/<section>/index.vue` فقط `TheSeller*` را رندر کند؛ منطق در کامپوننت/composable؛ `definePageMeta({ layout: 'seller', middleware: 'auth' })`.

## قوانین کلی ساخت بخش جدید

1. آیتم را به `sellerNavItems` اضافه کن (`id`, `label`, `icon` از `i-tabler-*`, `to`).
2. `SellerTabId` را گسترش بده.
3. عنوان صفحه از `sellerNavItems` / `useSellerLayout` بیاید (breadcrumb موبایل/دسکتاپ خودکار بماند).
4. Nuxt UI + semantic colors + i18n (`$t` / کلید = متن فارسی) + RTL (`start`/`end`).
5. داده از API برای خواندن؛ mutate ادمین فعلاً می‌تواند فقط state فرانت باشد تا endpoint آماده شود (مثل دسته‌بندی‌ها).
6. هر کنترل کلیک‌پذیر `cursor-pointer` (قانون سراسری + کلاس سفارشی در صورت نیاز).
7. UnoCSS variant group: `lg:(px-6 py-4)` نه تکرار پیشوند.

## نقشه بخش‌ها (در حال گسترش)

| اولویت | بخش | مسیر پیشنهادی | وضعیت در اسکیل |
|---|---|---|---|
| 1 | دسته‌بندی‌ها | `/seller/categories` | مشخص‌شده پایین + [categories.md](categories.md) |
| 2 | بنرها | `/seller/banners` | مشخص‌شده پایین + [banners.md](banners.md) |
| — | محصولات / سفارش / نظرات / مالی / فروشگاه | موجود | الگو برای بخش‌های بعدی |

بخش‌های بعدی را فقط وقتی کاربر خواست، به همین اسکیل اضافه کن (همین قالب جدول + فایل reference).

---

## بخش ۱ — دسته‌بندی‌ها

### هدف

CRUD کامل روی `CategorySchema` و مدیریت زیردسته‌ها (`subs`) داخل همان دسته.

منبع حقیقت مدل: `types/models.ts` → `CategorySchema`  
نوع فرانت لیست: `app/data/categories.ts` → `Category` / `CategorySub`  
مصرف استورفرانت: MegaMenu، Search chips، `/category/:catId`، `useCategories`.

### فیلدهای مدل (همه باید در فرم قابل تنظیم باشند)

| فیلد | نوع | UI |
|---|---|---|
| `id` | `string` (PK) | فقط هنگام ایجاد؛ slug لاتین یکتا؛ بعد از ساخت معمولاً readonly |
| `name` | `string` | عنوان فارسی دسته |
| `icon` | `string` | کلید آیکون (مثل `mobile`)؛ پیش‌نمایش با `i-tabler-*` / `getCategoryIcon` |
| `image` | `string \| null` | URL/آپلود تصویر دسته؛ خالی → `TheIcon` + `noImage.png` |
| `subs` | JSON array | ویرایشگر گروه‌های زیردسته (پایین) |
| `pageMeta` | JSON \| null | meta صفحه دسته — شکل `CategoryPageMeta` در `app/data/category-pages.ts` (hero + seo) |
| `suggested` | JSON \| null | آیتم‌های پیشنهادی — شکل `CategorySuggestedItem[]` (`id`, `title`, `image`, `query`) |
| `createdAt` / `updatedAt` | datetime | فقط نمایش در جزئیات/لیست؛ نه فیلد ورودی |

### شکل `subs` (اجباری)

```ts
type CategorySub = {
  name: string           // نام گروه زیردسته (مثلاً «برندهای موبایل»)
  items: string[]        // برگ‌ها / چیپ‌های جستجو
  image?: string | null  // عکس کارت زیردسته در Search header
}
```

در UI باید بشود:

- افزودن / حذف / تغییر نام گروه
- افزودن / حذف / ویرایش `items` هر گروه
- ست کردن `image` برای هر گروه
- ترتیب گروه‌ها (و ترجیحاً آیتم‌ها) را عوض کرد

مصرف فرانت: کلیک دسته اصلی → `/search?category=<id>`؛ برگ → `/search?q=<term>&category=<id>` (قانون search-category-ux).

### صفحه و کامپوننت‌ها

| قطعه | مسیر |
|---|---|
| صفحه لیست | `app/pages/seller/categories/index.vue` |
| صفحه ایجاد/ویرایش (اختیاری) | `app/pages/seller/categories/new.vue`, `.../[id].vue` — یا یک مودال/دراور روی لیست |
| لیست | `TheSellerCategories.vue` |
| فرم | `TheSellerCategoryForm.vue` |
| ویرایشگر subs | داخل فرم یا `TheSellerCategorySubsEditor.vue` |
| nav | `sellerNavItems` ← `{ id: 'categories', label: 'دسته‌بندی‌ها', icon: 'i-tabler-category', to: '/seller/categories' }` |

لیست: نام، آیکون، تعداد گروه/آیتم، پیش‌نمایش تصویر، اکشن ویرایش/حذف.  
فرم: سکشن‌های جدا — اطلاعات پایه، تصویر، زیردسته‌ها، `pageMeta`, `suggested`.

### API

الان در `ROUTES.md` فقط:

- `GET /categories`
- `GET /categories/:id`

برای ادمین لازم است (با بک‌اند هماهنگ کن؛ اگر نبود، UI + contract را بساز و واضح علامت بزن):

| Method | Path | نقش |
|---|---|---|
| `GET` | `/categories` | لیست |
| `GET` | `/categories/:id` | جزئیات |
| `POST` | `/categories` | ایجاد |
| `PUT` یا `PATCH` | `/categories/:id` | ویرایش کامل فیلدها |
| `DELETE` | `/categories/:id` | حذف (با تأیید؛ مراقب محصولات وابسته) |

Auth: Bearer مثل بقیه seller. بعد از mutate، کش `useCategories` را invalidate / refetch کن (`categories-list` state).

جزئیات فیلدها، validation و UX فرم: [categories.md](categories.md).

### چک قبل از اتمام (دسته‌بندی)

- [ ] nav + `SellerTabId` + صفحه با layout seller و auth
- [ ] همه فیلدهای `CategorySchema` قابل مدیریت (timestamps فقط نمایش)
- [ ] `subs`: گروه + items + image + ترتیب
- [ ] `pageMeta` و `suggested` مطابق تایپ‌های موجود
- [ ] i18n / RTL / Nuxt UI / بدون رنگ خام
- [ ] بعد از ذخیره، لیست و استورفرانت (با refetch) به‌روز می‌شود
- [ ] حذف با تأیید؛ id یکتا در ایجاد

---

## بخش ۲ — بنرها

### هدف

CRUD بنرهای سایت در پنل ادمین. فعلاً فرانت‌only (state محلی).

### فیلدها

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | string | شناسه یکتا؛ در create وارد می‌شود |
| `image` | string | آدرس تصویر بنر |
| `link` | string | لینک مقصد کلیک |
| `type` | `'main' \| 'secondary'` | بنر اصلی / فرعی |
| `categoryId` | `string \| null` | دسته مرتبط (اختیاری) |
| `active` | boolean | فعال / غیرفعال |

جزئیات: [banners.md](banners.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/banners` → `TheSellerBanners` |
| ایجاد | `/seller/banners/new` → `TheSellerBannerForm` |
| ویرایش | `/seller/banners/:id` |
| nav | `sellerNavItems` ← `{ id: 'banners', label: 'بنرها', icon: 'i-tabler-photo', to: '/seller/banners' }` |
| data | `app/data/seller-banners.ts` |
| composable | `app/composables/useSellerBanners.ts` |

### چک قبل از اتمام (بنر)

- [ ] nav + صفحات + فرم با فیلدهای بالا
- [ ] فیلتر نوع و وضعیت در لیست؛ toggle فعال از لیست
- [ ] حذف با تأیید؛ seed اولیه از hero/home برای دمو
- [ ] i18n / RTL / Nuxt UI
