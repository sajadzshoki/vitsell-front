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
| Nav | `app/data/seller.ts` → `sellerNavGroups` + `TheSellerSidebar` / `TheSellerMobileMenu` |
| Layout helpers | `app/composables/useSellerLayout.ts` |
| Permissions | `app/data/seller-permissions.ts`, `useSellerPermissions` |
| Filters / list query | `seller-filters.ts`, `useSellerFilters`, `useSellerListQuery` |
| SEO | `app/data/seo.ts`, `TheSellerSeoFields` |
| Foundation doc | `docs/ADMIN_FOUNDATION.md` |
| Phase 2 doc | `docs/ADMIN_PHASE2.md` — products, attributes, variants, inventory |
| Phase 3 doc | `docs/ADMIN_PHASE3.md` — orders, customers, returns, refunds, support |
| Phase 4 doc | `docs/ADMIN_PHASE4.md` — taxonomy, brands, attributes, media library |
| Phase 5 doc | `docs/ADMIN_PHASE5.md` — marketing, discounts, coupons, campaigns, banners, notifications |
| Phase 6 doc | `docs/ADMIN_PHASE6.md` — CMS, blog, static pages, SEO, sitemap/robots |
| Phase 7 doc | `docs/ADMIN_PHASE7.md` — finance, payments, transactions, settlements |
| Phase 8 doc | `docs/ADMIN_PHASE8.md` — super admin, settings, RBAC, search, import/export |
| Phase 9 doc | `docs/ADMIN_PHASE9.md` — production readiness, QA, gaps, readiness status |
| RBAC UI | `/seller/admins`, `/seller/roles`, `/seller/audit`, `/seller/account` |
| Data / mock | `app/data/seller.ts`, `seller-product-form.ts`, `seller-attributes`, `seller-brands`, `seller-media`, `seller-discounts`, `seller-campaigns`, `seller-marketing-shared`, `seller-inventory`, `seller-product-variants`, `seller-order-commerce`, `seller-customers`, `seller-returns-refunds`, `seller-export`, `seller-admins`, `seller-roles`, `seller-audit` |
| Composable | `app/composables/useSeller.ts`, `useSellerAttributes`, `useSellerBrands`, `useSellerMedia`, `useSellerDiscounts`, `useSellerCampaigns`, `useSellerInventory`, `useSellerProductCommerce`, `useSellerOrderCommerce`, `useSellerCustomers`, `useSellerReturnsRefunds` |
| صفحات | `app/pages/seller/**` |
| کامپوننت‌ها | `app/components/TheSeller/**` |
| API (عمومی) | `ROUTES.md` — prefix `/api/v1` |

الگو صفحه: `pages/seller/<section>/index.vue` فقط `TheSeller*` را رندر کند؛ منطق در کامپوننت/composable؛ `definePageMeta({ layout: 'seller', middleware: ['auth', 'admin'] })`.

## قوانین کلی ساخت بخش جدید

1. آیتم را به `sellerNavGroups` اضافه کن (`id`, `label`, `icon` از `i-tabler-*`, `to` یا `comingSoon`).
2. `SellerTabId` و در صورت نیاز `sellerNavPermissionMap` را گسترش بده.
3. عنوان صفحه از nav / `useSellerLayout` بیاید (breadcrumb موبایل/دسکتاپ خودکار بماند).
4. Nuxt UI + semantic colors + i18n (`$t` / کلید = متن فارسی) + RTL (`start`/`end`).
5. داده از API برای خواندن؛ mutate ادمین فعلاً می‌تواند فقط state فرانت باشد تا endpoint آماده شود.
6. هر کنترل کلیک‌پذیر `cursor-pointer` (قانون سراسری + کلاس سفارشی در صورت نیاز).
7. UnoCSS variant group: `lg:(px-6 py-4)` نه تکرار پیشوند.
8. برای لیست‌ها ترجیحاً `TheSellerPageHeader` + `TheSellerListToolbar` + `useSellerListQuery` / `useSellerFilters`.

