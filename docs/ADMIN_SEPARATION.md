# جداسازی فروشگاه و پنل ادمین

دو خروجی جدا از یک ریپوی فرانت:

| خروجی | دامنه نمونه | دستور | کوکی |
|--------|-------------|--------|------|
| فروشگاه | `https://digishop.ir` | `npm run build:store` / `npm run generate:store` | `token` |
| پنل ادمین | `https://admin.digishop.ir` | `npm run build:admin` / `npm run generate:admin` | `admin_token` |

## لوکال

```bash
# ترمینال ۱ — فروشگاه :4000
npm run dev:store

# ترمینال ۲ — ادمین :4001
npm run dev:admin
```

فایل‌های env: `.env.store` و `.env.admin`

هر کدام `buildDir` جدا دارند (`.nuxt` / `.nuxt-admin`) تا همزمان اجرا تداخل نسازند. بعد از عوض کردن حالت، یک‌بار ری‌استارت کن.

## بک‌اند

در `.env` / docker:

```env
FRONTEND_URL=http://localhost:4000
ADMIN_URL=http://localhost:4001
```

- ورود مشتری: `/auth/check|login|otp/*` — حساب `admin` رد می‌شود؛ از دامنه ادمین هم رد می‌شود.
- ورود مدیر: `/auth/admin/check` و `/auth/admin/login` — فقط `role=admin` + فقط Origin برابر `ADMIN_URL`.

در پروداکشن `ADMIN_URL` را حتماً روی دامنه پنل بگذارید.

## ادمین

- حساب **admin** به‌صورت خودکار در سید ساخته نمی‌شود.
- یک کاربر با `role=admin` را دستی در دیتابیس (یا اسکریپت داخلی) بسازید، سپس از دامنه پنل (`ADMIN_URL`) وارد شوید.
- شماره تماس سایت در پنل `/seller/shop` همان شماره ورود ادمین می‌شود.
