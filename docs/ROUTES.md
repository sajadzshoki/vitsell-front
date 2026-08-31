# مستند Routeهای Digishop

مرجع مسیرهای فرانت (Nuxt) و API بک‌اند (AdonisJS).  
Base API: `/api/v1` — پیش‌فرض پروداکشن: `https://digishop-back.vistatest.top/api/v1`

---

## ۱. صفحات فرانت‌اند (Nuxt file-based routing)

منبع: `app/pages/`  
Middleware احراز هویت: `app/middleware/auth.ts` → در صورت عدم لاگین، ریدایرکت به `/login?redirect=...`

### عمومی / فروشگاه

| Route | فایل | توضیح | Auth | Layout |
|-------|------|--------|------|--------|
| `/` | `index.vue` | صفحه خانه | — | default |
| `/search` | `search.vue` | نتایج جستجو | — | default |
| `/category` | `category/index.vue` | لیست دسته‌بندی‌ها | — | default |
| `/category/:catId` | `category/[catId].vue` | محصولات یک دسته + فیلتر | — | default |
| `/product/:id` | `product/[id].vue` | جزئیات محصول | — | default |
| `/compare` | `compare.vue` | مقایسه محصولات | — | default |
| `/cart` | `cart.vue` | سبد خرید + مراحل تسویه (checkout steps) | — | default |
| `/wishlist` | `wishlist.vue` | علاقه‌مندی‌ها | ✅ | default |
| `/notifications` | `notifications.vue` | اعلان‌ها | ✅ | default |
| `/order/:id` | `order/[id].vue` | جزئیات سفارش خریدار | ✅ | default |
| `/login` | `login.vue` | ورود با OTP | — | `auth` |

### حساب کاربری

Layout: `account` — همه با middleware `auth`

| Route | فایل | توضیح |
|-------|------|--------|
| `/account` | `account/index.vue` | پیشخوان حساب |
| `/account/profile` | `account/profile.vue` | پروفایل |
| `/account/orders` | `account/orders.vue` | لیست سفارش‌ها |
| `/account/addresses` | `account/addresses.vue` | آدرس‌ها |
| `/account/settings` | `account/settings.vue` | تنظیمات |

### پنل فروشنده

Layout: `seller` — همه با middleware `auth`

| Route | فایل | توضیح |
|-------|------|--------|
| `/seller` | `seller/index.vue` | داشبورد فروشنده |
| `/seller/shop` | `seller/shop.vue` | تنظیمات فروشگاه |
| `/seller/products` | `seller/products/index.vue` | لیست محصولات فروشگاه |
| `/seller/products/new` | `seller/products/new.vue` | افزودن محصول |
| `/seller/orders` | `seller/orders/index.vue` | سفارش‌های فروشنده |
| `/seller/orders/:id` | `seller/orders/[id].vue` | جزئیات سفارش فروشنده |
| `/seller/reviews` | `seller/reviews.vue` | نظرات |
| `/seller/finance` | `seller/finance.vue` | مالی / تسویه |

### محتوا و صفحات ثابت

| Route | فایل | توضیح |
|-------|------|--------|
| `/blog` | `blog/index.vue` | فهرست بلاگ |
| `/blog/:id` | `blog/[id].vue` | مطلب بلاگ |
| `/about` | `about.vue` | درباره ما |
| `/contact` | `contact.vue` | تماس با ما |
| `/faq` | `faq.vue` | سوالات متداول |
| `/careers` | `careers.vue` | فرصت‌های شغلی |
| `/terms` | `terms.vue` | قوانین و مقررات |
| `/privacy` | `privacy.vue` | حریم خصوصی |
| `/returns` | `returns.vue` | رویه بازگشت کالا |
| `/guide/order` | `guide/order.vue` | راهنمای ثبت سفارش |
| `/guide/payment` | `guide/payment.vue` | شیوه‌های پرداخت |
| `/guide/shipping` | `guide/shipping.vue` | رویه ارسال |

