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

### پنل مدیریت (ادمین سایت)

Layout: `seller` — middleware `auth` + `admin` (فقط `role === 'admin'`)  
Shell اختصاصی بدون Navbar/Footer فروشگاه.

| Route | فایل | توضیح |
|-------|------|--------|
| `/seller` | `seller/index.vue` | داشبورد مدیریت |
| `/seller/products` | `seller/products/index.vue` | لیست محصولات |
| `/seller/products/new` | `seller/products/new.vue` | افزودن محصول |
| `/seller/products/:id` | `seller/products/[id].vue` | جزئیات / ویرایش محصول |
| `/seller/orders` | `seller/orders/index.vue` | سفارش‌ها |
| `/seller/orders/:id` | `seller/orders/[id].vue` | جزئیات سفارش |
| `/seller/questions` | `seller/questions/index.vue` | پرسش و پاسخ |
| `/seller/reviews` | `seller/reviews.vue` | نظرات |
| `/seller/finance` | `seller/finance.vue` | مالی / تسویه |
| `/seller/categories` | `seller/categories/index.vue` | دسته‌بندی‌ها |
| `/seller/categories/new` | `seller/categories/new.vue` | افزودن دسته |
| `/seller/categories/:id` | `seller/categories/[id].vue` | ویرایش دسته |
| `/seller/banners` | `seller/banners/index.vue` | بنرها |
| `/seller/banners/new` | `seller/banners/new.vue` | افزودن بنر |
| `/seller/banners/:id` | `seller/banners/[id].vue` | ویرایش بنر |
| `/seller/blog` | `seller/blog/index.vue` | مدیریت وبلاگ |
| `/seller/blog/new` | `seller/blog/new.vue` | افزودن مطلب |
| `/seller/blog/:id` | `seller/blog/[id].vue` | ویرایش مطلب |
| `/seller/about` | `seller/about.vue` | صفحه درباره ما |
| `/seller/deals` | `seller/deals/index.vue` | شگفت‌انگیزها |
| `/seller/deals/new` | `seller/deals/new.vue` | افزودن شگفت‌انگیز |
| `/seller/deals/:id` | `seller/deals/[id].vue` | ویرایش شگفت‌انگیز |
| `/seller/promotions` | `seller/promotions/index.vue` | تخفیف و پروموشن |
| `/seller/promotions/codes/new` | `seller/promotions/codes/new.vue` | کد تخفیف جدید |
| `/seller/promotions/codes/:id` | `seller/promotions/codes/[id].vue` | ویرایش کد |
| `/seller/promotions/promos/new` | `seller/promotions/promos/new.vue` | پرومو جدید |
| `/seller/promotions/promos/:id` | `seller/promotions/promos/[id].vue` | ویرایش پرومو |
| `/seller/notifications` | `seller/notifications/index.vue` | اعلان‌ها |
| `/seller/notifications/new` | `seller/notifications/new.vue` | ارسال اعلان |
| `/seller/footer` | `seller/footer.vue` | فوتر |
| `/seller/shop` | `seller/shop.vue` | تنظیمات سایت |
| `/seller/admins` | `seller/admins/index.vue` | کاربران ادمین |
| `/seller/admins/new` | `seller/admins/new.vue` | افزودن ادمین |
| `/seller/admins/:id` | `seller/admins/[id].vue` | جزئیات / ویرایش ادمین |
| `/seller/roles` | `seller/roles/index.vue` | نقش‌ها |
| `/seller/roles/new` | `seller/roles/new.vue` | نقش جدید |
| `/seller/roles/:id` | `seller/roles/[id].vue` | ویرایش نقش |
| `/seller/audit` | `seller/audit.vue` | لاگ حسابرسی |
| `/seller/account` | `seller/account.vue` | حساب ادمین جاری |
| `/seller/forbidden` | `seller/forbidden.vue` | عدم دسترسی (403) |

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
| `POST` | `/auth/check` | — | فروشگاه: `{ hasPassword, isAdmin? }` |
| `POST` | `/auth/login` | — | ورود مشتری با رمز |
| `POST` | `/auth/password/reset` | — | بازیابی رمز مشتری |
| `POST` | `/auth/admin/check` | — | پنل ادمین: `{ isAdmin, hasPassword }` |
| `POST` | `/auth/admin/login` | — | ورود مدیر (فقط Origin=`ADMIN_URL`) |
| `GET` | `/auth/me` | ✅ | کاربر جاری (+ `role`) |
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
| `GET` | `/recommendations` | اختیاری | پیشنهاد شخصی — query: `categories`, `exclude`, `limit`؛ با auth از فعالیت+سبد+علاقه‌مندی |
| `POST` | `/activity` | ✅ | ثبت رویدادها — body: `{ events: [{ type, productId?, category?, query?, at? }] }` |
| `POST` | `/activity/sync` | ✅ | همگام‌سازی رویدادهای لوکال بعد از لاگین |
| `GET` | `/locations` | — | موقعیت‌ها / شهرها |
| `GET` | `/compare/templates/:category` | — | قالب مقایسه بر اساس دسته |
| `GET` | `/footer` | — | لینک‌ها و داده فوتر |
| `GET` | `/site` | — | هویت سایت (نام، تماس، درباره) |
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

