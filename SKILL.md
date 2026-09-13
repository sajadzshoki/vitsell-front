---
name: nuxt-ui
description: Builds Vue/Nuxt UI with Nuxt UI components, semantic theme tokens, i18n, RTL, and app.config.ts defaults. Use when creating or editing pages, layouts, Vue components, styles, or any UI in this project. Also covers digi-clone as the UX/feature reference for vitsell.
---

# Nuxt UI — vitsell

قبل از نوشتن یا تغییر UI این فایل را رعایت کن.

## نقش digi-clone

مسیر مرجع: `C:\Users\Sajad-Vista\WebstormProjects\digi-clone`

- digi-clone رفرنس دقیق **صفحات، فیچرها، جریان UX، چیدمان و سلسله‌مراتب بصری** است.
- vitsell همان محصول را می‌سازد، ولی باید **تمیزتر، مرتب‌تر، بهینه‌تر، کامپوننت‌بندی‌شده‌تر و کاملاً داینامیک** باشد تا به پروژه واقعی تبدیل شود.
- کپی کور Tailwind کلاس‌های digi-clone (مثل `bg-white`, `text-slate-*`, `bg-rose-*`) ممنوع است؛ معادل semantic Nuxt UI را بزن.
- برند digi-clone قرمز/rose است؛ برند vitsell **teal** است. هر جایی که در digi-clone accent قرمز دیده می‌شود، در vitsell از `primary` (teal) استفاده کن. تخفیف/خطا همچنان `error` بماند.

### نقشه صفحات و فیچر (از digi-clone)

| صفحه / فیچر | مرجع digi-clone | هدف vitsell |
|---|---|---|
| خانه | `src/pages/Home.tsx` | هیرو، دسته‌ها، پیشنهاد روز، پرفروش، جدید — همه از داده داینامیک |
| جزئیات محصول | `src/pages/ProductDetail.tsx` | گالری، رنگ، مشخصات، قیمت، افزودن به سبد |
| دسته‌بندی | `src/pages/Category.tsx` + `FilterSidebar` | فیلتر + گرید محصول؛ موبایل drawer |
| جستجو | `src/pages/Search.tsx` | نتیجه بر اساس query |
| سبد | `src/pages/Cart.tsx` | آیتم، تعداد، جمع |
| تسویه | `src/pages/Checkout.tsx` | آدرس، پرداخت، خلاصه |
| حساب | `src/pages/Account.tsx` | پروفایل / سفارش‌ها |
| علاقه‌مندی | `src/pages/Wishlist.tsx` | لیست علاقه‌مندی |
| جزئیات سفارش | `src/pages/OrderDetail.tsx` | وضعیت و اقلام سفارش |
| هدر / فوتر | `Header.tsx` / `Footer.tsx` | ناوبری، جستجو، سبد، تم |

کامپوننت‌های دامنه مرجع: `ProductCard`, `ProductGrid`, `HeroCarousel`, `FilterSidebar`.

## کیفیت vitsell (اجباری)

- داده و منطق را از UI جدا کن (`data/`, composable، store). کارت/صفحه mock سخت‌کد نگیرد مگر برای placeholder موقت.
- کامپوننت‌های دامنه زیر `The*`؛ کنترل‌های عمومی = Nuxt UI.
- Props تایپ‌شده؛ بدون hardcoded id/قیمت/عنوان در template وقتی `product` (یا معادل) موجود است.
- تکرار استایل در `app.config.ts` یا utility CSS تم؛ نه کپی class در چند فایل.
- عملکرد: lazy image، لیست‌های سبک، بدون JS اضافی برای استایل ساده.
- قبل از پیاده‌سازی هر صفحه جدید، فایل متناظر digi-clone را بخوان و ساختار را با استاندارد این skill بازطراحی کن.

## قوانین اصلی

