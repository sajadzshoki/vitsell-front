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

منبع نوع: `app/data/seller-questions.ts`  
منطق: `app/composables/useSellerQuestions.ts` → `GET /seller/questions`

الگوی UI نزدیک به نظرات فروشنده (`TheSellerReviews` / `TheSellerReviewCard`).

## اکشن‌ها (API)

| اکشن | تابع | Endpoint |
|---|---|---|
| لیست | `ensureLoaded()` | `GET /seller/questions` |
| پاسخ | `replyToQuestion(id, text)` | `POST /seller/questions/:id/reply` |
| حذف پاسخ | `clearAnswer(id)` | `DELETE /seller/questions/:id/answer` |
| تأیید خریدار | `setVerified(id, boolean)` | `PATCH /seller/questions/:id/verified` |
| حذف پرسش | `deleteQuestion(id)` | `DELETE /seller/questions/:id` |
| پرسش‌های یک محصول | `fetchForProduct(productId)` | `GET /products/:id/questions` |

## UI

- فیلتر: همه / بدون پاسخ / پاسخ‌داده‌شده + جستجو
- کارت: تصویر محصول، پرسش، پاسخ یا فرم پاسخ، اکشن‌ها
- badge تعداد بدون پاسخ در Sidebar و MobileMenu (`ensureLoaded` در layout)
- loading: مثل سفارش‌ها وقتی `pending && !questions.length`
