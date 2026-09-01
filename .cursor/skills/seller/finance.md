---
name: seller-finance
description: Financial administration for the digishop seller (admin) panel — single-vendor, not marketplace.
---

# Seller — Finance (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE7.md](../../../docs/ADMIN_PHASE7.md).

## قوانین اجباری

- تک‌فروشنده: تسویه = درگاه/بانک، **نه** payout فروشنده مارکت‌پلیس.
- لجر تراکنش‌ها **derived** است — منبع حقیقت جدا نساز.
- بازپرداخت‌ها در `/seller/refunds` بمانند؛ مالی فقط لینک/نمایش.
- کلید درگاه در فرانت ذخیره نشود.
- عملیات ساختگی پول (retry پرداخت، تکمیل جعلی refund) ممنوع.

## ماژول‌ها

| مسیر | کامپوننت |
|---|---|
| `/seller/finance` | `TheSellerFinance` |
| `.../transactions` | `TheSellerFinanceTransactions` |
| `.../payments` | `TheSellerFinancePayments` |
| `.../settlements` | `TheSellerFinanceSettlements` |
| `.../reconciliation` | `TheSellerFinanceReconciliation` |
| `.../adjustments` | `TheSellerFinanceAdjustments` |
| `.../reports` | `TheSellerFinanceReports` |
| `.../gateways` | `TheSellerFinanceGateways` |

Composable: `useSellerFinance` · داده: `app/data/seller-finance*.ts`
