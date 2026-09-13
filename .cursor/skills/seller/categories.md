---
name: seller-categories
description: Detailed category CRUD rules for the vitsell seller (admin) panel.
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

// app/data/seller-categories.ts
SellerCategory  // + parentId, status, sortOrder, seo

// app/data/seo.ts
SeoMeta
```

`CategorySchema` (`types/models.ts`) امروز:

- `id`, `name`, `icon`, `image`, `text`, `parentId`, `status`, `sortOrder`, `seo`, `subs`, `pageMeta`, `suggested`, `createdAt`, `updatedAt`

### مدل هدف (درخت)

هر دسته موجودیت مستقل است با:

- `parentId: string | null` — ریشه یا والد (چند سطح؛ نه فقط Parent→Child)
- `status`, `sortOrder`
- `seo: SeoMeta` (متای ایندکس) + `pageMeta` (محتوای صفحه دسته)
- `subs` فعلاً برای گروه‌های جستجو/MegaMenu می‌ماند تا مهاجرت استورفرانت

فرم ادمین: انتخاب والد (ریشه یا یکی از دسته‌ها، بدون چرخه). استورفرانت تا مهاجرت به درخت، همان لیست تخت + `subs` را مصرف می‌کند.

## Validation

| فیلد | قانون |
|---|---|
| `id` | الزامی در create؛ فقط `[a-z0-9-]`؛ یکتا؛ روی edit قفل |
| `name` | الزامی؛ trim |
| `icon` | الزامی؛ string کوتاه (کلید بدون پیشوند `i-tabler-`) |
| `image` | اختیاری؛ URL نسبی/مطلق معتبر یا خالی → `null` |
| `parentId` | اختیاری؛ `null`/خالی = ریشه؛ نباید self یا descendant باشد |
| `status` | `active` \| `inactive` |
| `sortOrder` | عدد ≥ ۰ |
| `seo` | `SeoMeta` یا null پس از sanitize |
| `subs` | آرایه؛ هر گروه `name` غیرخالی؛ `items` آرایه string (خالی‌ها را trim/حذف کن) |
| `pageMeta` | `null` یا آبجکت کامل `CategoryPageMeta` (hero + seo body) |
| `suggested` | `null` یا آرایه `{ id, title, image, query }` |

حذف دسته: تأیید صریح (`UModal` confirm). اگر بک‌اند به خاطر محصولات وابسته رد کرد، toast خطا نشان بده.

## UX فرم

1. **پایه:** `id` (create)، `name`، `icon` با پیش‌نمایش، **والد**، وضعیت، ترتیب.
2. **تصویر دسته:** فیلد URL یا آپلود؛ preview + clear.
3. **زیردسته‌ها (`subs`):** گروه‌های جستجو (نه درخت والد/فرزند) تا مهاجرت.
4. **صفحه دسته (`pageMeta`):** hero + seo heading/paragraphs.
5. **سئو ایندکس (`TheSellerSeoFields`):** meta/OG/Twitter.
6. **پیشنهادی‌ها (`suggested`):** کارت‌های `id`, `title`, `image`, `query`.

دکمه‌ها: ذخیره / انصراف. در حالت edit، `createdAt`/`updatedAt` به‌صورت متن muted نشان بده.

## همسویی با استورفرانت

- بعد از create/update/delete: sync `useCategories` / invalidate.
- شکل `subs` را نشکن؛ MegaMenu و Search به همین ساختار وابسته‌اند.
- تا وقتی بک‌اند `parent_id` ندارد، payload را بفرست؛ فیلدهای ناشناخته ممکن است نادیده گرفته شوند.

## API contract پیشنهادی

Body ایجاد/ویرایش (JSON):

```json
{
  "id": "android",
  "name": "اندروید",
  "icon": "device-mobile",
  "image": "/images/...",
  "parentId": "mobile",
  "status": "active",
  "sortOrder": 1,
  "seo": {
    "metaTitle": "...",
    "metaDescription": "...",
    "canonicalUrl": "",
    "robots": "index,follow",
    "ogTitle": "",
    "ogDescription": "",
    "ogImage": ""
  },
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
