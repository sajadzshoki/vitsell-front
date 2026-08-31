---
name: seller-promotions
description: Discount codes and content promos admin UI for digishop seller panel.
---

# Seller — تخفیف و پروموشن (مرجع)

مکمل [SKILL.md](SKILL.md). مسیر: `/seller/promotions`.

## تب‌ها

1. **کدهای تخفیف** — seed از `cartDiscountCodes`
2. **پروموها** — seed از `homePromos`

## مدل کد

```ts
type SellerDiscountCode = {
  code: string
  percent: number
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
  ...
}
```

## فایل‌ها

- `app/data/seller-promotions.ts`
- `app/composables/useSellerPromotions.ts`
- `TheSellerPromotions` / `DiscountCodeForm` / `ContentPromoForm`

بک‌اند write فعلاً نیست.
