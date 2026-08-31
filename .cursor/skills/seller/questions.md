---
name: seller-questions
description: Product Q&A moderation for the digishop seller (admin) panel.
---

# Seller — پرسش و پاسخ (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/questions` این فایل را بخوان.

## مدل

```ts
type SellerProductQuestion = {
  id: string
  productId: string
  name: string
  date: string
  verified: boolean
  question: string
  answer: { author: string, date: string, text: string } | null
}
```

منبع: `app/data/seller-questions.ts`  
منطق: `app/composables/useSellerQuestions.ts`

الگوی UI نزدیک به نظرات فروشنده (`TheSellerReviews` / `TheSellerReviewCard`).

## اکشن‌ها

| اکشن | تابع |
|---|---|
| پاسخ | `replyToQuestion(id, text)` |
| حذف پاسخ | `clearAnswer(id)` |
| تأیید خریدار | `setVerified(id, boolean)` |
| حذف پرسش | `deleteQuestion(id)` |

## UI

- فیلتر: همه / بدون پاسخ / پاسخ‌داده‌شده + جستجو
- کارت: تصویر محصول، پرسش، پاسخ یا فرم پاسخ، اکشن‌ها
- badge تعداد بدون پاسخ در Sidebar و MobileMenu

## بک‌اند

فعلاً state فرانت. بعداً هم‌راستا با `GET/POST /products/:id/questions` و endpoint ادمین پاسخ.
