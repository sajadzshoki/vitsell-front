export type SellerTabId =
  | 'dashboard'
  | 'products'
  | 'product_tags'
  | 'categories'
  | 'brands'
  | 'attributes'
  | 'inventory'
  | 'warehouses'
  | 'banners'
  | 'blog'
  | 'pages'
  | 'about'
  | 'media'
  | 'deals'
  | 'promotions'
  | 'notifications'
  | 'marketing'
  | 'discounts'
  | 'campaigns'
  | 'footer'
  | 'orders'
  | 'returns'
  | 'refunds'
  | 'shipping'
  | 'customers'
  | 'reviews'
  | 'questions'
  | 'finance'
  | 'finance_transactions'
  | 'finance_payments'
  | 'finance_settlements'
  | 'finance_reconciliation'
  | 'finance_adjustments'
  | 'finance_reports'
  | 'finance_gateways'
  | 'analytics'
  | 'admins'
  | 'roles'
  | 'permissions'
  | 'audit'
  | 'activity'
  | 'seo'
  | 'account'
  | 'shop'
  | 'settings'
  | 'system'
  | 'navigation'
  | 'imports'
  | 'exports'

export type SellerNavItem = {
  id: SellerTabId
  label: string
  icon: string
  /** Route for live modules; omit or empty for coming-soon */
  to?: string
  comingSoon?: boolean
  disabled?: boolean
}

export type SellerNavGroup = {
  id: string
  label: string
  items: SellerNavItem[]
}

export type SellerProductStatus = 'active' | 'pending' | 'inactive' | 'out_of_stock'

export type SellerListing = {
  productId: string
  stock: number
  sold: number
  views: number
  status: SellerProductStatus
}

export type SellerOrderStatus =
  | 'new'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'cancelled'

export type SellerOrderItem = {
  productId: string
  qty: number
  price: number
}

export type SellerOrderAddress = {
  province: string
  city: string
  address: string
  postalCode: string
}

export type SellerOrder = {
  id: string
  date: string
  /** کلید مرتب‌سازی تاریخ به صورت YYYYMMDD میلادی/شمسی عددی لاتین */
  dateKey: string
  status: SellerOrderStatus
  customerName: string
  customerPhone: string
  city: string
  address: SellerOrderAddress
  items: SellerOrderItem[]
  total: number
  shippingMethod: string
  paymentMethod: string
  note?: string
}

const sellerOrderStatuses: SellerOrderStatus[] = [
  'new',
  'packing',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
]

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    }
    catch {
      return fallback
    }
  }
  return value as T
}

export function toSellerOrder(raw: Partial<SellerOrder> & { id: string }): SellerOrder {
  const status = sellerOrderStatuses.includes(raw.status as SellerOrderStatus)
    ? (raw.status as SellerOrderStatus)
    : 'new'
  const address = parseJsonField<SellerOrderAddress>(raw.address, {
    province: '',
    city: raw.city ?? '',
    address: '',
    postalCode: '',
  })
  const items = parseJsonField<SellerOrderItem[]>(raw.items, []).map(item => ({
    productId: String(item.productId ?? ''),
    qty: Math.max(1, Math.round(Number(item.qty) || 1)),
    price: Math.max(0, Math.round(Number(item.price) || 0)),
  }))

  return {
    id: String(raw.id),
    date: String(raw.date ?? ''),
    dateKey: String(raw.dateKey ?? ''),
    status,
    customerName: String(raw.customerName ?? ''),
    customerPhone: String(raw.customerPhone ?? ''),
    city: String(raw.city ?? address.city ?? ''),
    address: {
      province: String(address.province ?? ''),
      city: String(address.city ?? raw.city ?? ''),
      address: String(address.address ?? ''),
      postalCode: String(address.postalCode ?? ''),
    },
    items,
    total: Math.max(0, Math.round(Number(raw.total) || 0)),
    shippingMethod: String(raw.shippingMethod ?? ''),
    paymentMethod: String(raw.paymentMethod ?? ''),
    ...(raw.note ? { note: String(raw.note) } : {}),
  }
}

export type SellerOrderSort = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'

export const sellerOrderSortOptions: { id: SellerOrderSort, label: string }[] = [
  { id: 'newest', label: 'جدیدترین' },
  { id: 'oldest', label: 'قدیمی‌ترین' },
  { id: 'amount_desc', label: 'بیشترین مبلغ' },
  { id: 'amount_asc', label: 'کمترین مبلغ' },
]