## نقشه بخش‌ها (در حال گسترش)

| اولویت | بخش | مسیر پیشنهادی | وضعیت در اسکیل |
|---|---|---|---|
| 1 | دسته‌بندی‌ها | `/seller/categories` | مشخص‌شده پایین + [categories.md](categories.md) — هدف: درخت `parentId` |
| 2 | بنرها | `/seller/banners` | مشخص‌شده پایین + [banners.md](banners.md) — placement |
| 3 | فوتر | `/seller/footer` | مشخص‌شده پایین + [footer.md](footer.md) |
| 4 | شگفت‌انگیزها | `/seller/deals` | مشخص‌شده پایین + [deals.md](deals.md) |
| 5 | اعلان‌ها | `/seller/notifications` | مشخص‌شده پایین + [notifications.md](notifications.md) |
| 6 | پرسش و پاسخ | `/seller/questions` | مشخص‌شده پایین + [questions.md](questions.md) |
| 7 | تخفیف و پروموشن | `/seller/promotions` | مشخص‌شده پایین + [promotions.md](promotions.md) |
| 8 | وبلاگ | `/seller/blog` | مشخص‌شده پایین + [blog.md](blog.md) |
| 9 | درباره ما | `/seller/about` | مشخص‌شده پایین + [about.md](about.md) |
| — | جزئیات محصول | `/seller/products/:id` | تب‌ها: خلاصه / ویرایش / قیمت / سفارش / نظرات / پرسش |
| — | محصولات / سفارش / نظرات / مالی / فروشگاه | موجود | الگو برای بخش‌های بعدی |

### محصولات — variants / inventory (Phase 2)

- لیست: فیلتر پیشرفته، bulk، export، pagination — `TheSellerProducts`
- فرم تب‌دار: پایه / قیمت / مشخصات / واریانت / رسانه / سئو — `TheSellerProductForm` + `TheSellerProductVariantsEditor`
- ویژگی‌های پویا: `/seller/attributes` (نه hardcode Color/Size)
- برند: `/seller/brands`
- موجودی و انبار: `/seller/inventory`, `/seller/inventory/movements`, `/seller/warehouses`
- commerce overlay (slug, featured, SEO, variants): `useSellerProductCommerce` تا API واریانت آماده شود
- جزئیات بیشتر: [docs/ADMIN_PHASE2.md](../../../docs/ADMIN_PHASE2.md)

### سفارش / مشتری / پشتیبانی (Phase 3)

- سفارش‌ها: فیلتر پیشرفته، bulk، export، جزئیات با timeline/یادداشت داخلی/کد پیگیری — وضعیت API حفظ شد (`new/packing/shipped/...`)
- مشتریان: `/seller/customers` + پروفایل
- مرجوعی / بازپرداخت / ارسال: `/seller/returns`, `/seller/refunds`, `/seller/shipping`
- نظرات و پرسش: فیلتر، moderation، export، RBAC
- جزئیات: [docs/ADMIN_PHASE3.md](../../../docs/ADMIN_PHASE3.md)

### Taxonomy / برند / ویژگی / رسانه (Phase 4)

- دسته‌ها: درخت چندسطحی، tree/flat، parent امن، SEO مشترک، اختصاص ویژگی، حذف ایمن
- برندها: لیست + جزئیات + SEO — `useSellerBrands`
- ویژگی‌ها: flags فیلتر/واریانت + `categoryIds` — `useSellerAttributes`
- واریانت محصول: مصرف همان attribute architecture با scope دسته
- کتابخانه رسانه: `/seller/media` + `MediaPicker` داخل `ImageUpload`
- جزئیات: [docs/ADMIN_PHASE4.md](../../../docs/ADMIN_PHASE4.md)

### بازاریابی (Phase 5)

