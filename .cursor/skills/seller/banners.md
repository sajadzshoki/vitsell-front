---
name: seller-banners
description: Banner CRUD rules for the digishop seller (admin) panel.
---

# Seller — Banners CRUD (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/banners` این فایل را بخوان.

## مدل

```ts
type SellerBannerType = 'main' | 'secondary'

type SellerBanner = {
  id: string
  image: string
  link: string
  type: SellerBannerType
  categoryId: string | null
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}
```

منبع تایپ/seed: `app/data/seller-banners.ts`  
منطق CRUD فرانت: `app/composables/useSellerBanners.ts`

## Validation

| فیلد | قانون |
|---|---|
| `id` | الزامی در create؛ `[a-z0-9-]+`؛ یکتا؛ روی edit قفل |
| `image` | الزامی |
| `link` | الزامی (مسیر نسبی یا URL) |
| `type` | فقط `main` یا `secondary` |
| `categoryId` | اختیاری؛ خالی → `null` |
| `active` | boolean |

## UX

- لیست: پیش‌نمایش تصویر، نوع، وضعیت، دسته، لینک؛ فیلتر نوع + وضعیت؛ جستجو
- اکشن سریع: فعال/غیرفعال کردن از لیست
- فرم: پیش‌نمایش تصویر + لینک؛ select دسته از `useCategories`
- حذف: `UModal` تأیید

## نکته بک‌اند

فعلاً mutate فقط در state فرانت است. seed از `heroSlides` (اصلی) و `homeBannerRows` (فرعی). وقتی API آماده شد، همان فیلدها را به endpoint وصل کن.
