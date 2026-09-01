export type SellerDashboardRangeId =
  | 'today'
  | 'yesterday'
  | 'last_7'
  | 'last_30'
  | 'this_month'
  | 'last_month'
  | 'custom'

export const sellerDashboardRangeOptions: {
  id: SellerDashboardRangeId
  label: string
}[] = [
  { id: 'today', label: 'امروز' },
  { id: 'yesterday', label: 'دیروز' },
  { id: 'last_7', label: '۷ روز اخیر' },
  { id: 'last_30', label: '۳۰ روز اخیر' },
  { id: 'this_month', label: 'این ماه' },
  { id: 'last_month', label: 'ماه قبل' },
  { id: 'custom', label: 'بازه سفارشی' },
]

export type SellerDashboardKpi = {
  id: string
  label: string
  value: string
  hint?: string
  delta?: number | null
  to?: string
  icon: string
  tone: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

export type SellerDashboardSeriesPoint = {
  label: string
  value: number
}

export type SellerDashboardNamedValue = {
  id: string
  label: string
  value: number
  meta?: string
}

export type SellerQuickAction = {
  id: string
  label: string
  icon: string
  to: string
  permission: string
}

export type SellerDashboardAlert = {
  id: string
  title: string
  description: string
  severity: 'warning' | 'error' | 'info'
  to: string
  count?: number
}

export const sellerDashboardQuickActions: SellerQuickAction[] = [
  { id: 'add-product', label: 'افزودن محصول', icon: 'i-tabler-plus', to: '/seller/products/new', permission: 'products.create' },
  { id: 'add-category', label: 'افزودن دسته', icon: 'i-tabler-category-plus', to: '/seller/categories/new', permission: 'categories.create' },
  { id: 'view-orders', label: 'سفارش‌ها', icon: 'i-tabler-shopping-bag', to: '/seller/orders', permission: 'orders.view' },
  { id: 'customers', label: 'مشتریان', icon: 'i-tabler-users', to: '/seller/customers', permission: 'customers.view' },
  { id: 'returns', label: 'مرجوعی‌ها', icon: 'i-tabler-arrow-back-up', to: '/seller/returns', permission: 'returns.view' },
  { id: 'add-promo', label: 'پروموشن', icon: 'i-tabler-discount-2', to: '/seller/promotions/codes/new', permission: 'promotions.create' },
  { id: 'add-banner', label: 'افزودن بنر', icon: 'i-tabler-photo', to: '/seller/banners/new', permission: 'banners.create' },
  { id: 'inventory', label: 'محصولات / موجودی', icon: 'i-tabler-packages', to: '/seller/products?status=out_of_stock', permission: 'products.view' },
  { id: 'questions', label: 'پرسش‌ها', icon: 'i-tabler-message-question', to: '/seller/questions', permission: 'questions.view' },
  { id: 'admins', label: 'کاربران ادمین', icon: 'i-tabler-user-shield', to: '/seller/admins', permission: 'admins.view' },
]
