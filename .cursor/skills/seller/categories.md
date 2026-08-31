---
name: seller-categories
description: Detailed category CRUD rules for the digishop seller (admin) panel.
---

# Seller — Categories CRUD (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام پیاده‌سازی `/seller/categories` این فایل را بخوان.

## تایپ‌های مرجع

از کد موجود import کن؛ دوباره تعریف نکن مگر لازم باشد:

```ts
// app/data/categories.ts
Category, CategorySub

// app/data/category-pages.ts
CategoryPageMeta, CategorySuggestedItem
```

`CategorySchema` (`types/models.ts`):

- `id`, `name`, `icon`, `image`, `subs`, `pageMeta`, `suggested`, `createdAt`, `updatedAt`

## Validation

| فیلد | قانون |
|---|---|
| `id` | الزامی در create؛ فقط `[a-z0-9-]`؛ یکتا؛ روی edit قفل |
| `name` | الزامی؛ trim |
| `icon` | الزامی؛ string کوتاه (کلید بدون پیشوند `i-tabler-`) |
| `image` | اختیاری؛ URL نسبی/مطلق معتبر یا خالی → `null` |
| `subs` | آرایه؛ هر گروه `name` غیرخالی؛ `items` آرایه string (خالی‌ها را trim/حذف کن) |
| `pageMeta` | `null` یا آبجکت کامل `CategoryPageMeta` (hero + seo) |
| `suggested` | `null` یا آرایه `{ id, title, image, query }` |

حذف دسته: تأیید صریح (`UModal` confirm). اگر بک‌اند به خاطر محصولات وابسته رد کرد، toast خطا نشان بده.

## UX فرم

1. **پایه:** `id` (create)، `name`، `icon` با پیش‌نمایش آیکون زنده.
2. **تصویر دسته:** فیلد URL یا آپلود مطابق الگوی پروژه؛ preview + clear.
3. **زیردسته‌ها:** لیست گروه‌ها؛ هر گروه: نام، تصویر، لیست chip/input برای `items`، دکمه افزودن گروه، حذف گروه، drag یا دکمه بالا/پایین برای ترتیب.
4. **صفحه دسته (`pageMeta`):** تب/آکاردئون — hero (`image`, `eyebrow`, `title`, `subtitle`) و seo (`heading`, `paragraphs[]` با افزودن/حذف پاراگراف).
5. **پیشنهادی‌ها (`suggested`):** جدول/کارت‌های ردیفی با فیلدهای `id`, `title`, `image`, `query`.

دکمه‌ها: ذخیره / انصراف. در حالت edit، `createdAt`/`updatedAt` به‌صورت متن muted نشان بده.

## همسویی با استورفرانت

- بعد از create/update/delete: `fetchCategories({ force: true })` یا پاک کردن `categories-loaded` در `useCategories`.
- شکل `subs` را نشکن؛ MegaMenu و Search به همین ساختار وابسته‌اند.
- آیکون‌های جدید: اگر فقط `icon` string ذخیره می‌شود و `categoryIcons` map فرانت قدیمی است، یا از `icon` مستقیم `i-tabler-${icon}` بساز (ترجیح API)، یا map را به‌روز نگه دار — با الگوی فعلی `getCategoryIcon` سازگار بمان.

## API contract پیشنهادی

Body ایجاد/ویرایش (JSON):

```json
{
  "id": "mobile",
  "name": "موبایل",
  "icon": "device-mobile",
  "image": "/images/...",
  "subs": [
    {
      "name": "برندهای موبایل",
      "items": ["اپل", "سامسونگ"],
      "image": "/images/..."
    }
  ],
  "pageMeta": {
    "hero": {
      "image": "",
      "eyebrow": "",
      "title": "",
      "subtitle": ""
    },
    "seo": {
      "heading": "",
      "paragraphs": [""]
    }
  },
  "suggested": [
    {
      "id": "iphone",
      "title": "آیفون",
      "image": "/images/...",
      "query": "آیفون"
    }
  ]
}
```

اگر endpoint ادمین هنوز در بک‌اند نیست:

1. UI کامل را با composable جدا (`useSellerCategories`) بساز.
2. متدهای mutate را به pathهای بالا وصل کن.
3. تا آماده‌شدن API، خطای شبکه را با toast واضح نشان بده — mock محلی فقط اگر کاربر صریحاً خواست.

## الگوی فایل (پیشنهادی)

```
app/pages/seller/categories/index.vue
app/pages/seller/categories/new.vue          # یا مودال
app/pages/seller/categories/[id].vue         # ویرایش
app/components/TheSeller/Categories.vue
app/components/TheSeller/CategoryForm.vue
app/components/TheSeller/CategorySubsEditor.vue
app/composables/useSellerCategories.ts       # اختیاری اگر منطق زیاد شد
```

Nav در `app/data/seller.ts` — بدون این، بخش در سایدبار دیده نمی‌شود.