- تا جای ممکن از کامپوننت‌های خود Nuxt UI استفاده کن.
- اگر چیزی همه‌جا اعمال می‌شود برای Nuxt UI components در `app/app.config.ts` بگذار.
- هیچ رنگ استاتیکی نده؛ همه از رنگ‌های تعریف‌شده پروژه تا لایت/دارک و تعویض تم یکدست بماند.
- پروژه چندزبانه است؛ هر متن نمایشی از i18n (`$t` / `t`) استفاده کند.

## تم و رنگ (teal)

منبع حقیقت:

| نقش | فایل | مقدار فعلی vitsell |
|---|---|---|
| alias رنگ‌ها | `app/app.config.ts` → `ui.colors` | `primary: teal`, `secondary: cyan`, `success: green`, `info: sky`, `warning: amber`, `error: rose`, `neutral: slate` |
| توکن light/dark | `app/assets/css/main.css` | `--ui-*` از `--ui-color-*` |

قوانین:

1. فقط از ۷ alias معنایی استفاده کن: `primary` | `secondary` | `success` | `info` | `warning` | `error` | `neutral`.
2. پالت خام Tailwind (`teal-*`, `slate-*`, `rose-*`, `amber-*`, …) در Vue/CSS کامپوننت ممنوع است مگر داخل تعریف تم سراسری.
3. تغییر برند = فقط عوض کردن alias در `app.config.ts` (مثلاً `primary: 'teal'`)، نه جست‌وجوی hex در کامپوننت‌ها.
4. `neutral` روی `slate` بماند تا حس digi-clone حفظ شود بدون وابستگی به gray استاتیک.
5. تخفیف / badge تخریبی → `error`؛ ستاره/امتیاز → `warning`؛ CTA و لینک برند → `primary`.

ممنوع:

- `bg-white`, `text-black`, `text-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`, `bg-slate-*`, `text-rose-*`, …
- hex / rgb / hsl در template، style، یا class کامپوننت
- رنگ جدا برای `.dark` داخل کامپوننت صفحه

مجاز (semantic):

| هدف | کلاس |
|---|---|
| متن اصلی | `text-default` / `text-highlighted` / `text-toned` / `text-muted` / `text-dimmed` |
| متن روی رنگ پر | `text-inverted` |
| پس‌زمینه | `bg-default` / `bg-muted` / `bg-elevated` / `bg-accented` / `bg-inverted` |
| بوردر | `border-default` / `border-muted` / `border-accented` / `border-inverted` |
| برند / وضعیت | `text-primary`, `bg-primary`, `text-secondary`, `text-success`, `text-warning`, `text-error`, `text-info` |

روی کامپوننت‌های Nuxt UI از propهای `color` و `variant` استفاده کن (`primary`, `neutral`, `error`, …) نه کلاس رنگ خام.

معادل‌های رایج digi-clone → vitsell:

| digi-clone | vitsell |
|---|---|
| `bg-white` / `text-slate-900` | `bg-default` / `text-highlighted` |
| `text-slate-800` / `700` | `text-default` / `text-toned` |
| `text-slate-400` / `500` | `text-muted` / `text-dimmed` |
| `border-slate-100` | `border-default` / `border-muted` |
| `bg-slate-50` / `from-slate-50` | `bg-muted` / `bg-elevated` |
| `text-rose-600` / `bg-rose-500` (برند) | `text-primary` / `bg-primary` |
| `bg-rose-500` (تخفیف) | `bg-error` |
| `bg-amber-50 text-amber-600` | `bg-warning/10 text-warning` |
| `bg-slate-900 text-white` (badge) | `bg-inverted text-inverted` |

## کامپوننت‌ها