export const sellerOrdersPageSize = 10

export type SellerReviewModeration = 'pending' | 'approved' | 'rejected' | 'hidden'

export type SellerReview = {
  id: string
  productId: string
  name: string
  rating: number
  text: string
  date: string
  reply?: string
  moderation?: SellerReviewModeration
}

export type SellerPayoutStatus = 'paid' | 'pending'

export type SellerPayout = {
  id: string
  date: string
  amount: number
  status: SellerPayoutStatus
}

export type SellerShop = {
  name: string
  slug: string
  phone: string
  email: string
  city: string
  about: string
  rating: number
  reviewCount: number
  joinDate: string
  /** From platform settings overlay on GET /site */
  logoUrl?: string
  faviconUrl?: string
  defaultOgImage?: string
  brandName?: string
  brandDescription?: string
  supportPhone?: string
  salesPhone?: string
  supportEmail?: string
  address?: string
  workingHours?: string
}

export type SellerSalesPoint = {
  label: string
  value: number
}

export function toSellerPayout(raw: Partial<SellerPayout> & { id: string }): SellerPayout {
  const status: SellerPayoutStatus = raw.status === 'paid' ? 'paid' : 'pending'
  return {
    id: String(raw.id),
    date: String(raw.date ?? ''),
    amount: Math.max(0, Math.round(Number(raw.amount) || 0)),
    status,
  }
}

export function toSellerSalesPoint(raw: Partial<SellerSalesPoint>): SellerSalesPoint | null {
  const label = String(raw.label ?? '').trim()
  if (!label) return null
  return {
    label,
    value: Math.max(0, Math.round(Number(raw.value) || 0)),
  }
}

export const defaultSellerShop: SellerShop = {
  name: 'دیجی‌شاپ',
  slug: 'digishop',
  phone: '',
  email: 'info@digishop.ir',
  city: 'تهران',
  about:
    'دیجی‌شاپ بزرگ‌ترین فروشگاه اینترنتی محصولات دیجیتال با گارانتی اصالت کالا و ارسال سریع به سراسر ایران.',
  rating: 0,
  reviewCount: 0,
  joinDate: '',
}