### نکات فرانت

- صفحه جداگانه `/checkout` وجود ندارد؛ تسویه داخل `/cart` با استپ‌ها انجام می‌شود.
- پارامترهای داینامیک: `:id`، `:catId` از نام فایل `[id].vue` / `[catId].vue`.
- Dev server فرانت: `http://localhost:4000` (طبق README).

---

## ۲. API بک‌اند (`/api/v1`)

منبع: `digishop-back/start/routes.ts`  
Auth: هدر `Authorization: Bearer <token>` (middleware `auth`)

### ریشه

| Method | Path | Auth | توضیح |
|--------|------|------|--------|
| `GET` | `/` | — | `{ name: digishop-api, version: 1 }` (خارج از prefix v1) |

### Auth — `/api/v1/auth`

| Method | Path | Auth | توضیح |
|--------|------|------|--------|
| `POST` | `/auth/otp/request` | — | درخواست OTP — body: `{ phone }` |
| `POST` | `/auth/otp/verify` | — | تأیید OTP — body: `{ phone, code }` → `{ token, profile }` |
| `POST` | `/auth/check` | — | بررسی شماره — body: `{ phone }` → `{ hasPassword }` |
| `POST` | `/auth/login` | — | ورود با رمز — body: `{ phone, password }` → `{ token, profile }` |
| `POST` | `/auth/password/reset` | — | بازیابی رمز — body: `{ phone, code, password, passwordConfirmation }` |
| `GET` | `/auth/me` | ✅ | کاربر جاری |
| `POST` | `/auth/logout` | ✅ | خروج |

### دسته‌بندی و محصول

| Method | Path | Auth | توضیح |
|--------|------|------|--------|
| `GET` | `/categories` | — | لیست دسته‌ها (`id`, `name`, `icon`, `image`, `text`, `subs`) |
| `GET` | `/categories/:id` | — | جزئیات دسته |
| `GET` | `/category-pages/:id` | — | متای صفحه دسته |
| `GET` | `/products` | — | لیست/جستجو/فیلتر محصولات |
| `GET` | `/products/:id` | — | جزئیات محصول |
| `GET` | `/products/:id/reviews` | — | نظرات محصول |
| `POST` | `/products/:id/reviews` | ✅ | ثبت نظر — body: `{ rating, text, pros?, cons?, recommend? }` |
| `GET` | `/products/:id/questions` | — | پرسش‌ها |
| `POST` | `/products/:id/questions` | ✅ | ثبت پرسش — body: `{ question }` |
| `POST` | `/upload` | ✅ | آپلود تصویر — multipart `file` → `{ url }` |

### محتوا (Content)

| Method | Path | Auth | توضیح |
|--------|------|------|--------|
| `GET` | `/uploads/:file` | — | سرو فایل آپلودشده (خارج از `/api/v1`) |
| `GET` | `/home` | — | داده صفحه خانه |
| `GET` | `/locations` | — | موقعیت‌ها / شهرها |
| `GET` | `/compare/templates/:category` | — | قالب مقایسه بر اساس دسته |
| `GET` | `/footer` | — | لینک‌ها و داده فوتر |
| `GET` | `/discount-codes` | — | کدهای تخفیف |
| `GET` | `/blog` | — | فهرست بلاگ |
| `GET` | `/blog/:id` | — | مطلب بلاگ |
| `GET` | `/static-pages/:id` | — | صفحات ثابت (about، faq، …) |

### سبد — `/api/v1/cart` (همه Auth)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/cart` | مشاهده سبد |
| `POST` | `/cart` | افزودن آیتم |
| `PATCH` | `/cart/:productId` | به‌روزرسانی تعداد |
| `DELETE` | `/cart/:productId` | حذف یک آیتم |
| `DELETE` | `/cart` | خالی کردن سبد |

### علاقه‌مندی — `/api/v1/wishlist` (همه Auth)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/wishlist` | لیست |
| `POST` | `/wishlist` | افزودن |
| `DELETE` | `/wishlist/:productId` | حذف |

