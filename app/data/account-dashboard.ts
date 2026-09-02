export type AccountQuickAction = {
  id: string
  label: string
  hint: string
  icon: string
  to: string
  iconWrap: string
}

export type AccountDashboardTip = {
  id: string
  title: string
  description: string
  icon: string
  iconWrap: string
  to: string
  actionLabel: string
}

export const accountQuickActions: AccountQuickAction[] = [
  {
    id: 'shop',
    label: 'ادامه خرید',
    hint: 'مرور محصولات',
    icon: 'i-tabler-shopping-bag',
    to: '/',
    iconWrap: 'bg-primary/10 text-primary',
  },
  {
    id: 'orders',
    label: 'پیگیری سفارش',
    hint: 'وضعیت ارسال',
    icon: 'i-tabler-truck-delivery',
    to: '/account/orders',
    iconWrap: 'bg-info/10 text-info',
  },
  {
    id: 'wallet',
    label: 'کیف پول',
    hint: 'موجودی و شارژ',
    icon: 'i-tabler-wallet',
    to: '/account/wallet',
    iconWrap: 'bg-success/10 text-success',
  },
  {
    id: 'wishlist',
    label: 'علاقه‌مندی‌ها',
    hint: 'ذخیره‌شده‌ها',
    icon: 'i-tabler-heart',
    to: '/account/wishlist',
    iconWrap: 'bg-error/10 text-error',
  },
  {
    id: 'addresses',
    label: 'آدرس‌ها',
    hint: 'مدیریت ارسال',
    icon: 'i-tabler-map-pin',
    to: '/account/addresses',
    iconWrap: 'bg-warning/10 text-warning',
  },
  {
    id: 'reviews',
    label: 'نظرات و پرسش‌ها',
    hint: 'بازخوردها',
    icon: 'i-tabler-message-2',
    to: '/account/reviews',
    iconWrap: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'profile',
    label: 'اطلاعات حساب',
    hint: 'ویرایش پروفایل',
    icon: 'i-tabler-user',
    to: '/account/profile',
    iconWrap: 'bg-primary/10 text-primary',
  },
  {
    id: 'settings',
    label: 'تنظیمات',
    hint: 'ترجیحات حساب',
    icon: 'i-tabler-settings',
    to: '/account/settings',
    iconWrap: 'bg-muted text-toned',
  },
]

export function buildAccountDashboardTips(input: {
  hasEmail: boolean
  hasPassword: boolean
  addressCount: number
  activeOrdersCount: number
  unansweredQuestions: number
  wishlistCount: number
}): AccountDashboardTip[] {
  const tips: AccountDashboardTip[] = []

  if (input.activeOrdersCount > 0) {
    tips.push({
      id: 'active-orders',
      title: 'سفارش در جریان دارید',
      description: 'وضعیت ارسال و جزئیات سفارش‌های فعال را ببینید.',
      icon: 'i-tabler-truck-delivery',
      iconWrap: 'bg-info/15 text-info',
      to: '/account/orders',
      actionLabel: 'مشاهده سفارش‌ها',
    })
  }

  if (!input.hasEmail) {
    tips.push({
      id: 'email',
      title: 'ایمیل ثبت نشده',
      description: 'با افزودن ایمیل، رسید سفارش و اعلان‌ها را دریافت کنید.',
      icon: 'i-tabler-mail',
      iconWrap: 'bg-warning/15 text-warning',
      to: '/account/profile',
      actionLabel: 'تکمیل پروفایل',
    })
  }

  if (!input.hasPassword) {
    tips.push({
      id: 'password',
      title: 'رمز عبور تنظیم نشده',
      description: 'برای ورود سریع‌تر بدون کد تأیید، رمز عبور بگذارید.',
      icon: 'i-tabler-lock',
      iconWrap: 'bg-primary/15 text-primary',
      to: '/account/profile',
      actionLabel: 'تنظیم رمز',
    })
  }

  if (input.addressCount === 0) {
    tips.push({
      id: 'address',
      title: 'آدرسی ذخیره نشده',
      description: 'با ذخیره آدرس، پرداخت بعدی سریع‌تر انجام می‌شود.',
      icon: 'i-tabler-map-pin',
      iconWrap: 'bg-error/15 text-error',
      to: '/account/addresses',
      actionLabel: 'افزودن آدرس',
    })
  }

  if (input.unansweredQuestions > 0) {
    tips.push({
      id: 'questions',
      title: 'پرسش در انتظار پاسخ',
      description: 'وضعیت پرسش‌های ثبت‌شده خود را بررسی کنید.',
      icon: 'i-tabler-message-question',
      iconWrap: 'bg-secondary/15 text-secondary',
      to: '/account/reviews',
      actionLabel: 'مشاهده پرسش‌ها',
    })
  }

  if (input.wishlistCount > 0) {
    tips.push({
      id: 'wishlist',
      title: 'علاقه‌مندی‌های ذخیره‌شده',
      description: 'محصولات مورد علاقه‌تان را مرور و خرید کنید.',
      icon: 'i-tabler-heart',
      iconWrap: 'bg-primary/15 text-primary',
      to: '/account/wishlist',
      actionLabel: 'مشاهده لیست',
    })
  }

  return tips.slice(0, 4)
}