export const sellerNavGroups: SellerNavGroup[] = [
  {
    id: 'overview',
    label: 'نمای کلی',
    items: [
      { id: 'dashboard', label: 'پیشخوان مدیریت', icon: 'i-tabler-layout-dashboard', to: '/seller' },
    ],
  },
  {
    id: 'commerce',
    label: 'کاتالوگ',
    items: [
      { id: 'products', label: 'محصولات', icon: 'i-tabler-package', to: '/seller/products' },
      { id: 'product_tags', label: 'برچسب‌ها', icon: 'i-tabler-tags', to: '/seller/products/tags' },
      { id: 'categories', label: 'دسته‌بندی‌ها', icon: 'i-tabler-category', to: '/seller/categories' },
      { id: 'brands', label: 'برندها', icon: 'i-tabler-trademark', to: '/seller/brands' },
      { id: 'attributes', label: 'ویژگی‌ها', icon: 'i-tabler-list-details', to: '/seller/attributes' },
      { id: 'inventory', label: 'موجودی', icon: 'i-tabler-packages', to: '/seller/inventory' },
      { id: 'warehouses', label: 'انبارها', icon: 'i-tabler-building-warehouse', to: '/seller/warehouses' },
    ],
  },
  {
    id: 'orders',
    label: 'سفارش‌ها',
    items: [
      { id: 'orders', label: 'سفارش‌ها', icon: 'i-tabler-shopping-bag', to: '/seller/orders' },
      { id: 'returns', label: 'مرجوعی‌ها', icon: 'i-tabler-arrow-back-up', to: '/seller/returns' },
      { id: 'refunds', label: 'بازپرداخت‌ها', icon: 'i-tabler-receipt-refund', to: '/seller/refunds' },
      { id: 'shipping', label: 'ارسال', icon: 'i-tabler-truck-delivery', to: '/seller/shipping' },
    ],
  },
  {
    id: 'customers',
    label: 'مشتریان',
    items: [
      { id: 'customers', label: 'مشتریان', icon: 'i-tabler-users', to: '/seller/customers' },
      { id: 'reviews', label: 'نظرات مشتریان', icon: 'i-tabler-message-2', to: '/seller/reviews' },
      { id: 'questions', label: 'پرسش و پاسخ', icon: 'i-tabler-message-question', to: '/seller/questions' },
    ],
  },
  {
    id: 'marketing',
    label: 'بازاریابی',
    items: [
      { id: 'marketing', label: 'داشبورد بازاریابی', icon: 'i-tabler-chart-arrows', to: '/seller/marketing' },
      { id: 'campaigns', label: 'کمپین‌ها', icon: 'i-tabler-speakerphone', to: '/seller/campaigns' },
      { id: 'discounts', label: 'تخفیف‌ها', icon: 'i-tabler-discount', to: '/seller/discounts' },
      { id: 'banners', label: 'بنرها', icon: 'i-tabler-photo', to: '/seller/banners' },
      { id: 'deals', label: 'شگفت‌انگیزها', icon: 'i-tabler-bolt', to: '/seller/deals' },
      { id: 'promotions', label: 'کوپن و پرومو', icon: 'i-tabler-discount-2', to: '/seller/promotions' },
      { id: 'notifications', label: 'اعلان‌ها', icon: 'i-tabler-bell', to: '/seller/notifications' },
    ],
  },
  {
    id: 'content',
    label: 'محتوا',
    items: [
      { id: 'blog', label: 'وبلاگ', icon: 'i-tabler-news', to: '/seller/blog' },
      { id: 'pages', label: 'صفحات ثابت', icon: 'i-tabler-file-text', to: '/seller/pages' },
      { id: 'about', label: 'درباره ما', icon: 'i-tabler-building-store', to: '/seller/about' },
      { id: 'media', label: 'کتابخانه رسانه', icon: 'i-tabler-photo-cog', to: '/seller/media' },
      { id: 'footer', label: 'فوتر', icon: 'i-tabler-layout-bottombar', to: '/seller/footer' },
    ],
  },
  {
    id: 'finance',
    label: 'مالی',
    items: [
      { id: 'finance', label: 'داشبورد مالی', icon: 'i-tabler-report-money', to: '/seller/finance' },
      { id: 'finance_transactions', label: 'تراکنش‌ها', icon: 'i-tabler-arrows-exchange', to: '/seller/finance/transactions' },
      { id: 'finance_payments', label: 'پرداخت‌ها', icon: 'i-tabler-credit-card', to: '/seller/finance/payments' },
      { id: 'finance_settlements', label: 'تسویه‌های درگاه', icon: 'i-tabler-building-bank', to: '/seller/finance/settlements' },
      { id: 'finance_reconciliation', label: 'مغایرت‌گیری', icon: 'i-tabler-scale', to: '/seller/finance/reconciliation' },
      { id: 'finance_adjustments', label: 'تعدیلات', icon: 'i-tabler-adjustments', to: '/seller/finance/adjustments' },
      { id: 'finance_reports', label: 'گزارش‌های مالی', icon: 'i-tabler-chart-area-line', to: '/seller/finance/reports' },
      { id: 'finance_gateways', label: 'درگاه‌ها', icon: 'i-tabler-server', to: '/seller/finance/gateways' },
    ],
  },
  {
    id: 'administration',
    label: 'مدیریت دسترسی',
    items: [
      { id: 'system', label: 'نمای سیستم', icon: 'i-tabler-server-cog', to: '/seller/system' },
      { id: 'admins', label: 'کاربران ادمین', icon: 'i-tabler-user-shield', to: '/seller/admins' },
      { id: 'roles', label: 'نقش‌ها و دسترسی‌ها', icon: 'i-tabler-lock-access', to: '/seller/roles' },
      // { id: 'permissions', label: 'کاتالوگ دسترسی‌ها', icon: 'i-tabler-key', to: '/seller/roles/permissions' },
      { id: 'audit', label: 'لاگ حسابرسی', icon: 'i-tabler-clipboard-list', to: '/seller/audit' },
      { id: 'activity', label: 'لاگ فعالیت', icon: 'i-tabler-history', to: '/seller/activity' },
      { id: 'imports', label: 'مرکز ورود داده', icon: 'i-tabler-file-import', to: '/seller/imports' },
      { id: 'exports', label: 'مرکز خروجی', icon: 'i-tabler-file-export', to: '/seller/exports' },
    ],
  },
  {
    id: 'system',
    label: 'سیستم',
    items: [
      { id: 'settings', label: 'تنظیمات پلتفرم', icon: 'i-tabler-settings', to: '/seller/settings' },
      { id: 'navigation', label: 'منوی سایت', icon: 'i-tabler-menu-2', to: '/seller/navigation' },
      { id: 'account', label: 'حساب ادمین', icon: 'i-tabler-user-circle', to: '/seller/account' },
      { id: 'seo', label: 'تنظیمات سئو', icon: 'i-tabler-world-search', to: '/seller/seo' },
    ],
  },
]

