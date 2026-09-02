export type ShopNotification = {
  id: string
  title: string
  description: string
  time: string
  icon: string
  read: boolean
  to?: string
}

export const defaultNotifications: ShopNotification[] = [
  {
    id: '1',
    title: 'سفارش شما ثبت شد',
    description: 'سفارش #۱۲۳۴۵ با موفقیت ثبت شد و در انتظار تأیید است.',
    time: '۲۰ دقیقه پیش',
    icon: 'i-tabler-package',
    read: false,
    to: '/account?tab=orders',
  },
  {
    id: '2',
    title: 'سفارش در حال پردازش است',
    description: 'سفارش #۱۲۳۴۰ در حال آماده‌سازی و بسته‌بندی است.',
    time: '۳ ساعت پیش',
    icon: 'i-tabler-clock',
    read: false,
    to: '/account?tab=orders',
  },
  {
    id: '3',
    title: 'محصول به علاقه‌مندی‌ها برگشت',
    description: 'گوشی موبایل اپل iPhone 15 Pro مجدداً موجود شد.',
    time: 'دیروز',
    icon: 'i-tabler-heart',
    read: false,
    to: '/account/wishlist',
  },
  {
    id: '4',
    title: 'سفارش ارسال شد',
    description: 'سفارش #۱۲۳۳۸ از انبار خارج شد و به سمت شما در حرکت است.',
    time: '۲ روز پیش',
    icon: 'i-tabler-truck',
    read: true,
    to: '/account?tab=orders',
  },
  {
    id: '5',
    title: 'کد تخفیف ویژه',
    description: '۲۰٪ تخفیف برای خریدهای بالای ۵ میلیون تومان. کد: SPECIAL20',
    time: '۳ روز پیش',
    icon: 'i-tabler-ticket',
    read: true,
  },
]
