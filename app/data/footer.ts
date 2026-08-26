import { staticPagePaths } from '~/data/static-pages'

export type FooterTrustItem = {
  id: string
  icon: string
  title: string
  subtitle: string
}

export type FooterLink = {
  label: string
  to: string
}

export type FooterColumn = {
  id: string
  title: string
  links: FooterLink[]
}

export type FooterSocial = {
  id: string
  label: string
  icon: string
  href: string
}

export const footerTrustItems: FooterTrustItem[] = [
  {
    id: 'shipping',
    icon: 'truck-delivery',
    title: 'ارسال سریع',
    subtitle: 'تحویل ۲۴ ساعته در تهران',
  },
  {
    id: 'payment',
    icon: 'credit-card',
    title: 'پرداخت امن',
    subtitle: 'درگاه پرداخت معتبر',
  },
  {
    id: 'return',
    icon: 'refresh',
    title: '۷ روز ضمانت',
    subtitle: 'ضمانت بازگشت کالا',
  },
  {
    id: 'authenticity',
    icon: 'shield-check',
    title: 'اصالت کالا',
    subtitle: 'تضمین اصل بودن محصول',
  },
]

export const footerAbout =
  'دیجی‌شاپ بزرگ‌ترین فروشگاه اینترنتی محصولات دیجیتال با گارانتی اصالت کالا و ارسال سریع به سراسر ایران.'

export const footerSocials: FooterSocial[] = [
  { id: 'instagram', label: 'اینستاگرام', icon: 'brand-instagram', href: '#' },
  { id: 'x', label: 'توییتر', icon: 'brand-x', href: '#' },
  { id: 'youtube', label: 'یوتیوب', icon: 'brand-youtube', href: '#' },
  { id: 'telegram', label: 'تلگرام', icon: 'brand-telegram', href: '#' },
]

export const footerColumns: FooterColumn[] = [
  {
    id: 'with-us',
    title: 'با دیجی‌شاپ',
    links: [
      { label: 'درباره ما', to: staticPagePaths.about },
      { label: 'تماس با ما', to: staticPagePaths.contact },
      { label: 'فرصت‌های شغلی', to: staticPagePaths.careers },
      { label: 'بلاگ', to: staticPagePaths.blog },
      { label: 'فروشنده شوید', to: '/seller' },
    ],
  },
  {
    id: 'sellers',
    title: 'فروش در دیجی‌شاپ',
    links: [
      { label: 'پنل فروشنده', to: '/seller' },
      { label: 'مدیریت محصولات', to: '/seller/products' },
      { label: 'سفارش‌های فروشگاه', to: '/seller/orders' },
      { label: 'مالی و تسویه', to: '/seller/finance' },
    ],
  },
  {
    id: 'support',
    title: 'خدمات مشتریان',
    links: [
      { label: 'پاسخ به سوالات', to: staticPagePaths.faq },
      { label: 'رویه‌های بازگشت کالا', to: staticPagePaths.returns },
      { label: 'شرایط استفاده', to: staticPagePaths.terms },
      { label: 'حریم خصوصی', to: staticPagePaths.privacy },
    ],
  },
  {
    id: 'guide',
    title: 'راهنمای خرید',
    links: [
      { label: 'نحوه ثبت سفارش', to: staticPagePaths['guide-order'] },
      { label: 'رویه ارسال سفارش', to: staticPagePaths['guide-shipping'] },
      { label: 'شیوه‌های پرداخت', to: staticPagePaths['guide-payment'] },
      { label: 'پیگیری سفارش', to: '/account/orders' },
    ],
  },
]

export const footerCopyright = '© ۱۴۰۵ فروشگاه اینترنتی دیجی‌شاپ. تمامی حقوق محفوظ است.'
