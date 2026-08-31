# مستند Routeهای API — Digishop Back

منبع حقیقت: `start/routes.ts`  
مستند کامل (فرانت + API): [`digishop-front/docs/ROUTES.md`](../../digishop-front/docs/ROUTES.md)

**Prefix:** `/api/v1`  
**Auth:** `Authorization: Bearer <token>`

## Auth

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/otp/request` | — |
| `POST` | `/auth/otp/verify` | — |
| `GET` | `/auth/me` | ✅ |
| `POST` | `/auth/logout` | ✅ |

## Catalog & content

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/categories` | — |
| `GET` | `/categories/:id` | — |
| `GET` | `/category-pages/:id` | — |
| `GET` | `/products` | — |
| `GET` | `/products/:id` | — |
| `GET` | `/products/:id/reviews` | — |
| `GET` | `/products/:id/questions` | — |
| `GET` | `/home` | — |
| `GET` | `/locations` | — |
| `GET` | `/compare/templates/:category` | — |
| `GET` | `/footer` | — |
| `GET` | `/discount-codes` | — |
| `GET` | `/blog` | — |
| `GET` | `/blog/:id` | — |
| `GET` | `/static-pages/:id` | — |

## Frontend catalog navigation (digishop)

| UI | Route | Notes |
|----|-------|-------|
| MegaMenu — دسته اصلی | `/search?category=<id>` | `toSearchRoute({ category })` — نه `/category/:id` |
| MegaMenu — آیتم برگ | `/search?q=<term>&category=<id>` | |
| Search — زیردسته‌ها | همان `/search` | داخل `TheSearchHeader` وقتی `?category=` ست است؛ عکس از `CategorySchema.image` / `subs[].image` |
| فیلتر محصولات | `GET /products?category=&q=` | |

## Cart / wishlist / account / checkout (auth مگر خلافش گفته شود)

| Method | Path |
|--------|------|
| `GET\|POST\|DELETE` | `/cart` |
| `PATCH\|DELETE` | `/cart/:productId` |
| `GET\|POST` | `/wishlist` |
| `DELETE` | `/wishlist/:productId` |
| `GET\|PUT` | `/account/profile` |
| `GET\|POST` | `/account/addresses` |
| `PUT\|DELETE` | `/account/addresses/:id` |
| `GET` | `/account/orders` |
| `GET` | `/account/orders/:id` |
| `POST` | `/checkout/place` |
| `GET` | `/payments/zarinpal/callback` *(بدون auth)* |

## Notifications & seller (auth)

| Method | Path |
|--------|------|
| `GET` | `/notifications` |
| `POST` | `/notifications/:id/read` |
| `POST` | `/notifications/read-all` |
| `GET\|PUT` | `/seller/shop` |
| `GET` | `/seller/listings` |
| `GET` | `/seller/orders` |
| `GET` | `/seller/orders/:id` |
| `PATCH` | `/seller/orders/:id/status` |
| `GET` | `/seller/reviews` |
| `POST` | `/seller/reviews/:id/reply` |
| `GET` | `/seller/payouts` |
| `GET` | `/seller/sales` |
