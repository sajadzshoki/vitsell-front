# Admin Phase 5 — Marketing, Promotions, Discounts, Banners & Notifications

Frontend-first Marketing & Merchandising for the digishop seller panel.

## Mapping

| Concept | Implementation |
|---|---|
| Coupons | Extended `SellerDiscountCode` under `/seller/promotions/codes*` (API `/seller/discount-codes`) |
| Automatic discounts | New FE `SellerDiscount` at `/seller/discounts` |
| Campaigns | New FE grouping at `/seller/campaigns` (references discounts/coupons/deals/banners) |
| Content promos | Existing `/seller/promotions` tab (unchanged entity) |
| Marketing hub | `/seller/marketing` dashboard |

## Routes

| Module | Path |
|---|---|
| Marketing dashboard | `/seller/marketing` |
| Campaigns | `/seller/campaigns` |
| Discounts | `/seller/discounts` |
| Coupons + content promos | `/seller/promotions` |
| Deals | `/seller/deals` |
| Banners | `/seller/banners` |
| Notifications | `/seller/notifications` |

## Shared

- `seller-marketing-shared.ts` — schedule status, overlap, conflict hints, targeting types
- `MarketingTargetingFields.vue` — reusable product/category/brand targeting

## Permissions

`marketing.view|manage`, `discounts.*`, `coupons.*`, `campaigns.*`, `banners.*`, `deals.*` / `amazing_deals.*` aliases, `promotions.*`, `notifications.view|create|update|delete|send`

## Backend used

- Deals: `/seller/deals`
- Discount codes: `/seller/discount-codes`
- Content promos: `/seller/content-promos`
- Notifications: `/seller/notifications*`
- Upload via existing media/`POST /upload` for images

## Gaps

- Banner CRUD API missing (FE state + `bannersForPlacement` storefront bridge when admin seeded)
- Coupon overlay fields (targeting, fixed amount, usage stats) FE until API accepts them
- Automatic discounts & campaigns FE-only
- No fake CTR / stacking engine
- Delivery receipts not claimed without API data
