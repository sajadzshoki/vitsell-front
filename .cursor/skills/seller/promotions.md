---
name: seller-promotions
description: Discount codes and content promos admin UI for digishop seller panel.
---

# Seller — تخفیف و پروموشن (مرجع)

مکمل [SKILL.md](SKILL.md). مسیر: `/seller/promotions`.

## تب‌ها

1. **کدهای تخفیف** — API: `/seller/discount-codes`
2. **پروموها** — API: `/seller/content-promos`

## مدل کد

```ts
type SellerDiscountCode = {
  code: string
  percent: number // ۱–۹۹ در ادمین؛ در DB به‌صورت ratio ذخیره می‌شود
  active: boolean
  startsAt: string
  endsAt: string
  minAmount: number
  oncePerUser: boolean
  createdAt: string | null
  updatedAt: string | null
}
```

Validation: کد `[A-Z0-9-]+`، درصد ۱–۹۹، پایان بعد از شروع، `minAmount >= 0`.

## مدل پرومو

```ts
type SellerContentPromo = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  tone: 'primary' | 'warning'
  icon: string
  primaryCtaLabel: string
  primaryCtaTo: string
  secondaryCtaLabel: string
  secondaryCtaTo: string
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}
```

## فایل‌ها

- `app/data/seller-promotions.ts`
- `app/composables/useSellerPromotions.ts`
- `TheSellerPromotions` / `DiscountCodeForm` / `ContentPromoForm`
- بک‌اند: `discount_codes_controller` + `content_promos_controller`

## API (admin)

| Method | Path |
|---|---|
| `GET\|POST` | `/seller/discount-codes` |
| `GET\|PUT\|DELETE` | `/seller/discount-codes/:code` |
| `PATCH` | `/seller/discount-codes/:code/active` |
| `GET\|POST` | `/seller/content-promos` |
| `GET\|PUT\|DELETE` | `/seller/content-promos/:id` |
| `PATCH` | `/seller/content-promos/:id/active` |

استورفرانت: `GET /discount-codes` (ratio، فقط فعال و در بازه) · `GET /home` → `promos` از جدول `content_promos`.
