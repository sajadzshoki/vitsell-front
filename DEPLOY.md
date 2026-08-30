# Digishop — راهنمای دیپلوی (Frontend + Backend)

این سند برای استقرار **production** نوشته شده است.  
ریپوها:

| بخش | مسیر | استک |
|-----|------|------|
| Backend API | `digishop-back` | AdonisJS 7 + Lucid + PostgreSQL |
| Frontend | `digishop` | Nuxt 4 (SPA, `ssr: false`) + Nuxt UI 4 |

API prefix: `/api/v1`

---

## پیش‌نیازها

- Node.js **20+** (لوکال build؛ در Docker فعلی Node 24 هم تست شده)
- PostgreSQL **16**
- دامنه/HTTPS برای فرانت و API (توصیه: reverse proxy مثل Nginx / Caddy / Cloudflare)
- کلیدهای واقعی:
  - `KAVENEGAR_API_KEY` (OTP)
  - `ZARINPAL_MERCHANT_ID` (پرداخت)
- یک `APP_KEY` امن برای Adonis (۳۲ بایت base64)

تولید `APP_KEY` (روی ماشین build):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## معماری پیشنهادی Production

```text
Browser
  → https://shop.example.com          (Nuxt static/Node)
  → https://api.example.com/api/v1/*  (Adonis)
       → PostgreSQL
       → Kavenegar / Zarinpal
```

- فرانت فقط از `NUXT_PUBLIC_API_BASE` به API وصل می‌شود.
- CORS / `FRONTEND_URL` باید دامنه واقعی فرانت باشد.
- Callback زرین‌پال باید به URL عمومی API برسد (نه localhost).

---

## ۱) Backend (`digishop-back`)

### ۱.۱ متغیرهای محیطی Production

فایل `.env` روی سرور (هرگز `ALLOW_*_MOCK=true` در production):

```env
TZ=UTC
PORT=3333
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info

APP_KEY=<generated-secret>
APP_URL=https://api.example.com
FRONTEND_URL=https://shop.example.com

SESSION_DRIVER=cookie

DB_HOST=<postgres-host>
DB_PORT=5432
DB_USER=digishop
DB_PASSWORD=<strong-password>
DB_DATABASE=digishop

# OTP — اجباری در production
KAVENEGAR_API_KEY=<real-key>
KAVENEGAR_OTP_TEMPLATE=digishop-verify
ALLOW_OTP_MOCK=false

# Payment — اجباری در production
ZARINPAL_MERCHANT_ID=<real-merchant-id>
ZARINPAL_SANDBOX=false
ZARINPAL_CALLBACK_URL=https://api.example.com/api/v1/payments/zarinpal/callback
ALLOW_PAYMENT_MOCK=false
```

**Fail-closed:** اگر در production کلیدها خالی باشند و mock خاموش باشد، OTP با `503` و پرداخت با خطا fail می‌شود (عمدی).

### ۱.۲ دیپلوی بدون Docker (پیشنهادی برای VPS)

```bash
cd digishop-back
cp .env.example .env   # سپس مقادیر production را تنظیم کنید
npm ci

# مایگریشن + seed (فقط اولین بار / وقتی لازم است)
node ace migration:run
node ace db:seed

# build
npm run build

# اجرا از خروجی build
cd build
npm ci --omit=dev
node bin/server.js
```

با PM2:

```bash
pm2 start build/bin/server.js --name digishop-api
pm2 save
```

Health check سریع:

```bash
curl -s https://api.example.com/
# {"name":"digishop-api","version":"1"}
```

### ۱.۳ دیپلوی با Docker Compose

`docker-compose.yml` فعلی بیشتر برای **dev** است (`ace serve --hmr` + volume mount). برای production:

1. `NODE_ENV=production` و URLهای واقعی را در `environment` / `.env` بگذارید.
2. `ALLOW_OTP_MOCK=false` و `ALLOW_PAYMENT_MOCK=false`.
3. volumeهای hot-reload را بردارید.
4. به‌جای `node ace serve --hmr` از build خروجی استفاده کنید، مثلاً:

```dockerfile
# ایدهٔ entrypoint production
node ace migration:run
# node ace db:seed   # فقط در اولین استقرار یا با فلگ جدا
node bin/server.js   # از داخل پوشه build، یا بعد از copy artifact
```

لوکال با Compose فعلی (dev):

```bash
cd digishop-back
docker compose up -d --build
# Postgres روی host: 5433 → container: 5432
# API: http://localhost:3333
```

> روی Windows اگر پورت `5432` اشغال است، mapping فعلی `5433:5432` درست است.  
> از داخل کانتینر API همیشه `DB_HOST=postgres` و `DB_PORT=5432`.

