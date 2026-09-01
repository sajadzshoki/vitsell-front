---
name: seller-deals
description: Amazing deals (شگفت‌انگیز) CRUD for the digishop seller admin panel.
---

# Seller — شگفت‌انگیزها (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/deals` این فایل را بخوان.

## مدل

```ts
type SellerAmazingDeal = {
  id: string
  productId: string
  discountPercent: number // 1–99
  startsAt: string        // ISO
  endsAt: string          // ISO
  active: boolean
  createdAt: string | null
  updatedAt: string | null
}
```

منبع: `app/data/seller-deals.ts`  
CRUD فرانت: `app/composables/useSellerDeals.ts`

## قوانین

- یک محصول حداکثر یک شگفت‌انگیز **فعال** همزمان
- `endsAt` باید بعد از `startsAt` باشد
- قیمت شگفت‌انگیز = `price * (100 - discountPercent) / 100`
- «در حال اجرا» = `active` و الان بین start و end

## UI

- لیست: تصویر محصول، درصد، بازه، وضعیت، قیمت قبل/بعد
- فرم: select جستجوپذیر محصول، درصد، datetime-local شروع/پایان، چک‌باکس فعال
- seed اولیه از محصولات دارای `oldPrice`

## بک‌اند

| Method | Path |
|--------|------|
| `GET\|POST` | `/seller/deals` |
| `GET\|PUT\|DELETE` | `/seller/deals/:id` |
| `PATCH` | `/seller/deals/:id/active` |

خانه (`GET /home` → `dealsOfTheDay`) از شگفت‌انگیزهای **فعال و در بازه زمانی** پر می‌شود؛ اگر خالی بود به محصولات دارای `oldPrice` برمی‌گردد.