/** Flat live+placeholder items (backward compatible lookup) */
export const sellerNavItems: SellerNavItem[] = sellerNavGroups.flatMap(group => group.items)

/** Only navigable (live) items */
export const sellerLiveNavItems: SellerNavItem[] = sellerNavItems.filter(
  item => item.to && !item.comingSoon && !item.disabled,
)

export const sellerProductStatusMeta: Record<
  SellerProductStatus,
  { label: string; color: 'success' | 'warning' | 'neutral' | 'error' }
> = {
  active: { label: 'فعال', color: 'success' },
  pending: { label: 'در انتظار تأیید', color: 'warning' },
  inactive: { label: 'غیرفعال', color: 'neutral' },
  out_of_stock: { label: 'ناموجود', color: 'error' },
}

export const sellerOrderStatusMeta: Record<
  SellerOrderStatus,
  {
    label: string
    color: 'success' | 'info' | 'warning' | 'primary' | 'error' | 'neutral'
    icon: string
    step: number
  }
> = {
  new: { label: 'سفارش جدید', color: 'warning', icon: 'i-tabler-bell', step: 0 },
  packing: { label: 'در حال آماده‌سازی', color: 'info', icon: 'i-tabler-box', step: 1 },
  shipped: { label: 'ارسال شده', color: 'primary', icon: 'i-tabler-truck-delivery', step: 2 },
  delivered: { label: 'تحویل شده', color: 'success', icon: 'i-tabler-check', step: 3 },
  returned: { label: 'مرجوعی', color: 'error', icon: 'i-tabler-arrow-back-up', step: 0 },
  cancelled: { label: 'لغو شده', color: 'neutral', icon: 'i-tabler-x', step: 0 },
}

export const sellerOrderTrackingSteps = [
  'ثبت سفارش',
  'در حال آماده‌سازی',
  'ارسال شد',
  'تحویل داده شد',
]

export const sellerOrderNextStatus: Partial<Record<SellerOrderStatus, SellerOrderStatus>> = {
  new: 'packing',
  packing: 'shipped',
  shipped: 'delivered',
}

export const sellerOrderPrevStatus: Partial<Record<SellerOrderStatus, SellerOrderStatus>> = {
  packing: 'new',
  shipped: 'packing',
  delivered: 'shipped',
}

export const sellerOrderActionLabel: Partial<Record<SellerOrderStatus, string>> = {
  new: 'شروع آماده‌سازی',
  packing: 'ارسال سفارش',
  shipped: 'ثبت تحویل',
}

export const sellerOrderUndoLabel: Partial<Record<SellerOrderStatus, string>> = {
  packing: 'بازگشت به سفارش جدید',
  shipped: 'بازگشت به آماده‌سازی',
  delivered: 'بازگشت به ارسال‌شده',
}

export const sellerOrderAdvanceConfirm: Partial<Record<SellerOrderStatus, string>> = {
  new: 'آیا از شروع آماده‌سازی این سفارش مطمئن هستید؟',
  packing: 'آیا از ثبت ارسال این سفارش مطمئن هستید؟',
  shipped: 'آیا از ثبت تحویل این سفارش به مشتری مطمئن هستید؟',
}

export const sellerOrderUndoConfirm: Partial<Record<SellerOrderStatus, string>> = {
  packing: 'وضعیت به «سفارش جدید» برمی‌گردد. ادامه می‌دهید؟',
  shipped: 'وضعیت به «در حال آماده‌سازی» برمی‌گردد. ادامه می‌دهید؟',
  delivered: 'وضعیت به «ارسال شده» برمی‌گردد. ادامه می‌دهید؟',
}

