---
name: seller-about
description: About page content editor for the digishop seller (admin) panel.
---

# Seller — About page (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/about` این فایل را بخوان.

## مدل

منبع: `app/data/about.ts` · منطق: `app/composables/useAbout.ts`

| بخش | فیلدها |
|---|---|
| هیرو | `title`, `subtitle`, `eyebrow`, `heroImage` |
| داستان | `storyTitle`, `story[]`, `missionTitle`, `mission`, `visionTitle`, `vision` |
| آمار | `stats[]` — id, icon, value, label |
| ارزش‌ها | `values[]` — id, icon, title, description |
| مسیر رشد | `milestones[]` — id, year, title, description |
| تیم | `teamTitle`, `teamSubtitle`, `team[]` — name, role, bio, image |
| CTA | title, subtitle, primary/secondary label+to |

## قوانین

- تصاویر هیرو و تیم با `TheSellerImageUpload` (آپلود فایل).
- فرانت‌only؛ ذخیره روی state مشترک `site-about-page`.
- استورفرانت: `/about` → `TheAboutPage`.

## چک

- [ ] nav + صفحه seller با auth
- [ ] همه بخش‌های مدل قابل ویرایش
- [ ] آپلود تصویر؛ i18n / RTL / Nuxt UI
