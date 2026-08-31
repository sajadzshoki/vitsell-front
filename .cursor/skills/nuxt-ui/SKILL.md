---
name: nuxt-ui
description: Builds Vue/Nuxt UI with Nuxt UI components, semantic theme tokens, i18n, RTL, and app.config.ts defaults. Use when creating or editing pages, layouts, Vue components, styles, or any UI in this project.
---

# Nuxt UI — digishop

قبل از نوشتن یا تغییر UI این فایل را رعایت کن.

## نسخه Nuxt UI (اجباری)

- این پروژه **Nuxt UI v4** دارد — نسخهٔ دقیق را از `package.json` → `@nuxt/ui` بخوان (سری 4.x؛ مثلاً 4.10 / 4.11).
- مستندات و API را فقط از **https://ui.nuxt.com** (آخرین v4) بگیر.
- **هرگز** از docs / playground نسخه ۳ استفاده نکن (`ui3.nuxt.com`، «Nuxt UI v3»، لینک‌های قدیمی GitHub `v3`).
- قبل از کپی نمونه از وب، نسخهٔ صفحه را چک کن؛ اگر v3 بود، معادل v4 را در ui.nuxt.com پیدا کن.
- در RTL برای `UCarousel`: آیکون prev/next را صریح بگذار تا با موقعیت فیزیکی دکمه هم‌جهت باشد (`prev` در `start` → chevron رو به start؛ `next` در `end` → chevron رو به end). به auto-swap پیش‌فرض v4 تکیه نکن اگر `Html dir="rtl"` با `useLocale().dir` هم‌خوان نیست.

## کیفیت digishop (اجباری)

- داده و منطق را از UI جدا کن (`data/`، composable، store). کارت/صفحه mock سخت‌کد نگیرد مگر برای placeholder موقت.
- کامپوننت‌های دامنه زیر `The*`؛ کنترل‌های عمومی = Nuxt UI.
- Props تایپ‌شده؛ بدون hardcoded id/قیمت/عنوان در template وقتی `product` (یا معادل) موجود است.
- تکرار استایل در `app.config.ts` یا utility CSS تم؛ نه کپی class در چند فایل.
- عملکرد: lazy image، لیست‌های سبک، بدون JS اضافی برای استایل ساده.

## قوانین اصلی

- تا جای ممکن از کامپوننت‌های خود Nuxt UI استفاده کن.
- اگر چیزی همه‌جا اعمال می‌شود برای Nuxt UI components در `app/app.config.ts` بگذار.
- هیچ رنگ استاتیکی نده؛ همه از رنگ‌های تعریف‌شده پروژه تا لایت/دارک و تعویض تم یکدست بماند.
- پروژه چندزبانه است؛ هر متن نمایشی از i18n (`$t` / `t`) استفاده کند.

## تم و رنگ (brand / #2563EB)

منبع حقیقت:

| نقش | فایل | مقدار فعلی digishop |
|---|---|---|
| پالت برند | `app/assets/css/main.css` → `@theme` `--color-brand-*` | `brand-500` = `#2563EB` |
| alias رنگ‌ها | `app/app.config.ts` → `ui.colors` | `primary: 'brand'`, `secondary: cyan`, `success: green`, `info: sky`, `warning: amber`, `error: rose`, `neutral: gray` |
| توکن light/dark | `app/assets/css/main.css` | `--ui-*` از `--ui-color-*`؛ در دارک `primary` همان `500` می‌ماند؛ bg خنثی gray نه slate |

قوانین:

1. فقط از ۷ alias معنایی استفاده کن: `primary` | `secondary` | `success` | `info` | `warning` | `error` | `neutral`.
2. پالت خام Tailwind / hex در Vue/CSS کامپوننت ممنوع است مگر داخل تعریف تم سراسری (`@theme`).
3. `ui.colors.primary` باید **نام پالت** باشد (`'brand'`)، نه hex. تغییر برند = آپدیت `--color-brand-*` و/یا alias در `app.config.ts`.
4. `neutral` = `gray` (خنثی، بدون ته‌آبی slate). دارک: سطوح از gray-950/900/800.
5. در دارک‌مود `--ui-primary` را به shade روشن‌تر عوض نکن؛ همان `#2563EB` / `500` بماند.
6. تخفیف / badge تخریبی → `error`؛ ستاره/امتیاز → `warning`؛ CTA و لینک برند → `primary`.

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

## کامپوننت‌ها