export const defaultSellerListings: SellerListing[] = [
  { productId: 'iphone-16-pro', stock: 14, sold: 86, views: 12450, status: 'active' },
  { productId: 'galaxy-s25-ultra', stock: 8, sold: 54, views: 8320, status: 'active' },
  { productId: 'macbook-m4', stock: 5, sold: 21, views: 4180, status: 'active' },
  { productId: 'sony-xm5', stock: 32, sold: 140, views: 15640, status: 'active' },
  { productId: 'apple-watch-ultra', stock: 10, sold: 0, views: 980, status: 'pending' },
  { productId: 'ps5-pro', stock: 3, sold: 67, views: 9870, status: 'active' },
  { productId: 'ipad-pro-m4', stock: 12, sold: 18, views: 2640, status: 'inactive' },
  { productId: 'airpods-pro-2', stock: 45, sold: 210, views: 18920, status: 'active' },
  { productId: 'jbl-charge-5', stock: 0, sold: 88, views: 5410, status: 'out_of_stock' },
  { productId: 'xiaomi-robot-vac', stock: 7, sold: 33, views: 3120, status: 'active' },
  { productId: 'nike-air-max', stock: 20, sold: 0, views: 640, status: 'pending' },
  { productId: 'lg-oled-c4', stock: 2, sold: 9, views: 1880, status: 'active' },
]

