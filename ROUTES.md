# مستند Routeهای API — vitsell Back

منبع حقیقت: `start/routes.ts`  
مستند کامل (فرانت + API): [`vitsell-front/docs/ROUTES.md`](../../vitsell-front/docs/ROUTES.md)

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
| `GET` | `/mega-menu` | — storefront mega menu tree |
| `GET` | `/mega-menu/resolve?path=` | — resolve SEO path → filter |
| `GET` | `/navigation` | — quick/bottom links |
| `GET\|POST` | `/seller/mega-menus` | ✅ admin |
| `GET\|PUT\|DELETE` | `/seller/mega-menus/:id` | ✅ admin |
| `PATCH` | `/seller/mega-menus/:id/status` | ✅ admin |
| `POST` | `/seller/mega-menus/reorder` | ✅ admin |
| `POST\|PUT\|DELETE` | `/seller/mega-menu-sections[...]` | ✅ admin — status + reorder |
| `POST\|PUT\|DELETE` | `/seller/mega-menu-items[...]` | ✅ admin — status + reorder |
| `GET\|POST` | `/seller/categories` | ✅ admin — GET: `q`, `status`, `parentId` |
| `GET\|PUT\|DELETE` | `/seller/categories/:id` | ✅ admin |
| `GET\|POST` | `/seller/brands` | ✅ admin — GET: `q`, `status`, `page`, `pageSize` |
| `GET\|PUT\|DELETE` | `/seller/brands/:id` | ✅ admin |
| `PATCH` | `/seller/brands/:id/status` | ✅ admin |
| `GET\|POST` | `/seller/attributes` | ✅ admin — GET: `q`, `status`, `type`, `trait`, `page` |
| `GET\|PUT\|DELETE` | `/seller/attributes/:id` | ✅ admin |
| `PATCH` | `/seller/attributes/:id/status` | ✅ admin |
| `GET\|POST` | `/seller/warehouses` | ✅ admin — GET: `q`, `status`, `page`, `pageSize`, `all` |
| `GET\|PUT\|DELETE` | `/seller/warehouses/:id` | ✅ admin |
| `GET` | `/seller/inventory` | ✅ admin — `q`, `status`, `warehouse`/`warehouseId`, `category`, `brand`, `page` |
| `PATCH` | `/seller/inventory/:productId` | ✅ admin — تنظیم موجودی + ثبت movement |
| `GET\|POST` | `/seller/stock-movements` | ✅ admin — GET: `q`, `type`, `warehouseId`, `page` |
| `GET\|POST` | `/seller/listings` | ✅ admin |
| `GET\|PATCH\|DELETE` | `/seller/listings/:productId` | ✅ admin |
| `GET` | `/products` | — |
| `GET` | `/products/:id` | — |
| `GET` | `/products/:id/reviews` | — |
| `GET` | `/products/:id/questions` | — |
| `GET` | `/home` | — |
| `GET` | `/locations` | — |
| `GET` | `/compare/templates/:category` | — |
| `GET` | `/footer` | — |
| `GET\|PUT` | `/seller/footer` | ✅ admin |
| `GET` | `/discount-codes` | — |
| `GET` | `/blog` | — |
| `GET` | `/blog/:id` | — |
| `GET` | `/static-pages/:id` | — |

## Frontend catalog navigation (vitsell)

