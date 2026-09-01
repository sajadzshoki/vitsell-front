# Admin Phase 3 — Orders, Customers, Returns, Support

Frontend-first upgrades for order lifecycle, customers, returns/refunds, shipping, reviews, and Q&A.

## Status model (orders)

Backend/FE `SellerOrderStatus` kept as source of truth:

`new → packing → shipped → delivered` (+ `returned`, `cancelled`)

Separate FE dimensions (overlay): payment / shipping / return / refund statuses — do not merge into one field.

## Routes

| Module | Path |
|---|---|
| Orders | `/seller/orders`, `/seller/orders/:id` |
| Customers | `/seller/customers`, `/seller/customers/:id` |
| Returns | `/seller/returns` |
| Refunds | `/seller/refunds` |
| Shipping | `/seller/shipping` |
| Reviews | `/seller/reviews` |
| Q&A | `/seller/questions` |

## Backend used

- `GET/PATCH` `/seller/orders`, `/seller/orders/:id/status`
- `GET/POST` `/seller/reviews`, reply
- `GET` `/seller/questions` (+ reply/delete endpoints when available)

## FE overlays / mocks

- Order commerce: timeline, internal notes, tracking, payment/shipping flags
- Customers, returns, refunds, shipping methods: session state until APIs exist
- Shared CSV: `downloadSellerCsv` in `seller-export.ts`

## Permissions

`orders.*` (incl. export/create), `customers.*`, `returns.*`, `refunds.*`, `shipping.*`, `reviews.*`, `questions.*`