export const defaultSellerOrders: SellerOrder[] = [
  {
    id: 'SL-20411',
    date: '۱۴۰۳/۰۹/۲۲',
    dateKey: '14030922',
    status: 'new',
    customerName: 'نگار موسوی',
    customerPhone: '09123334455',
    city: 'تهران',
    address: {
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان شریعتی، نرسیده به میرداماد، کوچه بهار، پلاک ۸، واحد ۴',
      postalCode: '1949632145',
    },
    items: [{ productId: 'iphone-16-pro', qty: 1, price: 89_900_000 }],
    total: 89_900_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
    note: 'تحویل در ساعات اداری ترجیح داده می‌شود.',
  },
  {
    id: 'SL-20408',
    date: '۱۴۰۳/۰۹/۲۱',
    dateKey: '14030921',
    status: 'packing',
    customerName: 'رضا کریمی',
    customerPhone: '09351234567',
    city: 'کرج',
    address: {
      province: 'البرز',
      city: 'کرج',
      address: 'گوهردشت، فاز ۳، خیابان ارم، پلاک ۲۲',
      postalCode: '3145678901',
    },
    items: [
      { productId: 'sony-xm5', qty: 1, price: 18_500_000 },
      { productId: 'airpods-pro-2', qty: 1, price: 12_400_000 },
    ],
    total: 30_900_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20398',
    date: '۱۴۰۳/۰۹/۲۰',
    dateKey: '14030920',
    status: 'new',
    customerName: 'الهام جعفری',
    customerPhone: '09125556677',
    city: 'قم',
    address: {
      province: 'قم',
      city: 'قم',
      address: 'بلوار امین، کوچه ۱۲، پلاک ۵',
      postalCode: '3713890012',
    },
    items: [
      { productId: 'airpods-pro-2', qty: 2, price: 12_400_000 },
    ],
    total: 24_800_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20391',
    date: '۱۴۰۳/۰۹/۱۸',
    dateKey: '14030918',
    status: 'shipped',
    customerName: 'سارا محمدی',
    customerPhone: '09127654321',
    city: 'اصفهان',
    address: {
      province: 'اصفهان',
      city: 'اصفهان',
      address: 'خیابان چهارباغ عباسی، کوچه گلستان، پلاک ۱۷',
      postalCode: '8145612345',
    },
    items: [{ productId: 'galaxy-s25-ultra', qty: 1, price: 72_400_000 }],
    total: 72_400_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20382',
    date: '۱۴۰۳/۰۹/۱۶',
    dateKey: '14030916',
    status: 'packing',
    customerName: 'کیانوش مرادی',
    customerPhone: '09361112233',
    city: 'رشت',
    address: {
      province: 'گیلان',
      city: 'رشت',
      address: 'خیابان مطهری، بعد از میدان فرهنگ، پلاک ۴۱',
      postalCode: '4135678901',
    },
    items: [{ productId: 'xiaomi-robot-vac', qty: 1, price: 15_900_000 }],
    total: 15_900_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت در محل',
  },
  {
    id: 'SL-20370',
    date: '۱۴۰۳/۰۹/۱۲',
    dateKey: '14030912',
    status: 'delivered',
    customerName: 'امیر حسینی',
    customerPhone: '09199887766',
    city: 'مشهد',
    address: {
      province: 'خراسان رضوی',
      city: 'مشهد',
      address: 'بلوار وکیل‌آباد، بین وکیل‌آباد ۱۸ و ۲۰، پلاک ۹۰',
      postalCode: '9178945123',
    },
    items: [{ productId: 'ps5-pro', qty: 1, price: 32_500_000 }],
    total: 32_500_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت در محل',
  },
  {
    id: 'SL-20361',
    date: '۱۴۰۳/۰۹/۰۹',
    dateKey: '14030909',
    status: 'shipped',
    customerName: 'نیلوفر اکبری',
    customerPhone: '09134445566',
    city: 'یزد',
    address: {
      province: 'یزد',
      city: 'یزد',
      address: 'صفائیه، خیابان تیمسار فلاحی، پلاک ۱۲',
      postalCode: '8916789012',
    },
    items: [
      { productId: 'sony-xm5', qty: 1, price: 18_500_000 },
      { productId: 'jbl-charge-5', qty: 1, price: 7_400_000 },
    ],
    total: 25_900_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20355',
    date: '۱۴۰۳/۰۹/۰۵',
    dateKey: '14030905',
    status: 'delivered',
    customerName: 'مینا رضایی',
    customerPhone: '09211223344',
    city: 'شیراز',
    address: {
      province: 'فارس',
      city: 'شیراز',
      address: 'خیابان زند، کوچه بهار، پلاک ۳، واحد ۲',
      postalCode: '7134567890',
    },
    items: [{ productId: 'macbook-m4', qty: 1, price: 145_000_000 }],
    total: 145_000_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20340',
    date: '۱۴۰۳/۰۹/۰۱',
    dateKey: '14030901',
    status: 'delivered',
    customerName: 'فرهاد صالحی',
    customerPhone: '09127778899',
    city: 'تهران',
    address: {
      province: 'تهران',
      city: 'تهران',
      address: 'سعادت‌آباد، میدان کاج، خیابان سرو غربی، پلاک ۲۸',
      postalCode: '1998612345',
    },
    items: [{ productId: 'lg-oled-c4', qty: 1, price: 98_000_000 }],
    total: 98_000_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20328',
    date: '۱۴۰۳/۰۸/۳۰',
    dateKey: '14030830',
    status: 'new',
    customerName: 'مهدی کاظمی',
    customerPhone: '09390001122',
    city: 'اهواز',
    address: {
      province: 'خوزستان',
      city: 'اهواز',
      address: 'کیانپارس، خیابان ۳ غربی، پلاک ۱۵',
      postalCode: '6155678901',
    },
    items: [{ productId: 'iphone-16-pro', qty: 1, price: 89_900_000 }],
    total: 89_900_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20312',
    date: '۱۴۰۳/۰۸/۲۸',
    dateKey: '14030828',
    status: 'returned',
    customerName: 'حسین نادری',
    customerPhone: '09370001122',
    city: 'تبریز',
    address: {
      province: 'آذربایجان شرقی',
      city: 'تبریز',
      address: 'ولیعصر، خیابان ۲۹ بهمن، پلاک ۶۶',
      postalCode: '5166612345',
    },
    items: [{ productId: 'jbl-charge-5', qty: 1, price: 7_400_000 }],
    total: 7_400_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
    note: 'کالا آسیب‌دیده دریافت شده؛ درخواست مرجوعی تأیید شد.',
  },
  {
    id: 'SL-20301',
    date: '۱۴۰۳/۰۸/۲۴',
    dateKey: '14030824',
    status: 'delivered',
    customerName: 'زهرا نوری',
    customerPhone: '09121110022',
    city: 'کرمان',
    address: {
      province: 'کرمان',
      city: 'کرمان',
      address: 'خیابان شریعتی، کوچه ۱۲، پلاک ۹',
      postalCode: '7614567890',
    },
    items: [{ productId: 'apple-watch-ultra', qty: 1, price: 21_800_000 }],
    total: 21_800_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20288',
    date: '۱۴۰۳/۰۸/۱۹',
    dateKey: '14030819',
    status: 'cancelled',
    customerName: 'پارسا احمدی',
    customerPhone: '09120001122',
    city: 'اهواز',
    address: {
      province: 'خوزستان',
      city: 'اهواز',
      address: 'زیتون کارمندی، خیابان ۱۸، پلاک ۷',
      postalCode: '6134512345',
    },
    items: [{ productId: 'apple-watch-ultra', qty: 1, price: 21_800_000 }],
    total: 21_800_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
    note: 'لغو توسط خریدار قبل از آماده‌سازی.',
  },
  {
    id: 'SL-20275',
    date: '۱۴۰۳/۰۸/۱۴',
    dateKey: '14030814',
    status: 'delivered',
    customerName: 'سپیده رحیمی',
    customerPhone: '09126667788',
    city: 'همدان',
    address: {
      province: 'همدان',
      city: 'همدان',
      address: 'بلوار آیت‌الله مدنی، پلاک ۳۳',
      postalCode: '6515678901',
    },
    items: [
      { productId: 'airpods-pro-2', qty: 1, price: 12_400_000 },
      { productId: 'sony-xm5', qty: 1, price: 18_500_000 },
    ],
    total: 30_900_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت در محل',
  },
]

