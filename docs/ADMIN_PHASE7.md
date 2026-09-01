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

- **Ledger is derived**: payments (from orders + commerce) + refunds + settlements + adjustments → `SellerFinanceTransaction` projection.
- **Settlements** map from existing `GET/POST /seller/payouts` + FE enrichment (fees, gateway, reference, statuses).
- Marketplace wallet / «درخواست تسویه» UX removed from dashboard.

## Permissions

`finance.*`, `transactions.view|export`, `payments.view|manage`, `settlements.view|manage`, `finance_reports.view|export`, `financial_adjustments.create`, `financial_reconciliation.view|manage`, plus existing `refunds.*`.

`FINANCE_MANAGER` includes the full finance set + refunds + orders.view.

## Audit

Entities: `payment`, `refund`, `settlement`, `adjustment`, `finance` via `useSellerAudit.appendLog`.

## Backend gaps

- No seller payment/transaction CRUD APIs; payments projected from orders.
- `SellerPayoutSchema` lacks fees/gateway/reconciled.
- Gateway secrets stay server env (`ZARINPAL_*`).
- Audit/reconciliation persistence is FE session until API ready.
- True gateway settlement feeds not available — reconciliation uses local rules only.