### ۱.۴ دستورات مهم Backend

| کار | دستور |
|-----|--------|
| Dev server | `npm run dev` → `node ace serve --hmr` |
| Migration | `node ace migration:run` |
| Seed | `node ace db:seed` |
| Test | `npm test` → `node ace test` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Prod start | `cd build && npm ci --omit=dev && node bin/server.js` |
| Verify fail-closed | `node --import=@poppinss/ts-exec bin/verify_prod_fail_closed.ts` (با env production) |

### ۱.۵ Seller seed (بعد از seed)

فروشنده نمونه:

- Phone: `09121234567`
- Role: `seller`
- Shop: فروشگاه آریا

در production با OTP واقعی لاگین می‌شود (بدون `devCode`).

---

## ۲) Frontend (`digishop`)

### ۲.۱ متغیر محیطی

فقط این برای اتصال به API لازم است:

```env
NUXT_PUBLIC_API_BASE=https://api.example.com/api/v1
```

در `nuxt.config.ts`:

```ts
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3333/api/v1',
  },
}
```

`app/composables/fetch.ts` از `getApiBase()` همین مقدار را می‌خواند.

### ۲.۲ Build و اجرا

چون `ssr: false` است، خروجی عمدتاً SPA است.

```bash
cd digishop
npm ci
NUXT_PUBLIC_API_BASE=https://api.example.com/api/v1 npm run build
```

پیش‌نمایش لوکال:

```bash
NUXT_PUBLIC_API_BASE=https://api.example.com/api/v1 npm run preview
```

اجرای production با Node (Nitro):

```bash
node .output/server/index.mjs
```

یا سرو کردن `.output/public` پشت Nginx (برای SPA خالص هم قابل استفاده است؛ با Nitro preset فعلی `node-server` پیشنهاد همان `node .output/server/index.mjs` است).

Dev:

```bash
npm run dev
# پیش‌فرض پورت 4000 در nuxt.config
```

### ۲.۳ نکات فرانت

- توکن کاربر در cookie به نام `token` ذخیره می‌شود و به‌صورت Bearer به API می‌رود.
- صفحه `/notifications` middleware `auth` دارد.
- در production هرگز `apiBase` را روی `localhost` نگذارید.

---

## ۳) Nginx (نمونه)

```nginx
# API
server {
  listen 443 ssl http2;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Frontend
server {
  listen 443 ssl http2;
  server_name shop.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;  # یا static root به .output/public
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## ۴) چک‌لیست Go-Live

- [ ] `NODE_ENV=production`
- [ ] `ALLOW_OTP_MOCK=false` و `ALLOW_PAYMENT_MOCK=false`
- [ ] `KAVENEGAR_API_KEY` و `ZARINPAL_MERCHANT_ID` ست شده
- [ ] `ZARINPAL_SANDBOX=false` برای پرداخت واقعی
- [ ] `ZARINPAL_CALLBACK_URL` عمومی و قابل دسترس از اینترنت
- [ ] `APP_URL` / `FRONTEND_URL` دامنه‌های نهایی
- [ ] `NUXT_PUBLIC_API_BASE` = `https://api…/api/v1`
- [ ] Migration روی DB production اجرا شده
- [ ] Seed فقط در صورت نیاز (مراقب overwrite داده واقعی باشید)
- [ ] OTP واقعی تست شده (بدون `devCode` در response)
- [ ] یک سفارش COD یا online تست شده
- [ ] Seller panel با نقش `seller` باز می‌شود
- [ ] HTTPS و CORS درست کار می‌کند

---

## ۵) عیب‌یابی سریع

| علامت | علت محتمل |
|------|-----------|
| OTP → `503` | کلید کاوه‌نگار نیست یا `ALLOW_OTP_MOCK=false` |
| پرداخت آنلاین fail | `ZARINPAL_MERCHANT_ID` نیست / mock خاموش |
| فرانت داده نمی‌گیرد | `NUXT_PUBLIC_API_BASE` اشتباه یا CORS/`FRONTEND_URL` |
| Seller → `403` | نقش کاربر `customer` است یا shop ندارد |
| DB connection refused از host | پورت `5433` (Docker map)؛ از داخل compose پورت `5432` |

---

## ۶) ترتیب پیشنهادی استقرار

1. Postgres را بالا بیاورید و backup/restore کنید.
2. Backend را با env production بیلد و اجرا کنید → migration.
3. Callback زرین‌پال و OTP را smoke-test کنید.
4. Frontend را با `NUXT_PUBLIC_API_BASE` بیلد و پشت دامنه shop قرار دهید.
5. یک مسیر کامل Buyer + Seller را روی staging/production چک کنید.
