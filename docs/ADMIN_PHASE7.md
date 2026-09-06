# Admin Phase 7 — Finance, Payments, Transactions & Settlements

Single-vendor financial administration for digishop seller + storefront integration points.

## Mapping

| Area | Path / module |
|---|---|
| Dashboard | `/seller/finance` → `TheSellerFinance` |
| Transactions | `/seller/finance/transactions` |
| Payments | `/seller/finance/payments` |
| Settlements | `/seller/finance/settlements` (gateway/bank — not marketplace payouts) |
| Reconciliation | `/seller/finance/reconciliation` |
| Adjustments | `/seller/finance/adjustments` |
| Reports | `/seller/finance/reports` |
| Gateways | `/seller/finance/gateways` (safe UI, no secrets) |
| Refunds | `/seller/refunds` (Phase 3 — linked from finance) |

## Architecture

- **Ledger is derived**: payments (from orders + `payments` table) + refunds + settlements + adjustments → `SellerFinanceTransaction` projection.
- **API**: `GET /seller/transactions`, `GET /seller/payments`, `GET|POST /seller/settlements`, `GET /seller/reconciliation` (+ resolve), `GET|POST /seller/adjustments`, `GET /seller/reports` — server projections; reconciled IDs / adjustments persist in `content_blocks`.
- **Settlements** map from existing `GET/POST /seller/payouts` + FE enrichment (fees, gateway, reference, statuses).
- Marketplace wallet / «درخواست تسویه» UX removed from dashboard.

## Permissions

`finance.*`, `transactions.view|export`, `payments.view|manage`, `settlements.view|manage`, `finance_reports.view|export`, `financial_adjustments.create`, `financial_reconciliation.view|manage`, plus existing `refunds.*`.

`FINANCE_MANAGER` includes the full finance set + refunds + orders.view.

## Audit

Entities: `payment`, `refund`, `settlement`, `adjustment`, `finance` via `useSellerAudit.appendLog`.

## Backend gaps

- Payments via `GET /seller/payments` (projection from orders + `payments` table).
- Settlements via `GET|POST /seller/settlements` + `PATCH .../status` (enriched `seller_payouts`).
- Reconciliation via `GET /seller/reconciliation` + `POST .../resolve` (rules on server; resolved IDs in `content_blocks`).
- Transactions ledger via `GET /seller/transactions` (read-only projection).
- `SellerPayout` stores fees/gateway/source/reference/note/`settlement_status`.
- Gateway secrets stay server env (`ZARINPAL_*`); finance gateways sync status from `GET /seller/system` integrations.
- Adjustments via `GET|POST /seller/adjustments` (append-only list in `content_blocks`).
- Reports via `GET /seller/reports` (`period` `start` `end`) — server KPIs + sales/payment trend.
- True gateway settlement feeds not available — reconciliation uses local rules only.