### حساب — `/api/v1/account` (همه Auth)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/account/profile` | پروفایل |
| `PUT` | `/account/profile` | ویرایش پروفایل |
| `PUT` | `/account/password` | تنظیم / تغییر رمز عبور |
| `GET` | `/account/addresses` | آدرس‌ها |
| `POST` | `/account/addresses` | افزودن آدرس |
| `PUT` | `/account/addresses/:id` | ویرایش آدرس |
| `DELETE` | `/account/addresses/:id` | حذف آدرس |
| `GET` | `/account/orders` | سفارش‌ها |
| `GET` | `/account/orders/:id` | جزئیات سفارش |
| `GET` | `/account/reviews` | نظرات و پرسش‌های کاربر |
| `GET` | `/account/wallet` | کیف پول |
| `POST` | `/account/wallet/topup` | شارژ کیف پول → `{ paymentUrl }` |
| `POST` | `/account/wallet/withdraw` | درخواست برداشت |

### تسویه و پرداخت

| Method | Path | Auth | توضیح |
|--------|------|------|--------|
| `POST` | `/checkout/place` | ✅ | ثبت سفارش؛ برای `online` → `{ orderId, paymentUrl }` |
| `GET` | `/payments/zarinpal/callback` | — | کال‌بک زرین‌پال سفارش |
| `GET` | `/payments/zarinpal/wallet-callback` | — | کال‌بک شارژ کیف پول |

### اعلان‌ها — `/api/v1/notifications` (همه Auth)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/notifications` | لیست |
| `POST` | `/notifications/:id/read` | خوانده‌شدن یک مورد |
| `POST` | `/notifications/read-all` | خواندن همه |

### فروشنده — `/api/v1/seller` (همه Auth)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/seller/shop` | اطلاعات فروشگاه |
| `PUT` | `/seller/shop` | به‌روزرسانی فروشگاه |
| `GET` | `/seller/listings` | لیستینگ محصولات |
| `GET` | `/seller/orders` | سفارش‌ها |
| `GET` | `/seller/orders/:id` | جزئیات سفارش |
| `PATCH` | `/seller/orders/:id/status` | تغییر وضعیت سفارش |
| `GET` | `/seller/reviews` | نظرات |
| `POST` | `/seller/reviews/:id/reply` | پاسخ به نظر |
| `GET` | `/seller/payouts` | پرداخت‌ها / تسویه |
| `GET` | `/seller/sales` | فروش‌ها |

Seed فروشنده نمونه: شماره `09121234567` (طبق README بک‌اند).

---

## ۳. نگاشت صفحه ↔ API (خلاصه)

| صفحه فرانت | endpointهای اصلی |
|------------|------------------|
| `/` | `GET /home`, `GET /categories`, … |
| `/search`, `/category/:catId` | `GET /products`, `GET /categories/:id` |
| `/product/:id` | `GET /products/:id`, reviews, questions |
| `/compare` | `GET /compare/templates/:category`, `GET /products/:id` |
| `/cart` | `GET|POST|PATCH|DELETE /cart`, `POST /checkout/place` |
| `/wishlist` | `/wishlist/*` |
| `/account/*` | `/account/*` |
| `/order/:id` | `GET /account/orders/:id` |
| `/notifications` | `/notifications/*` |
| `/seller/*` | `/seller/*` |
| `/blog`, `/blog/:id` | `GET /blog`, `GET /blog/:id` |
| صفحات ثابت / راهنما | `GET /static-pages/:id` |
| `/login` | `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/login` |

---

## ۴. فایل‌های مرجع

| موضوع | مسیر |
|--------|------|
| تعریف routeهای API | `digishop-back/start/routes.ts` |
| صفحات Nuxt | `digishop-front/app/pages/` |
| middleware لاگین | `digishop-front/app/middleware/auth.ts` |
| base URL فرانت | `digishop-front/app/composables/fetch.ts` |
