export type SellerTabId =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'reviews'
  | 'finance'
  | 'shop'

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

export type SellerOrder = {
  id: string
  date: string
  status: SellerOrderStatus
  customerName: string
  customerPhone: string
  city: string
  items: SellerOrderItem[]
  total: number
  shippingMethod: string
  paymentMethod: string
}

export type SellerReview = {
  id: string
  productId: string
  name: string
  rating: number
  text: string
  date: string
  reply?: string
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
}

export type SellerSalesPoint = {
  label: string
  value: number
}

export const defaultSellerShop: SellerShop = {
  name: 'فروشگاه آریا',
  slug: 'arya-store',
  phone: '09121234567',
  email: 'seller@digishop.ir',
  city: 'تهران',
  about:
    'عرضه‌کننده محصولات دیجیتال اصل با گارانتی معتبر، ارسال سریع از انبار تهران و پشتیبانی اختصاصی فروشنده.',
  rating: 4.7,
  reviewCount: 1284,
  joinDate: '۱۴۰۲/۰۳/۱۸',
}

export const sellerNavItems: {
  id: SellerTabId
  label: string
  icon: string
  to: string
}[] = [
  { id: 'dashboard', label: 'پیشخوان فروشنده', icon: 'i-tabler-layout-dashboard', to: '/seller' },
  { id: 'products', label: 'محصولات', icon: 'i-tabler-package', to: '/seller/products' },
  { id: 'orders', label: 'سفارش‌های فروشگاه', icon: 'i-tabler-shopping-bag', to: '/seller/orders' },
  { id: 'reviews', label: 'نظرات مشتریان', icon: 'i-tabler-message-2', to: '/seller/reviews' },
  { id: 'finance', label: 'مالی و تسویه', icon: 'i-tabler-wallet', to: '/seller/finance' },
  { id: 'shop', label: 'تنظیمات فروشگاه', icon: 'i-tabler-building-store', to: '/seller/shop' },
]

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
  { label: string; color: 'success' | 'info' | 'warning' | 'primary' | 'error' | 'neutral'; icon: string }
> = {
  new: { label: 'سفارش جدید', color: 'warning', icon: 'i-tabler-bell' },
  packing: { label: 'در حال آماده‌سازی', color: 'info', icon: 'i-tabler-box' },
  shipped: { label: 'ارسال شده', color: 'primary', icon: 'i-tabler-truck-delivery' },
  delivered: { label: 'تحویل شده', color: 'success', icon: 'i-tabler-check' },
  returned: { label: 'مرجوعی', color: 'error', icon: 'i-tabler-arrow-back-up' },
  cancelled: { label: 'لغو شده', color: 'neutral', icon: 'i-tabler-x' },
}

export const sellerOrderNextStatus: Partial<Record<SellerOrderStatus, SellerOrderStatus>> = {
  new: 'packing',
  packing: 'shipped',
  shipped: 'delivered',
}

export const sellerOrderActionLabel: Partial<Record<SellerOrderStatus, string>> = {
  new: 'شروع آماده‌سازی',
  packing: 'ارسال سفارش',
  shipped: 'ثبت تحویل',
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
    status: 'new',
    customerName: 'نگار موسوی',
    customerPhone: '09123334455',
    city: 'تهران',
    items: [{ productId: 'iphone-16-pro', qty: 1, price: 89_900_000 }],
    total: 89_900_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20408',
    date: '۱۴۰۳/۰۹/۲۱',
    status: 'packing',
    customerName: 'رضا کریمی',
    customerPhone: '09351234567',
    city: 'کرج',
    items: [
      { productId: 'sony-xm5', qty: 1, price: 18_500_000 },
      { productId: 'airpods-pro-2', qty: 1, price: 12_400_000 },
    ],
    total: 30_900_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20391',
    date: '۱۴۰۳/۰۹/۱۸',
    status: 'shipped',
    customerName: 'سارا محمدی',
    customerPhone: '09127654321',
    city: 'اصفهان',
    items: [{ productId: 'galaxy-s25-ultra', qty: 1, price: 72_400_000 }],
    total: 72_400_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20370',
    date: '۱۴۰۳/۰۹/۱۲',
    status: 'delivered',
    customerName: 'امیر حسینی',
    customerPhone: '09199887766',
    city: 'مشهد',
    items: [{ productId: 'ps5-pro', qty: 1, price: 32_500_000 }],
    total: 32_500_000,
    shippingMethod: 'تیپاکس',
    paymentMethod: 'پرداخت در محل',
  },
  {
    id: 'SL-20355',
    date: '۱۴۰۳/۰۹/۰۵',
    status: 'delivered',
    customerName: 'مینا رضایی',
    customerPhone: '09211223344',
    city: 'شیراز',
    items: [{ productId: 'macbook-m4', qty: 1, price: 145_000_000 }],
    total: 145_000_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20312',
    date: '۱۴۰۳/۰۸/۲۸',
    status: 'returned',
    customerName: 'حسین نادری',
    customerPhone: '09370001122',
    city: 'تبریز',
    items: [{ productId: 'jbl-charge-5', qty: 1, price: 7_400_000 }],
    total: 7_400_000,
    shippingMethod: 'پست پیشتاز',
    paymentMethod: 'پرداخت آنلاین',
  },
  {
    id: 'SL-20288',
    date: '۱۴۰۳/۰۸/۱۹',
    status: 'cancelled',
    customerName: 'پارسا احمدی',
    customerPhone: '09120001122',
    city: 'اهواز',
    items: [{ productId: 'apple-watch-ultra', qty: 1, price: 21_800_000 }],
    total: 21_800_000,
    shippingMethod: 'پیک اکسپرس',
    paymentMethod: 'پرداخت آنلاین',
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
