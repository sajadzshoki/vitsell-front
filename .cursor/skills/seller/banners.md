---
name: seller-banners
description: Banner CRUD rules for the digishop seller (admin) panel.
---

# Seller — Banners CRUD (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/banners` این فایل را بخوان.

## مدل

```ts
type SellerBannerType = 'main' | 'secondary'

type SellerBannerPlacement =
  | 'homepage_hero'
  | 'homepage_promo_strip'
  | 'homepage_category'
  | 'product_listing'
  | 'category_page'
  | 'product_detail'
  | 'sidebar'
  | 'footer_promo'

type SellerBanner = {
  id: string
  image: string
  imageMobile: string | null
  link: string
  type: SellerBannerType
  placement: SellerBannerPlacement
  categoryId: string | null
  active: boolean
  startsAt: string | null
  endsAt: string | null
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}
```

منبع تایپ/seed: `app/data/seller-banners.ts`  
منطق CRUD فرانت: `app/composables/useSellerBanners.ts` (فعلاً local state)

## Validation

| فیلد | قانون |
|---|---|
| `id` | الزامی در create؛ `[a-z0-9-]+`؛ یکتا؛ روی edit قفل |
| `image` | الزامی (دسکتاپ) |
| `imageMobile` | اختیاری |
| `link` | الزامی (مسیر نسبی یا URL) |
| `type` | فقط `main` یا `secondary` |
| `placement` | یکی از placementهای بالا |
| `categoryId` | اختیاری؛ خالی → `null` |
| `startsAt` / `endsAt` | اختیاری؛ ISO؛ پایان بعد از شروع |
| `sortOrder` | عدد ≥ ۰ |
| `active` | boolean |

## Placement

جایگاه باید صریح باشد — بنر بدون context آپلود نشود. لیست placement قابل گسترش است؛ در استورفرانت بعداً بر اساس `placement` فیلتر کنید.