- داشبورد: `/seller/marketing`
- تخفیف خودکار: `/seller/discounts` — `useSellerDiscounts`
- کوپن‌ها: همان کدهای تخفیف در `/seller/promotions` (overlay هدف‌گیری/سقف)
- کمپین: `/seller/campaigns` — گروه‌بندی مراجعه‌ای بدون موتور تخفیف موازی
- بنر: placement صریح + MediaPicker + `bannersForPlacement`
- شگفت‌انگیز / اعلان: ارتقای lifecycle و زمان‌بندی
- جزئیات: [docs/ADMIN_PHASE5.md](../../../docs/ADMIN_PHASE5.md)

### CMS / سئو (Phase 6)

- بلاگ: وضعیت draft/scheduled/published/archived، تگ و دسته محتوایی، SEO، پیش‌نمایش — [blog.md](blog.md)
- صفحات ثابت: `/seller/pages` روی مدل `StaticPage` موجود — [pages.md](pages.md)
- درباره ما: visibility سکشن‌ها + SEO — [about.md](about.md)
- سئو سراسری: `/seller/seo` + `useEntitySeo` روی صفحات عمومی + JSON-LD
- robots/sitemap: `server/routes/*`
- جزئیات: [docs/ADMIN_PHASE6.md](../../../docs/ADMIN_PHASE6.md)

### مالی (Phase 7)

- داشبورد KPI + بازه زمانی؛ تراکنش‌های derived؛ پرداخت‌ها از سفارش؛ تسویه درگاه/بانک (نه payout مارکت‌پلیس)
- مغایرت‌گیری، تعدیل append-only، گزارش‌ها، درگاه‌ها بدون secret — [finance.md](finance.md)
- جزئیات: [docs/ADMIN_PHASE7.md](../../../docs/ADMIN_PHASE7.md)

### سوپر ادمین / سیستم (Phase 8)

- هاب تنظیمات، نمای سیستم، منوی عمومی، CommandPalette، ورود/خروج داده، activity روی همان audit
- RBAC: SUPPORT_MANAGER، suspended، self-lockout — [system.md](system.md)
- جزئیات: [docs/ADMIN_PHASE8.md](../../../docs/ADMIN_PHASE8.md)

### آمادگی تولید (Phase 9)

- QA / empty / unsaved guard / dashboard permission / command palette RBAC
- بدون rebuild؛ وضعیت: **READY WITH BACKEND GAPS**
- جزئیات: [docs/ADMIN_PHASE9.md](../../../docs/ADMIN_PHASE9.md)

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

مصرف فرانت: کلیک دسته اصلی → `/search/category-<id>`؛ برگ → `/search/category-<id>?q=<term>` (قانون search-category-ux).

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

---

## بخش ۳ — فوتر

### هدف

ویرایش یکپارچهٔ محتوای فوتر سایت (نه لیست جدا). داده از API؛ ذخیره روی بک‌اند با sync به `useFooter` / `TheFooter`.

### فیلدها (از `FooterPayload` / `app/data/footer.ts`)

| بخش | محتوا |
|---|---|
| متن | `about`, `copyright` |
| تماس | `contact.phones[]`, `contact.email` |
| اعتماد | `trustItems[]` — id, icon, title, subtitle |
| ستون‌ها | `columns[]` — id, title, links[{label,to}] |
| سوشال | `socials[]` — id, label, icon, href |
| اپ‌استورها | `appStores[]` — id, label, icon, href |
| نشان‌ها | `badges[]` — id, label, icon |