1. اول کامپوننت آماده Nuxt UI را بزن (`UButton`, `UCard`, `UInput`, `USelect`, `UCheckbox`, `UBadge`, `USeparator`, `UIcon`, `UModal`, …).
2. کامپوننت سفارشی فقط وقتی که معادل Nuxt UI وجود ندارد یا ترکیب چند کامپوننت لازم است.
3. آیکون‌ها: `UIcon` / `TheIcon` با مجموعه `i-tabler-*` (طبق `nuxt.config.ts`).
4. ظاهر تکراری یک کامپوننت را با `:ui` روی همان اینستنس override نکن اگر قرار است همه‌جا باشد؛ در `app/app.config.ts` زیر `ui.<component>` بگذار.
5. کامپوننت‌های `The*` فقط برای منطق دامنه (مثل کارت محصول). کنترل‌های عمومی را دوباره نساز.
6. `TheProductCard` باید propsداینامیک بگیرد (`product`, `compact`, …) و شبیه ساختار digi-clone باشد: تصویر مربعی، badge، تخفیف، اکشن علاقه‌مندی/سبد، برند، عنوان، امتیاز، قیمت.

## چندزبانه (i18n)

- هیچ متن نمایشی را در template/script سخت ننویس.
- از `$t(...)` در template و `t(...)` از `useI18n()` در script استفاده کن (label، placeholder، aria-label، title، empty state، دکمه‌ها).
- الگوی فعلی پروژه: کلید همان متن است، مثلاً `$t('افزودن به سبد')`.

## RTL

- پروژه `dir="rtl"` است. چیدمان را با فرض راست‌به‌چپ بزن.
- به‌جای `left` / `right` از logical: `start` / `end` (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `inset-s-*`, `inset-e-*`).
- در گرید دو ستونه، ستون فیلتر در دسکتاپ سمت راست (اول در DOM برای RTL) باشد.

## موبایل‌اول

- اول موبایل، بعد breakpointهای بزرگ‌تر.
- فیلتر/منوی جانبی در موبایل داخل `UDrawer` یا collapse؛ در `lg+` سایدبار ثابت.
- گرید محصول/کارت کاملاً ریسپانسیو (`grid-cols-2` → `md:grid-cols-3` → `xl:grid-cols-4` یا معادل).

## سایز و radius

- سایز کامپوننت‌های Nuxt UI را از prop `size` بگیر (`xs` تا `xl`)، نه padding/font ثابت پراکنده.
- گوشه را با `rounded-*` بی‌حساب نزن؛ از `--ui-radius` تم و کلاس‌های semantic گردی استفاده کن. اگر radius سراسری است، در `app.config.ts` یا `main.css` (`--ui-radius`) تنظیم شود.
- برای کارت محصول الگوی digi-clone (`rounded-2xl` تصویر `rounded-xl`) قابل قبول است اگر یکدست در همان کامپوننت بماند.

## تصویر خالی

- تصویر محصول/آواتار بدون سورس معتبر: `TheIcon` با `icon-type="img"` و `name="noImage.png"` (`public/images/noImage.png`).
- URL تصادفی یا placeholder خارجی نگذار مگر داده mock کنترل‌شده پروژه.

## چک قبل از اتمام

- [ ] معادل Nuxt UI استفاده شده، نه HTML خام برای دکمه/اینپوت/کارت/مودال
- [ ] `The*` فقط برای دامنه؛ کنترل عمومی دوباره ساخته نشده
- [ ] استایل سراسری در `app.config.ts` است، نه کپی‌شده در چند فایل
- [ ] هیچ رنگ استاتیک / gray-* / white / black / slate-* خام در UI جدید نیست
- [ ] برند/CTA با `primary` (teal) است؛ تخفیف با `error`
- [ ] در لایت و دارک خوانا می‌ماند بدون کلاس جدا برای دارک
- [ ] همه متن‌ها با `$t` / `t` هستند
- [ ] RTL با `start`/`end` رعایت شده
- [ ] موبایل‌اول: فیلتر/منو در موبایل drawer یا collapse
- [ ] سایز از prop Nuxt UI و radius از تم
- [ ] تصویر خالی با `TheIcon` و `noImage.png`
- [ ] داده داینامیک است؛ صفحه/کارت mock سخت‌کد ندارد
- [ ] رفتار/چیدمان با digi-clone هم‌خوان است ولی تمیزتر و کامپوننتی