export const defaultSellerReviews: SellerReview[] = [
  {
    id: 'rv-1',
    productId: 'iphone-16-pro',
    name: 'علی رضایی',
    rating: 5,
    text: 'کیفیت فوق‌العاده‌ای داره. خیلی راضی هستم از خرید. ارسال هم سریع بود.',
    date: '۱۴۰۳/۰۹/۲۰',
    reply: 'از خرید شما سپاسگزاریم؛ همیشه در خدمتیم.',
  },
  {
    id: 'rv-2',
    productId: 'sony-xm5',
    name: 'سارا محمدی',
    rating: 4,
    text: 'محصول خوبیه ولی قیمت یکم بالاست. در کل ارزش خرید داره.',
    date: '۱۴۰۳/۰۹/۱۷',
  },
  {
    id: 'rv-3',
    productId: 'ps5-pro',
    name: 'محمد کریمی',
    rating: 5,
    text: 'بهترین خریدی که تا حالا انجام دادم. حتماً پیشنهاد می‌کنم.',
    date: '۱۴۰۳/۰۹/۱۱',
    reply: 'خوشحالیم که راضی بودید.',
  },
  {
    id: 'rv-4',
    productId: 'airpods-pro-2',
    name: 'نگار موسوی',
    rating: 5,
    text: 'نویزکنسلینگ عالی و بسته‌بندی سالم رسید. فروشنده پاسخگو بود.',
    date: '۱۴۰۳/۰۹/۰۸',
  },
  {
    id: 'rv-5',
    productId: 'galaxy-s25-ultra',
    name: 'رضا کریمی',
    rating: 3,
    text: 'گوشی خوبه ولی ارسال یک روز دیرتر از موعد بود.',
    date: '۱۴۰۳/۰۹/۰۲',
  },
  {
    id: 'rv-6',
    productId: 'jbl-charge-5',
    name: 'حسین نادری',
    rating: 2,
    text: 'کالا سالم نبود و مجبور به مرجوعی شدم. پیگیری کنید.',
    date: '۱۴۰۳/۰۸/۲۹',
  },
]

export const defaultSellerPayouts: SellerPayout[] = [
  { id: 'PO-8841', date: '۱۴۰۳/۰۹/۱۵', amount: 86_400_000, status: 'paid' },
  { id: 'PO-8790', date: '۱۴۰۳/۰۹/۰۱', amount: 54_200_000, status: 'paid' },
  { id: 'PO-8712', date: '۱۴۰۳/۰۸/۱۵', amount: 71_800_000, status: 'paid' },
  { id: 'PO-8902', date: '۱۴۰۳/۰۹/۲۲', amount: 42_800_000, status: 'pending' },
]

export const defaultSellerSales: SellerSalesPoint[] = [
  { label: 'شنبه', value: 18_200_000 },
  { label: 'یکشنبه', value: 24_600_000 },
  { label: 'دوشنبه', value: 12_400_000 },
  { label: 'سه‌شنبه', value: 31_800_000 },
  { label: 'چهارشنبه', value: 27_100_000 },
  { label: 'پنجشنبه', value: 41_500_000 },
  { label: 'جمعه', value: 19_900_000 },
]

export const defaultSellerWallet = {
  available: 128_400_000,
  pending: 42_800_000,
  monthSales: 175_500_000,
}

export const sellerLowStockThreshold = 5