1. اول کامپوننت آماده Nuxt UI را بزن (`UButton`, `UCard`, `UInput`, `USelect`, `UCheckbox`, `UBadge`, `USeparator`, `UIcon`, `UModal`, …).
2. کامپوننت سفارشی فقط وقتی که معادل Nuxt UI وجود ندارد یا ترکیب چند کامپوننت لازم است.
3. آیکون‌ها: `UIcon` / `TheIcon` با مجموعه `i-tabler-*` (طبق `nuxt.config.ts`).
4. ظاهر تکراری یک کامپوننت را با `:ui` روی همان اینستنس override نکن اگر قرار است همه‌جا باشد؛ در `app/app.config.ts` زیر `ui.<component>` بگذار.
5. کامپوننت‌های `The*` فقط برای منطق دامنه (مثل کارت محصول). کنترل‌های عمومی را دوباره نساز.
6. `TheProductCard` باید propsداینامیک بگیرد (`product`, `compact`, …): تصویر مربعی، badge، تخفیف، اکشن علاقه‌مندی/سبد، برند، عنوان، امتیاز، قیمت.

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

## UnoCSS variant group (اجباری)

پروژه `transformerVariantGroup` دارد. وقتی چند کلاس یک variant/breakpoint مشترک دارند، آن‌ها را گروه کن — تکرار پیشوند ممنوع.

| ممنوع | مجاز |
|---|---|
| `lg:px-6 lg:py-4 lg:gap-4` | `lg:(px-6 py-4 gap-4)` |
| `sm:px-4 sm:py-4 sm:gap-4` | `sm:(px-4 py-4 gap-4)` |
| `hover:bg-elevated hover:text-primary` | `hover:(bg-elevated text-primary)` |
| `md:flex md:items-center md:gap-3` | `md:(flex items-center gap-3)` |

مثال واقعی (MainBar):

```html
<!-- بد -->
<div class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 gap-3 sm:gap-4 flex items-center">

<!-- خوب -->
<div class="px-3 py-3 gap-3 sm:(px-4 py-4 gap-4) lg:(px-6) flex items-center">
```

اگر فقط یک یوتیلیتی برای آن breakpoint است، هر دو شکل قابل قبول است (`lg:px-6` یا `lg:(px-6)`)، ولی برای ۲+ همیشه گروه.

## سایز و radius

- سایز کامپوننت‌های Nuxt UI را از prop `size` بگیر (`xs` تا `xl`)، نه padding/font ثابت پراکنده.
- گوشه را با `rounded-*` بی‌حساب نزن؛ از `--ui-radius` تم و کلاس‌های semantic گردی استفاده کن. اگر radius سراسری است، در `app.config.ts` یا `main.css` (`--ui-radius`) تنظیم شود.
- برای کارت محصول الگوی یکدست (`rounded-2xl` تصویر `rounded-xl`) قابل قبول است اگر در همان کامپوننت ثابت بماند.

## تصویر خالی

- تصویر محصول/آواتار بدون سورس معتبر: `TheIcon` با `icon-type="img"` و `name="noImage.png"` (`public/images/noImage.png`).
- URL تصادفی یا placeholder خارجی نگذار مگر داده mock کنترل‌شده پروژه.

## چک قبل از اتمام

همچنین rule همیشه فعال: `.cursor/rules/ui-parity-qa.mdc` (موقعیت پنل، فاصله آیکون اینپوت، تراز، منوی RTL، اکشن نوبار).

- [ ] معادل Nuxt UI استفاده شده، نه HTML خام برای دکمه/اینپوت/کارت/مودال — مگر کنترل دقیق layout لازم باشد
- [ ] `The*` فقط برای دامنه؛ کنترل عمومی دوباره ساخته نشده
- [ ] استایل سراسری در `app.config.ts` است، نه کپی‌شده در چند فایل
- [ ] هیچ رنگ استاتیک / gray-* / white / black / slate-* خام در UI جدید نیست
- [ ] برند/CTA با `primary` (`brand` / `#2563EB`) است؛ تخفیف با `error`
- [ ] در لایت و دارک خوانا می‌ماند بدون کلاس جدا برای دارک
- [ ] همه متن‌ها با `$t` / `t` هستند
- [ ] RTL با `start`/`end` رعایت شده؛ پنل‌ها از لبه اشتباه بیرون نمی‌زنند
- [ ] موبایل‌اول: فیلتر/منو در موبایل drawer یا collapse
- [ ] UnoCSS variant group: به‌جای `lg:a lg:b` از `lg:(a b)` استفاده شده
- [ ] سایز از prop Nuxt UI و radius از تم
- [ ] تصویر خالی با `TheIcon` و `noImage.png`
- [ ] داده داینامیک است؛ صفحه/کارت mock سخت‌کد ندارد
- [ ] آیکون اینپوت روی متن نرفته؛ دکمه‌های هدر هم‌ارتفاع و `items-center` هستند