### پنل مدیریت — `/api/v1/seller` (Auth + Admin)

| Method | Path | توضیح |
|--------|------|--------|
| `GET` | `/seller/shop` | تنظیمات سایت |
| `PUT` | `/seller/shop` | به‌روزرسانی تنظیمات سایت |
| `GET` | `/seller/footer` | محتوای فوتر |
| `PUT` | `/seller/footer` | به‌روزرسانی فوتر |
| `GET` | `/seller/listings` | لیست محصولات پنل |
| `POST` | `/seller/listings` | افزودن محصول |
| `PATCH` | `/seller/listings/:productId` | تغییر وضعیت محصول |
| `GET` | `/seller/orders` | سفارش‌ها |
| `GET` | `/seller/orders/:id` | جزئیات سفارش |
| `PATCH` | `/seller/orders/:id/status` | تغییر وضعیت سفارش |
| `GET` | `/seller/reviews` | نظرات |
| `POST` | `/seller/reviews/:id/reply` | پاسخ به نظر |
| `GET` | `/seller/questions` | پرسش‌های محصولات |
| `POST` | `/seller/questions/:id/reply` | پاسخ به پرسش |
| `DELETE` | `/seller/questions/:id/answer` | حذف پاسخ |
| `PATCH` | `/seller/questions/:id/verified` | تأیید خریدار |
| `DELETE` | `/seller/questions/:id` | حذف پرسش |
| `GET` | `/seller/payouts` | پرداخت‌ها / تسویه |
| `POST` | `/seller/payouts` | درخواست تسویه |
| `GET` | `/seller/sales` | فروش‌ها |
| `GET\|POST` | `/seller/categories` | دسته‌بندی‌ها |
| `GET\|PUT\|DELETE` | `/seller/categories/:id` | جزئیات / ویرایش / حذف دسته |
| `GET\|POST` | `/seller/deals` | شگفت‌انگیزها |
| `GET\|PUT\|DELETE` | `/seller/deals/:id` | جزئیات / ویرایش / حذف شگفت‌انگیز |
| `PATCH` | `/seller/deals/:id/active` | فعال/غیرفعال شگفت‌انگیز |
| `GET\|POST` | `/seller/discount-codes` | کدهای تخفیف |
| `GET\|PUT\|DELETE` | `/seller/discount-codes/:code` | جزئیات / ویرایش / حذف کد |
| `PATCH` | `/seller/discount-codes/:code/active` | فعال/غیرفعال کد |
| `GET\|POST` | `/seller/content-promos` | پروموهای محتوایی |
| `GET\|PUT\|DELETE` | `/seller/content-promos/:id` | جزئیات / ویرایش / حذف پرومو |
| `PATCH` | `/seller/content-promos/:id/active` | فعال/غیرفعال پرومو |

ادمین: حساب `role=admin` دستی ساخته می‌شود (سید خودکار نمی‌سازد).

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