جزئیات: [footer.md](footer.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| صفحه | `/seller/footer` → `TheSellerFooterForm` |
| nav | `{ id: 'footer', label: 'فوتر', icon: 'i-tabler-layout-bottombar', to: '/seller/footer' }` |
| API | `GET/PUT /seller/footer` · عمومی `GET /footer` |

### چک قبل از اتمام (فوتر)

- [ ] همه بخش‌های `FooterPayload` در فرم قابل ویرایش
- [ ] لود از API؛ ذخیره → `PUT /seller/footer` + state سایت
- [ ] i18n / RTL / Nuxt UI

---

## بخش ۴ — شگفت‌انگیزها

### هدف

انتخاب محصول، تعیین درصد تخفیف، بازه زمانی شروع/پایان، و فعال/غیرفعال کردن برای سکشن پیشنهاد شگفت‌انگیز. فرانت‌only.

### فیلدها

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | string | شناسه یکتا |
| `productId` | string | محصول انتخاب‌شده |
| `discountPercent` | number ۱–۹۹ | درصد تخفیف |
| `startsAt` | ISO datetime | شروع |
| `endsAt` | ISO datetime | پایان (بعد از شروع) |
| `active` | boolean | فعال بودن |

جزئیات: [deals.md](deals.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/deals` → `TheSellerDeals` |
| ایجاد | `/seller/deals/new` → `TheSellerDealForm` |
| ویرایش | `/seller/deals/:id` |
| nav | `{ id: 'deals', label: 'شگفت‌انگیزها', icon: 'i-tabler-bolt', to: '/seller/deals' }` |

### چک قبل از اتمام (شگفت‌انگیز)

- [ ] انتخاب محصول + تخفیف + بازه زمانی + active
- [ ] فیلتر فعال/اجرا/غیرفعال؛ toggle از لیست
- [ ] جلوگیری از دو شگفت‌انگیز فعال روی یک محصول
- [ ] i18n / RTL / Nuxt UI

---

## بخش ۵ — اعلان‌ها

### هدف

ارسال اعلان به همه کاربران، گروه کاربران، یا کاربران انتخابی. فرانت‌only.

### فیلدهای ارسال

| فیلد | الزام | توضیح |
|---|---|---|
| `title` | ✅ | عنوان |
| `description` | ✅ | متن |
| `link` | اختیاری | مسیر/URL کلیک (`to`) |
| `icon` | اختیاری | آیکون Tabler |
| مخاطب | ✅ | `all` \| `group` \| `users` |

جزئیات: [notifications.md](notifications.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست کمپین‌ها | `/seller/notifications` → `TheSellerNotifications` |
| ارسال | `/seller/notifications/new` → `TheSellerNotificationForm` |
| nav | `{ id: 'notifications', label: 'اعلان‌ها', icon: 'i-tabler-bell', to: '/seller/notifications' }` |

### چک قبل از اتمام (اعلان)

- [ ] title / description / link + انتخاب مخاطب
- [ ] پیش‌نمایش تعداد گیرندگان
- [ ] لیست اعلان‌های ارسال‌شده
- [ ] i18n / RTL / Nuxt UI

---

## بخش ۶ — پرسش و پاسخ محصول

### هدف

مدیریت پرسش‌های کاربران درباره محصولات: پاسخ دادن، تأیید خریدار، حذف. فرانت‌only.

هم‌راستا با `ProductQuestionSchema` / `ProductQuestion`: `productId`, `name`, `question`, `answer`, `verified`, `date`.

جزئیات: [questions.md](questions.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/questions` → `TheSellerQuestions` + `TheSellerQuestionCard` |
| nav | `{ id: 'questions', label: 'پرسش و پاسخ', icon: 'i-tabler-message-question', to: '/seller/questions' }` |

### چک قبل از اتمام (پرسش)

- [ ] فیلتر همه / بدون پاسخ / پاسخ‌داده‌شده
- [ ] پاسخ inline؛ حذف پاسخ؛ تأیید خریدار؛ حذف پرسش
- [ ] badge بدون‌پاسخ در سایدبار/منوی موبایل
- [ ] i18n / RTL / Nuxt UI

---

## بخش ۷ — تخفیف و پروموشن

### هدف

دو تب در یک بخش: **کدهای تخفیف** + **پروموهای محتوایی**. داده از API.

### کد تخفیف

| فیلد | توضیح |
|---|---|
| `code` | کد یکتا (PK منطقی) |
| `percent` | درصد ۱–۹۹ |
| `startsAt` / `endsAt` | بازه زمانی |
| `minAmount` | حداقل مبلغ سبد (تومان؛ ۰ = بدون حداقل) |
| `oncePerUser` | یک‌بار برای هر کاربر |
| `active` | فعال/غیرفعال |

API: `/seller/discount-codes` — پایه مدل: `DiscountCode` (+ فیلدهای ادمین).

### پرومو

فیلدهای `HomePromo`: eyebrow, title, subtitle, tone, icon, CTAها + `active`.

API: `/seller/content-promos` · جزئیات: [promotions.md](promotions.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست (تب‌ها) | `/seller/promotions` |
| کد جدید/ویرایش | `/seller/promotions/codes/new`, `.../codes/:id` |
| پرومو جدید/ویرایش | `/seller/promotions/promos/new`, `.../promos/:id` |
| nav | `{ id: 'promotions', label: 'تخفیف و پروموشن', icon: 'i-tabler-discount-2' }` |

---

## بخش ۸ — وبلاگ

### هدف

CRUD مطالب بلاگ سایت. فرانت‌only با state مشترک استورفرانت (`useBlog`).

جزئیات: [blog.md](blog.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| لیست | `/seller/blog` → `TheSellerBlogPosts` |
| ایجاد | `/seller/blog/new` → `TheSellerBlogForm` |
| ویرایش | `/seller/blog/:id` |
| nav | `{ id: 'blog', label: 'وبلاگ', icon: 'i-tabler-news', to: '/seller/blog' }` |

### چک قبل از اتمام (وبلاگ)

- [ ] nav + صفحات + فرم با آپلود فایل تصویر
- [ ] فیلتر دسته/وضعیت؛ toggle انتشار؛ حذف با تأیید
- [ ] استورفرانت `/blog` و `/blog/:id` از همان state
- [ ] i18n / RTL / Nuxt UI

---

## بخش ۹ — درباره ما

### هدف

ویرایش یکپارچهٔ صفحه `/about`. فرانت‌only با sync به `useAbout`.

جزئیات: [about.md](about.md)

### مسیرها

| قطعه | مسیر |
|---|---|
| صفحه | `/seller/about` → `TheSellerAboutForm` |
| nav | `{ id: 'about', label: 'درباره ما', icon: 'i-tabler-building-store', to: '/seller/about' }` |

### چک قبل از اتمام (درباره ما)

- [ ] هیرو + داستان + آمار + ارزش‌ها + مسیر رشد + تیم + CTA قابل ویرایش
- [ ] آپلود تصویر هیرو و اعضای تیم
- [ ] ذخیره → استورفرانت `/about` به‌روز می‌شود
- [ ] i18n / RTL / Nuxt UI

---

## جزئیات محصول (`/seller/products/:id`)

کامپوننت: `TheSellerProductDetail` · صفحه: `pages/seller/products/[id].vue` · middleware: `auth` + `admin`

تب‌ها (`?tab=`): `summary` | `edit` | `price` | `orders` | `reviews` | `questions`

| تب | محتوا |
|---|---|
| خلاصه | آمار (فروش/موجودی/بازدید/امتیاز/نظرات/پرسش/سفارش) + stock/status/badge/fastDelivery |
| ویرایش | `TheSellerProductForm` با `mode="edit"` |
| قیمت و تخفیف | قیمت / oldPrice / درصد · لینک شگفت‌انگیز و کد تخفیف · تاریخچه `useSellerProductPriceHistory` |
| سفارش‌ها / نظرات / پرسش‌ها | فیلتر روی همان `productId` |

لیست محصولات از `TheSellerProductRow` به جزئیات لینک می‌شود (نه فقط استورفرانت).
