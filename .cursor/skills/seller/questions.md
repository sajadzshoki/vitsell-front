---
name: seller-questions
description: Product Q&A moderation for the vitsell seller (admin) panel.
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
منطق: `app/composables/useSellerQuestions.ts` → `GET /seller/questions` (فیلتر سرور)

الگوی UI نزدیک به نظرات فروشنده (`TheSellerReviews` / `TheSellerReviewCard`).

## اکشن‌ها (API)

| اکشن | تابع | Endpoint |
|---|---|---|
| لیست فیلترشده | `fetchList({ q, status, page, pageSize, all })` | `GET /seller/questions` |
| badge / شمارش | `ensureLoaded()` | `GET /seller/questions?page=1&pageSize=1` → `statusCounts` |
| پاسخ | `replyToQuestion(id, text)` | `POST /seller/questions/:id/reply` |
| حذف پاسخ | `clearAnswer(id)` | `DELETE /seller/questions/:id/answer` |
| تأیید خریدار | `setVerified(id, boolean)` | `PATCH /seller/questions/:id/verified` |
| حذف پرسش | `deleteQuestion(id)` | `DELETE /seller/questions/:id` |
| پرسش‌های یک محصول | `fetchForProduct(productId)` | `GET /products/:id/questions` |

## UI

- فیلتر سرور: همه / بدون پاسخ / پاسخ‌داده‌شده + جستجو + pagination
- خروجی CSV با `all=true`
- کارت: تصویر محصول، پرسش، پاسخ یا فرم پاسخ، اکشن‌ها
- badge تعداد بدون پاسخ در Sidebar و MobileMenu (`ensureLoaded` در layout)
- loading: مثل نظرات وقتی `(loading \|\| pending) && !questions.length`
