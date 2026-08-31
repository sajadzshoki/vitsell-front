---
name: seller-footer
description: Footer content editing rules for the digishop seller (admin) panel.
---

# Seller — Footer (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/footer` این فایل را بخوان.

## مدل

منبع: `app/data/footer.ts` + `FooterPayload` در `app/composables/useFooter.ts`

```ts
type FooterPayload = {
  trustItems: FooterTrustItem[]
  columns: FooterColumn[]
  socials: FooterSocial[]
  about: string
  copyright: string
  contact?: FooterContact
  appStores?: FooterAppStore[]
  badges?: FooterBadge[]
}
```

## رفتار

- صفحه تک‌فرم مثل تنظیمات سایت (`/seller/shop`)، نه CRUD لیستی
- لود: `fetchFooter()` (GET `/footer` یا fallback استاتیک)
- ذخیره فرانت: `updateFooter(payload)` → همان `site-footer` state که `TheFooter` مصرف می‌کند
- بک‌اند write فعلاً نیست

## UI

سکشن‌ها به‌ترتیب: متن · تماس · نوار اعتماد · ستون‌های لینک · سوشال · اپ‌استور · نشان‌ها  
هر لیست: افزودن / حذف ردیف؛ ستون‌ها لینک داخلی هم دارند.

کامپوننت: `app/components/TheSeller/FooterForm.vue`  
صفحه: `app/pages/seller/footer.vue`
