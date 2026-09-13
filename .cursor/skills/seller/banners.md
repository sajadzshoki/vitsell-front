---
name: seller-banners
description: Banner CRUD rules for the vitsell seller (admin) panel.
---

# Seller — Banners CRUD (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/banners` این فایل را بخوان.

## مدل

```ts
type SellerBannerType = 'main' | 'secondary'

type SellerBannerLinkType =
  | 'none'
  | 'url'
  | 'product'
  | 'category'
  | 'brand'
  | 'campaign'

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
  linkType: SellerBannerLinkType
  buttonText: string | null
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
منطق CRUD فرانت: `app/composables/useSellerBanners.ts`

## Validation

| فیلد | قانون |
|---|---|
| `id` | الزامی در create؛ `[a-z0-9-]+`؛ یکتا؛ روی edit قفل |
| `image` | الزامی (دسکتاپ) |
| `imageMobile` | اختیاری |
| `link` / `linkType` | لینک اختیاری؛ `none` = بدون لینک و بدون دکمه |
| `buttonText` | اختیاری؛ فقط وقتی لینک هست در اسلایدر نمایش داده می‌شود |
| `type` | فقط `main` یا `secondary` |
| `placement` | یکی از placementهای بالا — اسلایدر صفحه اصلی = `homepage_hero` |
| `categoryId` | اختیاری؛ خالی → `null` |
| `startsAt` / `endsAt` | اختیاری؛ ISO؛ پایان بعد از شروع |
| `sortOrder` | عدد ≥ ۰ |
| `active` | boolean |

## Placement

جایگاه باید صریح باشد — بنر بدون context آپلود نشود. برای اسلایدر هیرو حتماً `homepage_hero` و `active=true` باشد.
