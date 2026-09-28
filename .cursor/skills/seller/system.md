---
name: seller-system
description: Super admin system settings, RBAC, search, import/export for vitsell seller panel.
---

# Seller — System / Super Admin (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE8.md](../../../docs/ADMIN_PHASE8.md).

## قوانین

- ادمین ≠ مشتری فروشگاه.
- RBAC فقط از `useSellerPermissions().can` — نه hardcode نام نقش.
- تنظیمات پلتفرم در `/seller/settings`؛ SEO/فوتر/درگاه را دوباره نساز.
- کلید/سکرت درگاه در فرانت ذخیره نشود.
- Activity و Audit یک منبع (`useSellerAudit`).
- Import مخرب جعلی نزن؛ validate + confirm + audit.

## مسیرها

| مسیر | توضیح |
|---|---|
| `/seller/system` | نمای سیستم |
| `/seller/settings` | هاب تنظیمات |
| `/seller/navigation` | منوی عمومی |
| `/seller/top-strip` | نوار بالای هدر (روشن/خاموش + متن و لینک) |
| `/seller/products` و … | ورود/خروج CSV داخل همان صفحات (مراکز جدا حذف شدند) |
| Ctrl+K | جستجوی سراسری با RBAC |
