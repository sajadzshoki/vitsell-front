---
name: seller-about
description: About page content editor for the vitsell seller (admin) panel.
---

# Seller — About page (مرجع)

مکمل [SKILL.md](SKILL.md) و [docs/ADMIN_PHASE6.md](../../../docs/ADMIN_PHASE6.md). هنگام کار روی `/seller/about` این فایل را بخوان.

## مدل

منبع: `app/data/about.ts` · منطق: `app/composables/useAbout.ts`

| بخش | فیلدها |
|---|---|
| هیرو | `title`, `subtitle`, `eyebrow`, `heroImage` |
| داستان | `storyTitle`, `story[]`, `missionTitle`, `mission`, `visionTitle`, `vision` |
| آمار / ارزش‌ها / milestones / تیم / CTA | همان ساختار قبلی |
| `sectionVisibility` | فلگ نمایش هر سکشن (hero/stats/story/values/milestones/team/cta) |
| `seo` | `SeoMeta` |

**منبع حقیقت:** مدل about اختصاصی — با `staticPages.about` ادغام نشود.

## قوانین

- تصاویر با `TheSellerImageUpload`.
- متن داستان / ماموریت / چشم‌انداز با `TheSellerRichTextEditor` (HTML).
- ادمین: `GET|PUT /seller/about` از طریق `useAbout.fetchAdmin` / `saveAbout`.
- سکشن‌های مخفی در `TheAboutPage` رندر نشوند.
- عمومی: `GET /about` + `useEntitySeo` + `Organization` JSON-LD.
- HTML غنی در `TheAboutPage` با `sanitizeBlogHtml` رندر می‌شود.

## چک

- [ ] toggle visibility برای همه سکشن‌ها
- [ ] SeoFields + متا روی `/about`
- [ ] i18n / RTL / Nuxt UI
