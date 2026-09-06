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

export type FooterContact = {
  phones: { label: string, href: string }[]
  email: { label: string, href: string }
}

export type FooterAppStore = {
  id: string
  label: string
  icon: string
  href: string
}

export type FooterBadge = {
  id: string
  label: string
  icon: string
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
  { id: 'telegram', label: 'تلگرام', icon: 'brand-telegram', href: '#' },
  { id: 'youtube', label: 'یوتیوب', icon: 'brand-youtube', href: '#' },
  { id: 'x', label: 'توییتر', icon: 'brand-x', href: '#' },
]

export const footerContact: FooterContact = {
  phones: [
    { label: '۰۲۱-۶۱۹۳۰۰۰۰', href: 'tel:02161930000' },
    { label: '۰۲۱-۹۱۰۰۱۲۳۴', href: 'tel:02191001234' },
  ],
  email: {
    label: 'support@digishop.ir',
    href: 'mailto:support@digishop.ir',
  },
}

export const footerAppStores: FooterAppStore[] = [
  { id: 'appstore', label: 'App Store', icon: 'brand-apple', href: '#' },
  { id: 'googleplay', label: 'Google Play', icon: 'brand-google-play', href: '#' },
  { id: 'microsoft', label: 'Microsoft', icon: 'brand-windows', href: '#' },
]

export const footerBadges: FooterBadge[] = [
  { id: 'enamad', label: 'نماد اعتماد', icon: 'certificate' },
  { id: 'samandehi', label: 'ساماندهی', icon: 'shield-check' },
  { id: 'ecunion', label: 'اتحادیه کشوری', icon: 'building-store' },
  { id: 'payment', label: 'پرداخت امن', icon: 'lock' },
]

export const footerColumns: FooterColumn[] = [
  {
    id: 'quick',
    title: 'دسترسی سریع',
    links: [
      { label: 'بلاگ', to: staticPagePaths.blog },
      { label: 'موبایل', to: '/search?category=mobile' },
      { label: 'لپ‌تاپ', to: '/search?category=laptop' },
      { label: 'لوازم خانگی', to: '/search?category=home' },
      { label: 'ساعت هوشمند', to: '/search?category=watch' },
      { label: 'کنسول بازی', to: '/search?category=gaming' },
      { label: 'صوتی و هدفون', to: '/search?category=audio' },
      { label: 'مقایسه محصولات', to: '/compare' },
      { label: 'دسته‌بندی‌ها', to: '/category' },
    ],
  },
  {
    id: 'bestsellers',
    title: 'پرفروش‌ترین محصولات',
    links: [
      { label: 'آیفون', to: '/search?q=آیفون&category=mobile' },
      { label: 'سامسونگ', to: '/search?q=سامسونگ&category=mobile' },
      { label: 'شیائومی', to: '/search?q=شیائومی&category=mobile' },
      { label: 'مک‌بوک', to: '/search?q=مک‌بوک&category=laptop' },
      { label: 'ایرپاد', to: '/search?q=ایرپاد&category=audio' },
      { label: 'پلی‌استیشن', to: '/search?q=پلی‌استیشن&category=gaming' },
      { label: 'ساعت اپل', to: '/search?q=ساعت اپل&category=watch' },
      { label: 'تلویزیون', to: '/search?category=tv' },
      { label: 'زیبایی و سلامت', to: '/search?category=beauty' },
    ],
  },
  {
    id: 'about',
    title: 'درباره ما',
    links: [
      { label: 'درباره دیجی‌شاپ', to: staticPagePaths.about },
      { label: 'فرصت‌های شغلی', to: staticPagePaths.careers },
      { label: 'پاسخ به سوالات متداول', to: staticPagePaths.faq },
      { label: 'تماس با ما', to: staticPagePaths.contact },
      { label: 'بلاگ دیجی‌شاپ', to: staticPagePaths.blog },
    ],
  },
  {
    id: 'before-buy',
    title: 'پیش از خرید',
    links: [
      { label: 'نحوه ثبت سفارش', to: staticPagePaths['guide-order'] },
      { label: 'شیوه‌های پرداخت', to: staticPagePaths['guide-payment'] },
      { label: 'رویه ارسال سفارش', to: staticPagePaths['guide-shipping'] },
      { label: '۷ روز ضمانت بازگشت', to: staticPagePaths.returns },
      { label: 'سوالات متداول', to: staticPagePaths.faq },
    ],
  },
  {
    id: 'after-buy',
    title: 'پس از خرید',
    links: [
      { label: 'پیگیری سفارش', to: '/account/orders' },
      { label: 'رویه‌های بازگشت کالا', to: staticPagePaths.returns },
      { label: 'ضمانت اصالت کالا', to: staticPagePaths.faq },
      { label: 'پشتیبانی مشتریان', to: staticPagePaths.contact },
      { label: 'حساب کاربری', to: '/account' },
    ],
  },
  {
    id: 'legal',
    title: 'قوانین و مقررات',
    links: [
      { label: 'شرایط استفاده', to: staticPagePaths.terms },
      { label: 'حریم خصوصی', to: staticPagePaths.privacy },
      { label: 'قوانین مرجوعی', to: staticPagePaths.returns },
      { label: 'چرا دیجی‌شاپ؟', to: staticPagePaths.about },
    ],
  },
]

export const footerCopyright = '© ۱۴۰۵ فروشگاه اینترنتی دیجی‌شاپ. تمامی حقوق محفوظ است.'
