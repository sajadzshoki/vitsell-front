---
name: nuxt-ui
description: Builds Vue/Nuxt UI with Nuxt UI components, semantic theme tokens, i18n, RTL, and app.config.ts defaults. Use when creating or editing pages, layouts, Vue components, styles, or any UI in this project.
---

# Nuxt UI

قبل از نوشتن یا تغییر UI این فایل را رعایت کن.

## قوانین اصلی

- تا جای ممکن از کامپوننت های خود nuxtui استفاده کنه
- اگر چیزی همه جا قراره اعمال بشه برای nuxt ui conponents توی app.config.ts بزارتش
- هیچ رنگ استاتیکی نده و همه رو از رنگ های تعریف شده تو پروژه استفاده کنه تا توی لایت و دارک بهم نریزه چیزی و اگر بخوایم تم پروژه رو بخوایم تغییر بدیم همه چیز یک دست تغییر ‌کنه
- پروژه چند زبانست پس هر تکستی استفاده میکنه از i18n t استفاده کنه

## کامپوننت‌ها

1. اول کامپوننت آماده Nuxt UI را بزن (`UButton`, `UCard`, `UInput`, `USelect`, `UCheckbox`, `UBadge`, `USeparator`, `UIcon`, `UModal`, …).
2. کامپوننت سفارشی فقط وقتی که معادل Nuxt UI وجود ندارد یا ترکیب چند کامپوننت لازم است.
3. آیکون‌ها: `UIcon` با مجموعه `i-tabler-*` (طبق `nuxt.config.ts`).
4. ظاهر تکراری یک کامپوننت را با `:ui` روی همان اینستنس override نکن اگر قرار است همه جا باشد؛ در `app/app.config.ts` زیر `ui.<component>` بگذار.
5. کامپوننت‌های `The*` فقط برای منطق دامنه (مثل کارت محصول). کنترل‌های عمومی (دکمه، اینپوت، مودال، چک‌باکس، سلکت) را دوباره نساز.

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

## تصویر خالی

- تصویر محصول/آواتار بدون سورس معتبر: `TheIcon` با `icon-type="img"` و `name="noImage.png"` (`public/images/noImage.png`).
- URL تصادفی یا placeholder خارجی نگذار.

## رنگ

منبع تم:

- نقش رنگ‌ها: `app/app.config.ts` → `ui.colors` (`primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`)
- توکن‌های معنایی light/dark: `app/assets/css/main.css`

ممنوع:

- `bg-white`, `text-black`, `text-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`
- hex / rgb / hsl در template، style، یا class
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

## چک قبل از اتمام

- [ ] معادل Nuxt UI استفاده شده، نه HTML خام برای دکمه/اینپوت/کارت/مودال
- [ ] `The*` فقط برای دامنه؛ کنترل عمومی دوباره ساخته نشده
- [ ] استایل سراسری در `app.config.ts` است، نه کپی‌شده در چند فایل
- [ ] هیچ رنگ استاتیک / gray-* / white / black در UI جدید نیست
- [ ] در لایت و دارک خوانا می‌ماند بدون کلاس جدا برای دارک
- [ ] همه متن‌ها با `$t` / `t` هستند
- [ ] RTL با `start`/`end` رعایت شده
- [ ] موبایل‌اول: فیلتر/منو در موبایل drawer یا collapse
- [ ] سایز از prop Nuxt UI و radius از تم
- [ ] تصویر خالی با `TheIcon` و `noImage.png`