| UI | Route | Notes |
|----|-------|-------|
| MegaMenu — ریشه | از `GET /mega-menu` | نه `Category.subs` |
| MegaMenu — category item | `/category/<menu>/<section>/…` یا `/search/category-<id>` | `href` از API / fallback `toSearchRoute` |
| MegaMenu — filter item | `/category/<menu>/<section>/…/<item-slug>` مثلاً `/category/mobile/mobile-phone/price-up-to-30ml` | resolve: `GET /mega-menu/resolve?path=` |
| MegaMenu — link item | URL ذخیره‌شده | داخلی یا خارجی |
| Search — زیردسته‌ها | همان path دسته | داخل `TheSearchHeader` وقتی category از path ست است؛ عکس از `CategorySchema.image` / `subs[].image` |
| فیلتر محصولات | `GET /products?category=&q=&brands=&minPrice=&maxPrice=&attrs=` | |

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
| `GET\|POST` | `/seller/categories` | `q` `status` `parentId` |
| `GET` | `/seller/categories/:id/spec-keys` | کلیدهای مشخصات پیشنهادی همان دسته |
| `GET\|PUT\|DELETE` | `/seller/categories/:id` | |
| `GET\|POST` | `/seller/brands` | `q` `status` `page` `pageSize` |
| `GET\|PUT\|PATCH\|DELETE` | `/seller/brands/:id` | PATCH `/status` |
| `GET\|POST` | `/seller/attributes` | `q` `status` `type` `trait` `page` |
| `GET\|PUT\|PATCH\|DELETE` | `/seller/attributes/:id` | PATCH `/status` |
| `GET\|POST` | `/seller/warehouses` | `q` `status` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/warehouses/:id` | |
| `GET` | `/seller/inventory` | `q` `status` `warehouse` `category` `brand` `page` |
| `PATCH` | `/seller/inventory/:productId` | adjust stock |
| `GET\|POST` | `/seller/stock-movements` | `q` `type` `warehouseId` `page` |
| `GET` | `/seller/listings` |
| `GET` | `/seller/listings/:productId` |
| `POST` | `/seller/listings` |
| `PATCH` | `/seller/listings/:productId` |
| `DELETE` | `/seller/listings/:productId` |
| `GET` | `/seller/orders` | `q` `status` `payment` `shipping` `paymentMethod` `amountMin` `amountMax` `dateFrom` `dateTo` `hasDiscount` `hasRefund` `hasReturn` `needsTracking` `sort` `page` `pageSize` `all` |
| `GET` | `/seller/orders/:id` | جزئیات + commerce + invoice + payment |
| `PATCH` | `/seller/orders/:id/status` |
| `PATCH` | `/seller/orders/:id/tracking` | کد پیگیری / حامل / ETA |
| `POST` | `/seller/orders/:id/notes` | یادداشت داخلی |
| `POST` | `/seller/orders/:id/refunds` | ثبت بازپرداخت |
| `GET\|POST` | `/seller/returns` | ✅ admin — GET: `q`, `status`, `page`, `pageSize`, `all` |
| `GET` | `/seller/returns/:id` | ✅ admin |
| `PATCH` | `/seller/returns/:id/status` | ✅ admin |
| `GET\|POST` | `/seller/refunds` | ✅ admin — GET: `q`, `status`, `page`, `pageSize`, `all` · POST: ثبت بازپرداخت |
| `GET` | `/seller/refunds/:id` | ✅ admin |
| `PATCH` | `/seller/refunds/:id/status` | ✅ admin — pending→processing/completed/cancelled · processing→completed/failed |
| `GET` | `/seller/shipping` | ✅ admin — روش‌های ارسال (`q`, `status`) |
| `GET\|PATCH` | `/seller/shipping/:id` | ✅ admin — جزئیات / به‌روزرسانی هزینه و وضعیت |
| `GET` | `/seller/customers` | ✅ admin — `q` `status` `hasOrders` `spendMin` `spendMax` `sort` `page` `pageSize` `all` |
| `POST` | `/seller/customers/bulk-status` | ✅ admin — `{ ids, status }` |
| `GET\|PATCH` | `/seller/customers/:id` | ✅ admin — جزئیات / ویرایش پروفایل |
| `PATCH` | `/seller/customers/:id/status` | ✅ admin — active/inactive/blocked |
| `GET` | `/seller/reviews` | ✅ admin — `q` `status` `rating` `page` `pageSize` `all` |
| `POST` | `/seller/reviews/bulk-moderation` | ✅ admin — `{ ids, moderation }` |
| `GET` | `/seller/reviews/:id` | ✅ admin |
| `POST` | `/seller/reviews/:id/reply` | ✅ admin |
| `PATCH` | `/seller/reviews/:id/moderation` | ✅ admin — pending/approved/rejected/hidden |
| `GET` | `/seller/questions` | ✅ admin — `q` `status`(`all`/`unanswered`/`answered`) `page` `pageSize` `all` |
| `GET` | `/seller/questions/:id` | ✅ admin |
| `POST` | `/seller/questions/:id/reply` | ✅ admin — `{ text, author? }` |
| `DELETE` | `/seller/questions/:id/answer` | ✅ admin |
| `PATCH` | `/seller/questions/:id/verified` | ✅ admin — `{ verified }` |
| `DELETE` | `/seller/questions/:id` | ✅ admin |
| `GET` | `/seller/marketing` | ✅ admin — خلاصه داشبورد (`from` `to`) |
| `GET\|POST` | `/seller/discounts` | ✅ admin — GET: `q` `status` `type` `page` `pageSize` `all` |
| `POST` | `/seller/discounts/bulk-status` | ✅ admin — `{ ids, status }` |
| `POST` | `/seller/discounts/bulk-delete` | ✅ admin — `{ ids }` |
| `GET\|PUT\|DELETE` | `/seller/discounts/:id` | ✅ admin |
| `PATCH` | `/seller/discounts/:id/status` | ✅ admin — active/inactive |
| `GET\|POST` | `/seller/campaigns` | ✅ admin — GET: `q` `status` `page` `pageSize` `all` |
| `POST` | `/seller/campaigns/bulk-status` | ✅ admin — `{ ids, manualStatus }` |
| `POST` | `/seller/campaigns/bulk-delete` | ✅ admin — `{ ids }` |
| `GET\|PUT\|DELETE` | `/seller/campaigns/:id` | ✅ admin |
| `PATCH` | `/seller/campaigns/:id/status` | ✅ admin — draft/active/paused/archived |
| `GET\|POST` | `/seller/banners` | ✅ admin — GET: `q` `status` `placement` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/banners/:id` | ✅ admin |
| `PATCH` | `/seller/banners/:id/active` | ✅ admin |
| `GET\|POST` | `/seller/deals` | ✅ admin — GET: `q` `status` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/deals/:id` | ✅ admin |
| `PATCH` | `/seller/deals/:id/active` | ✅ admin |
| `GET\|POST` | `/seller/discount-codes` | ✅ admin — GET: `q` `status` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/discount-codes/:code` | ✅ admin |
| `PATCH` | `/seller/discount-codes/:code/active` | ✅ admin |
| `GET\|POST` | `/seller/content-promos` | ✅ admin — GET: `q` `status` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/content-promos/:id` | ✅ admin |
| `PATCH` | `/seller/content-promos/:id/active` | ✅ admin |
| `GET` | `/seller/notifications` | ✅ admin — `q` `status` `type` `page` `pageSize` `all` |
| `GET` | `/seller/notifications/:id` | ✅ admin |
| `GET` | `/seller/notification-users` | ✅ admin |
| `POST` | `/seller/notifications/preview` | ✅ admin |
| `POST` | `/seller/notifications` | ✅ admin |
| `PATCH` | `/seller/notifications/:id/cancel` | ✅ admin |
| `DELETE` | `/seller/notifications/:id` | ✅ admin |
| `GET\|POST` | `/seller/blog` | ✅ admin — GET: `q` `status` `category` `author` `featured` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/blog/:id` | ✅ admin |
| `PATCH` | `/seller/blog/:id/status` | ✅ admin — draft/scheduled/published/archived |
| `GET\|POST` | `/seller/pages` | ✅ admin — GET: `q` `status` `page` `pageSize` `all` |
| `GET\|PUT\|DELETE` | `/seller/pages/:id` | ✅ admin |
| `PATCH` | `/seller/pages/:id/status` | ✅ admin — draft/published/archived |
| `GET\|PUT` | `/seller/about` | ✅ admin — صفحه درباره ما |
| `GET\|PUT` | `/seller/settings` | ✅ admin — تنظیمات پلتفرم |
| `GET` | `/seller/system` | ✅ admin — نمای سیستم (آمار + یکپارچه‌سازی) |
| `GET\|POST` | `/seller/media` | ✅ admin — GET: `q` `kind` `page` `pageSize` `all`؛ POST: multipart `file` |
| `POST` | `/seller/media/register` | ✅ admin — ثبت URL موجود در کتابخانه |
| `POST` | `/seller/media/bulk-delete` | ✅ admin — `{ ids: string[] }` |
| `GET\|PUT\|DELETE` | `/seller/media/:id` | ✅ admin |
| `GET\|POST` | `/seller/admins` | ✅ admin — GET: `q` `status` `roleId` `page`؛ POST ایجاد ادمین+نقش |
| `GET\|PUT\|DELETE` | `/seller/admins/:id` | ✅ admin |
| `PATCH` | `/seller/admins/:id/status` | ✅ admin — active/inactive/suspended |
| `GET\|POST` | `/seller/roles` | ✅ admin — نقش‌ها + permissions |
| `GET\|PUT\|DELETE` | `/seller/roles/:id` | ✅ admin |
| `GET` | `/seller/permissions` | ✅ admin — کاتالوگ کلیدها |
| `GET\|POST` | `/seller/audit` | ✅ admin — GET: `q` `action` `entity` `actorId` `mode` `dateFrom` `dateTo` `page`؛ POST append-only |
| `GET` | `/seller/payouts` |
| `GET` | `/seller/sales` |
