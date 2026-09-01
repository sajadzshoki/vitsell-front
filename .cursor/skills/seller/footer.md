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
- لود: `fetchFooter({ force: true, admin: true })` → `GET /seller/footer` (عمومی: `GET /footer`)
- ذخیره: `saveFooter(payload)` → `PUT /seller/footer` + sync به `site-footer` state برای `TheFooter`
- بدون fallback فیک؛ فیلد خالی از API همان‌طور خالی می‌ماند

## UI

سکشن‌ها به‌ترتیب: متن · تماس · نوار اعتماد · ستون‌های لینک · سوشال · اپ‌استور · نشان‌ها  
هر لیست: افزودن / حذف ردیف؛ ستون‌ها لینک داخلی هم دارند.

کامپوننت: `app/components/TheSeller/FooterForm.vue`  
صفحه: `app/pages/seller/footer.vue`
