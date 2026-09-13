---
name: seller-notifications
description: Admin notification broadcast UI for vitsell seller panel.
---

# Seller — اعلان‌ها (مرجع)

مکمل [SKILL.md](SKILL.md). هنگام کار روی `/seller/notifications` این فایل را بخوان.

## مدل کمپین

```ts
type SellerNotificationCampaign = {
  id: string
  title: string
  description: string
  link: string | null
  icon: string
  audienceType: 'all' | 'group' | 'users'
  audienceGroup: 'all_customers' | 'has_orders' | 'new_users' | 'inactive' | null
  userIds: number[]
  recipientCount: number
  status: 'sent' | 'draft'
  createdAt: string
  sentAt: string | null
}
```

منبع: `app/data/seller-notifications.ts`  
منطق: `app/composables/useSellerNotifications.ts`

هم‌راستا با `NotificationSchema` / `ShopNotification`: `title`, `description`, `to` (link), `icon`.

## مخاطب

| نوع | رفتار |
|---|---|
| `all` | همه کاربران mock |
| `group` | یکی از گروه‌های ازپیش‌تعریف‌شده |
| `users` | multi-select از لیست کاربران نمونه |

کاربران نمونه (`sellerMockUsers`) تا API یوزر آماده شود.

## UI

- لیست کمپین‌های ارسال‌شده + جستجو + حذف
- فرم ارسال: فیلدها + انتخاب مخاطب + شمارش گیرنده + پیش‌نمایش کارت اعلان

## بک‌اند

| Method | Path |
|--------|------|
| `GET\|POST` | `/seller/notifications` |
| `POST` | `/seller/notifications/preview` |
| `GET` | `/seller/notification-users` |
| `DELETE` | `/seller/notifications/:id` |

ارسال = ساخت کمپین + fan-out به جدول `notifications` برای هر کاربر مخاطب.
