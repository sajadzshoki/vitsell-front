/**
 * Scalable RBAC permission catalog for the seller/admin panel.
 * Backend abilities can later replace local role → permission resolution.
 */

export type SellerSystemRoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'CONTENT_MANAGER'
  | 'MARKETING_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SUPPORT_MANAGER'
  | 'SUPPORT_AGENT'
  | 'VIEWER'

/** @deprecated Prefer SellerSystemRoleKey — kept for Phase 0 imports */
export type SellerAdminRole = SellerSystemRoleKey

export type SellerPermission =
  | 'dashboard.view'
  | 'analytics.view'
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.import'
  | 'categories.view'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  | 'brands.view'
  | 'brands.create'
  | 'brands.update'
  | 'brands.delete'
  | 'attributes.view'
  | 'attributes.create'
  | 'attributes.update'
  | 'attributes.delete'
  | 'inventory.view'
  | 'inventory.update'
  | 'warehouses.view'
  | 'warehouses.create'
  | 'warehouses.update'
  | 'warehouses.delete'
  | 'orders.view'
  | 'orders.create'
  | 'orders.update'
  | 'orders.cancel'
  | 'orders.delete'
  | 'orders.refund'
  | 'orders.export'
  | 'returns.view'
  | 'returns.manage'
  | 'shipping.view'
  | 'shipping.manage'
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.export'
  | 'customers.block'
  | 'refunds.view'
  | 'refunds.create'
  | 'refunds.manage'
  | 'reviews.view'
  | 'reviews.moderate'
  | 'reviews.delete'
  | 'questions.view'
  | 'questions.answer'
  | 'questions.delete'
  | 'banners.view'
  | 'banners.create'
  | 'banners.update'
  | 'banners.delete'
  | 'deals.view'
  | 'deals.create'
  | 'deals.update'
  | 'deals.delete'
  | 'amazing_deals.view'
  | 'amazing_deals.create'
  | 'amazing_deals.update'
  | 'amazing_deals.delete'
  | 'promotions.view'
  | 'promotions.create'
  | 'promotions.update'
  | 'promotions.delete'
  | 'marketing.view'
  | 'marketing.manage'
  | 'discounts.view'
  | 'discounts.create'
  | 'discounts.update'
  | 'discounts.delete'
  | 'coupons.view'
  | 'coupons.create'
  | 'coupons.update'
  | 'coupons.delete'
  | 'campaigns.view'
  | 'campaigns.create'
  | 'campaigns.update'
  | 'campaigns.delete'
  | 'notifications.view'
  | 'notifications.create'
  | 'notifications.update'
  | 'notifications.delete'
  | 'notifications.send'
  | 'blog.view'
  | 'blog.create'
  | 'blog.update'
  | 'blog.delete'
  | 'blog.publish'
  | 'blog_categories.view'
  | 'blog_categories.create'
  | 'blog_categories.update'
  | 'blog_categories.delete'
  | 'blog_tags.view'
  | 'blog_tags.create'
  | 'blog_tags.update'
  | 'blog_tags.delete'
  | 'pages.view'
  | 'pages.create'
  | 'pages.update'
  | 'pages.delete'
  | 'pages.publish'
  | 'about.view'
  | 'about.update'
  | 'media.view'
  | 'media.upload'
  | 'media.update'
  | 'media.delete'
  | 'media.manage'
  | 'footer.view'
  | 'footer.update'
  | 'finance.view'
  | 'finance.manage'
  | 'transactions.view'
  | 'transactions.export'
  | 'payments.view'
  | 'payments.manage'
  | 'settlements.view'
  | 'settlements.manage'
  | 'finance_reports.view'
  | 'finance_reports.export'
  | 'financial_adjustments.create'
  | 'financial_reconciliation.view'
  | 'financial_reconciliation.manage'
  | 'admins.view'
  | 'admins.create'
  | 'admins.update'
  | 'admins.delete'
  | 'roles.view'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'permissions.view'
  | 'audit.view'
  | 'activity.view'
  | 'settings.view'
  | 'settings.update'
  | 'seo.view'
  | 'seo.update'
  | 'system.view'
  | 'system.manage'
  | 'navigation.view'
  | 'navigation.update'
  | 'mega_menu.view'
  | 'mega_menu.create'
  | 'mega_menu.update'
  | 'mega_menu.delete'
  | 'imports.view'
  | 'imports.create'
  | 'imports.manage'
  | 'exports.view'
  | 'exports.create'
  // Legacy aliases kept for Phase 0 call sites
  | 'admin_users.view'
  | 'admin_users.create'
  | 'admin_users.update'
  | 'admin_users.delete'
  | 'admin_users.manage'
  | 'audit_logs.view'
  | 'brands.manage'
  | 'attributes.manage'
  | 'warehouses.manage'
  | 'banners.manage'
  | 'deals.manage'
  | 'promotions.manage'
  | 'notifications.manage'
  | 'blog.manage'
  | 'pages.manage'
  | 'about.manage'
  | 'footer.manage'
  | 'admins.manage'
  | 'roles.manage'
  | 'questions.moderate'

export type SellerPermissionGroupId =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'marketing'
  | 'content'
  | 'finance'
  | 'administration'
  | 'analytics'
  | 'system'

export type SellerPermissionMeta = {
  key: SellerPermission
  label: string
  group: SellerPermissionGroupId
  /** Expanded into these when checking `can` */
  expandsTo?: SellerPermission[]
}

export const sellerPermissionGroups: {
  id: SellerPermissionGroupId
  label: string
}[] = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'products', label: 'محصولات و کاتالوگ' },
  { id: 'orders', label: 'سفارش‌ها' },
  { id: 'customers', label: 'مشتریان' },
  { id: 'inventory', label: 'موجودی و انبار' },
  { id: 'marketing', label: 'بازاریابی' },
  { id: 'content', label: 'محتوا' },
  { id: 'finance', label: 'مالی' },
  { id: 'administration', label: 'مدیریت دسترسی' },
  { id: 'analytics', label: 'تحلیل' },
  { id: 'system', label: 'سیستم' },
]

export const sellerPermissionCatalog: SellerPermissionMeta[] = [
  { key: 'dashboard.view', label: 'مشاهده داشبورد', group: 'overview' },
  { key: 'analytics.view', label: 'مشاهده تحلیل‌ها', group: 'analytics' },

  { key: 'products.view', label: 'مشاهده محصولات', group: 'products' },
  { key: 'products.create', label: 'ایجاد محصول', group: 'products' },
  { key: 'products.update', label: 'ویرایش محصول', group: 'products' },
  { key: 'products.delete', label: 'حذف محصول', group: 'products' },
  { key: 'products.import', label: 'ورود محصول (ایمپورت)', group: 'products' },
  { key: 'categories.view', label: 'مشاهده دسته‌ها', group: 'products' },
  { key: 'categories.create', label: 'ایجاد دسته', group: 'products' },
  { key: 'categories.update', label: 'ویرایش دسته', group: 'products' },
  { key: 'categories.delete', label: 'حذف دسته', group: 'products' },
  { key: 'brands.view', label: 'مشاهده برندها', group: 'products' },
  { key: 'brands.create', label: 'ایجاد برند', group: 'products' },
  { key: 'brands.update', label: 'ویرایش برند', group: 'products' },
  { key: 'brands.delete', label: 'حذف برند', group: 'products' },
  { key: 'brands.manage', label: 'مدیریت برندها (همه)', group: 'products', expandsTo: ['brands.create', 'brands.update', 'brands.delete'] },
  { key: 'attributes.view', label: 'مشاهده ویژگی‌ها', group: 'products' },
  { key: 'attributes.create', label: 'ایجاد ویژگی', group: 'products' },
  { key: 'attributes.update', label: 'ویرایش ویژگی', group: 'products' },
  { key: 'attributes.delete', label: 'حذف ویژگی', group: 'products' },
  { key: 'attributes.manage', label: 'مدیریت ویژگی‌ها (همه)', group: 'products', expandsTo: ['attributes.create', 'attributes.update', 'attributes.delete'] },

  { key: 'inventory.view', label: 'مشاهده موجودی', group: 'inventory' },
  { key: 'inventory.update', label: 'به‌روزرسانی موجودی', group: 'inventory' },
  { key: 'warehouses.view', label: 'مشاهده انبارها', group: 'inventory' },
  { key: 'warehouses.create', label: 'ایجاد انبار', group: 'inventory' },
  { key: 'warehouses.update', label: 'ویرایش انبار', group: 'inventory' },
  { key: 'warehouses.delete', label: 'حذف انبار', group: 'inventory' },
  { key: 'warehouses.manage', label: 'مدیریت انبارها (همه)', group: 'inventory', expandsTo: ['warehouses.create', 'warehouses.update', 'warehouses.delete'] },

  { key: 'orders.view', label: 'مشاهده سفارش‌ها', group: 'orders' },
  { key: 'orders.create', label: 'ایجاد سفارش', group: 'orders' },
  { key: 'orders.update', label: 'به‌روزرسانی سفارش', group: 'orders' },
  { key: 'orders.cancel', label: 'لغو سفارش', group: 'orders' },
  { key: 'orders.delete', label: 'حذف سفارش', group: 'orders' },
  { key: 'orders.refund', label: 'بازپرداخت سفارش', group: 'orders' },
  { key: 'orders.export', label: 'خروجی سفارش‌ها', group: 'orders' },
  { key: 'returns.view', label: 'مشاهده مرجوعی', group: 'orders' },
  { key: 'returns.manage', label: 'مدیریت مرجوعی', group: 'orders' },
  { key: 'shipping.view', label: 'مشاهده ارسال', group: 'orders' },
  { key: 'shipping.manage', label: 'مدیریت ارسال', group: 'orders' },

  { key: 'customers.view', label: 'مشاهده مشتریان', group: 'customers' },
  { key: 'customers.create', label: 'ایجاد مشتری', group: 'customers' },
  { key: 'customers.update', label: 'ویرایش مشتری', group: 'customers' },
  { key: 'customers.export', label: 'خروجی مشتریان', group: 'customers' },
  { key: 'customers.block', label: 'مسدود کردن مشتری', group: 'customers' },
  { key: 'refunds.view', label: 'مشاهده بازپرداخت‌ها', group: 'orders' },
  { key: 'refunds.create', label: 'ایجاد بازپرداخت', group: 'orders' },
  { key: 'refunds.manage', label: 'مدیریت بازپرداخت', group: 'orders' },
  { key: 'reviews.view', label: 'مشاهده نظرات', group: 'customers' },
  { key: 'reviews.moderate', label: 'مدیریت نظرات', group: 'customers' },
  { key: 'reviews.delete', label: 'حذف نظر', group: 'customers' },
  { key: 'questions.view', label: 'مشاهده پرسش‌ها', group: 'customers' },
  { key: 'questions.answer', label: 'پاسخ به پرسش', group: 'customers' },
  { key: 'questions.delete', label: 'حذف پرسش', group: 'customers' },
  { key: 'questions.moderate', label: 'مدیریت پرسش‌ها', group: 'customers', expandsTo: ['questions.answer', 'questions.delete'] },

  { key: 'banners.view', label: 'مشاهده بنرها', group: 'marketing' },
  { key: 'banners.create', label: 'ایجاد بنر', group: 'marketing' },
  { key: 'banners.update', label: 'ویرایش بنر', group: 'marketing' },
  { key: 'banners.delete', label: 'حذف بنر', group: 'marketing' },
  { key: 'banners.manage', label: 'مدیریت بنرها (همه)', group: 'marketing', expandsTo: ['banners.create', 'banners.update', 'banners.delete'] },
  { key: 'marketing.view', label: 'مشاهده داشبورد بازاریابی', group: 'marketing' },
  { key: 'marketing.manage', label: 'مدیریت بازاریابی (همه)', group: 'marketing', expandsTo: [
    'marketing.view',
    'discounts.view', 'discounts.create', 'discounts.update', 'discounts.delete',
    'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.update', 'campaigns.delete',
    'banners.view', 'banners.create', 'banners.update', 'banners.delete',
    'deals.view', 'deals.create', 'deals.update', 'deals.delete',
    'promotions.view', 'promotions.create', 'promotions.update', 'promotions.delete',
    'notifications.view', 'notifications.create', 'notifications.update', 'notifications.delete', 'notifications.send',
  ] },
  { key: 'discounts.view', label: 'مشاهده تخفیف‌ها', group: 'marketing' },
  { key: 'discounts.create', label: 'ایجاد تخفیف', group: 'marketing' },
  { key: 'discounts.update', label: 'ویرایش تخفیف', group: 'marketing' },
  { key: 'discounts.delete', label: 'حذف تخفیف', group: 'marketing' },
  { key: 'coupons.view', label: 'مشاهده کوپن‌ها', group: 'marketing' },
  { key: 'coupons.create', label: 'ایجاد کوپن', group: 'marketing' },
  { key: 'coupons.update', label: 'ویرایش کوپن', group: 'marketing' },
  { key: 'coupons.delete', label: 'حذف کوپن', group: 'marketing' },
  { key: 'campaigns.view', label: 'مشاهده کمپین‌ها', group: 'marketing' },
  { key: 'campaigns.create', label: 'ایجاد کمپین', group: 'marketing' },
  { key: 'campaigns.update', label: 'ویرایش کمپین', group: 'marketing' },
  { key: 'campaigns.delete', label: 'حذف کمپین', group: 'marketing' },
  { key: 'deals.view', label: 'مشاهده شگفت‌انگیزها', group: 'marketing' },
  { key: 'deals.create', label: 'ایجاد شگفت‌انگیز', group: 'marketing' },
  { key: 'deals.update', label: 'ویرایش شگفت‌انگیز', group: 'marketing' },
  { key: 'deals.delete', label: 'حذف شگفت‌انگیز', group: 'marketing' },
  { key: 'deals.manage', label: 'مدیریت شگفت‌انگیزها (همه)', group: 'marketing', expandsTo: ['deals.create', 'deals.update', 'deals.delete'] },
  { key: 'amazing_deals.view', label: 'مشاهده شگفت‌انگیز (alias)', group: 'marketing', expandsTo: ['deals.view'] },
  { key: 'amazing_deals.create', label: 'ایجاد شگفت‌انگیز (alias)', group: 'marketing', expandsTo: ['deals.create'] },
  { key: 'amazing_deals.update', label: 'ویرایش شگفت‌انگیز (alias)', group: 'marketing', expandsTo: ['deals.update'] },
  { key: 'amazing_deals.delete', label: 'حذف شگفت‌انگیز (alias)', group: 'marketing', expandsTo: ['deals.delete'] },
  { key: 'promotions.view', label: 'مشاهده پروموشن‌ها', group: 'marketing' },
  { key: 'promotions.create', label: 'ایجاد پروموشن', group: 'marketing' },
  { key: 'promotions.update', label: 'ویرایش پروموشن', group: 'marketing' },
  { key: 'promotions.delete', label: 'حذف پروموشن', group: 'marketing' },
  { key: 'promotions.manage', label: 'مدیریت پروموشن (همه)', group: 'marketing', expandsTo: ['promotions.create', 'promotions.update', 'promotions.delete', 'coupons.create', 'coupons.update', 'coupons.delete'] },
  { key: 'notifications.view', label: 'مشاهده اعلان‌ها', group: 'marketing' },
  { key: 'notifications.create', label: 'ایجاد اعلان', group: 'marketing' },
  { key: 'notifications.update', label: 'ویرایش اعلان', group: 'marketing' },
  { key: 'notifications.delete', label: 'حذف اعلان', group: 'marketing' },
  { key: 'notifications.send', label: 'ارسال اعلان', group: 'marketing' },
  { key: 'notifications.manage', label: 'مدیریت اعلان‌ها (همه)', group: 'marketing', expandsTo: ['notifications.create', 'notifications.update', 'notifications.delete', 'notifications.send'] },
  { key: 'blog.view', label: 'مشاهده وبلاگ', group: 'content' },
  { key: 'blog.create', label: 'ایجاد مطلب', group: 'content' },
  { key: 'blog.update', label: 'ویرایش مطلب', group: 'content' },
  { key: 'blog.delete', label: 'حذف مطلب', group: 'content' },
  { key: 'blog.publish', label: 'انتشار مطلب', group: 'content' },
  { key: 'blog.manage', label: 'مدیریت وبلاگ (همه)', group: 'content', expandsTo: ['blog.create', 'blog.update', 'blog.delete', 'blog.publish'] },
  { key: 'blog_categories.view', label: 'مشاهده دسته‌های بلاگ', group: 'content' },
  { key: 'blog_categories.create', label: 'ایجاد دسته بلاگ', group: 'content' },
  { key: 'blog_categories.update', label: 'ویرایش دسته بلاگ', group: 'content' },
  { key: 'blog_categories.delete', label: 'حذف دسته بلاگ', group: 'content' },
  { key: 'blog_tags.view', label: 'مشاهده برچسب‌های بلاگ', group: 'content' },
  { key: 'blog_tags.create', label: 'ایجاد برچسب بلاگ', group: 'content' },
  { key: 'blog_tags.update', label: 'ویرایش برچسب بلاگ', group: 'content' },
  { key: 'blog_tags.delete', label: 'حذف برچسب بلاگ', group: 'content' },
  { key: 'pages.view', label: 'مشاهده صفحات', group: 'content' },
  { key: 'pages.create', label: 'ایجاد صفحه', group: 'content' },
  { key: 'pages.update', label: 'ویرایش صفحه', group: 'content' },
  { key: 'pages.delete', label: 'حذف صفحه', group: 'content' },
  { key: 'pages.publish', label: 'انتشار صفحه', group: 'content' },
  { key: 'pages.manage', label: 'مدیریت صفحات (همه)', group: 'content', expandsTo: ['pages.create', 'pages.update', 'pages.delete', 'pages.publish'] },
  { key: 'about.view', label: 'مشاهده درباره ما', group: 'content' },
  { key: 'about.update', label: 'ویرایش درباره ما', group: 'content' },
  { key: 'about.manage', label: 'مدیریت درباره ما', group: 'content', expandsTo: ['about.update'] },
  { key: 'media.view', label: 'مشاهده رسانه', group: 'content' },
  { key: 'media.upload', label: 'آپلود رسانه', group: 'content' },
  { key: 'media.update', label: 'ویرایش رسانه', group: 'content' },
  { key: 'media.delete', label: 'حذف رسانه', group: 'content' },
  { key: 'media.manage', label: 'مدیریت رسانه (همه)', group: 'content', expandsTo: ['media.view', 'media.upload', 'media.update', 'media.delete'] },
  { key: 'footer.view', label: 'مشاهده فوتر', group: 'content' },
  { key: 'footer.update', label: 'ویرایش فوتر', group: 'content' },
  { key: 'footer.manage', label: 'مدیریت فوتر', group: 'content', expandsTo: ['footer.update'] },

  { key: 'finance.view', label: 'مشاهده مالی', group: 'finance' },
  { key: 'finance.manage', label: 'مدیریت مالی', group: 'finance', expandsTo: ['payments.manage', 'settlements.manage'] },
  { key: 'transactions.view', label: 'مشاهده تراکنش‌ها', group: 'finance' },
  { key: 'transactions.export', label: 'خروجی تراکنش‌ها', group: 'finance' },
  { key: 'payments.view', label: 'مشاهده پرداخت‌ها', group: 'finance' },
  { key: 'payments.manage', label: 'مدیریت پرداخت‌ها', group: 'finance' },
  { key: 'settlements.view', label: 'مشاهده تسویه‌ها', group: 'finance' },
  { key: 'settlements.manage', label: 'مدیریت تسویه‌ها', group: 'finance' },
  { key: 'finance_reports.view', label: 'مشاهده گزارش مالی', group: 'finance' },
  { key: 'finance_reports.export', label: 'خروجی گزارش مالی', group: 'finance' },
  { key: 'financial_adjustments.create', label: 'ایجاد تعدیل مالی', group: 'finance' },
  { key: 'financial_reconciliation.view', label: 'مشاهده مغایرت‌گیری', group: 'finance' },
  { key: 'financial_reconciliation.manage', label: 'مدیریت مغایرت‌گیری', group: 'finance' },

  { key: 'admins.view', label: 'مشاهده ادمین‌ها', group: 'administration' },
  { key: 'admins.create', label: 'ایجاد ادمین', group: 'administration' },
  { key: 'admins.update', label: 'ویرایش ادمین', group: 'administration' },
  { key: 'admins.delete', label: 'حذف/غیرفعال ادمین', group: 'administration' },
  { key: 'admins.manage', label: 'مدیریت ادمین‌ها (همه)', group: 'administration', expandsTo: ['admins.create', 'admins.update', 'admins.delete'] },
  { key: 'roles.view', label: 'مشاهده نقش‌ها', group: 'administration' },
  { key: 'roles.create', label: 'ایجاد نقش', group: 'administration' },
  { key: 'roles.update', label: 'ویرایش نقش', group: 'administration' },
  { key: 'roles.delete', label: 'حذف نقش', group: 'administration' },
  { key: 'roles.manage', label: 'مدیریت نقش‌ها (همه)', group: 'administration', expandsTo: ['roles.create', 'roles.update', 'roles.delete'] },
  { key: 'permissions.view', label: 'مشاهده کاتالوگ دسترسی‌ها', group: 'administration' },
  { key: 'audit.view', label: 'مشاهده لاگ حسابرسی', group: 'administration' },
  { key: 'activity.view', label: 'مشاهده لاگ فعالیت', group: 'administration' },

  { key: 'settings.view', label: 'مشاهده تنظیمات', group: 'system' },
  { key: 'settings.update', label: 'ویرایش تنظیمات', group: 'system' },
  { key: 'seo.view', label: 'مشاهده سئو', group: 'system' },
  { key: 'seo.update', label: 'ویرایش سئو', group: 'system' },
  { key: 'system.view', label: 'مشاهده نمای سیستم', group: 'system' },
  { key: 'system.manage', label: 'مدیریت پیکربندی سیستم', group: 'system', expandsTo: ['settings.update', 'navigation.update'] },
  { key: 'navigation.view', label: 'مشاهده منوی عمومی', group: 'system' },
  { key: 'navigation.update', label: 'ویرایش منوی عمومی', group: 'system' },
  { key: 'mega_menu.view', label: 'مشاهده مگا منو', group: 'system' },
  { key: 'mega_menu.create', label: 'ایجاد مگا منو', group: 'system' },
  { key: 'mega_menu.update', label: 'ویرایش مگا منو', group: 'system' },
  { key: 'mega_menu.delete', label: 'حذف مگا منو', group: 'system' },
]

const catalogByKey = Object.fromEntries(
  sellerPermissionCatalog.map(item => [item.key, item]),
) as Record<SellerPermission, SellerPermissionMeta>

export const sellerAllPermissions: SellerPermission[] = sellerPermissionCatalog.map(p => p.key)

/** Permissions shown in role editor (hide legacy .manage aliases that expand) */
export const sellerEditablePermissions: SellerPermission[] = sellerPermissionCatalog
  .filter(p => !p.expandsTo)
  .map(p => p.key)

export function permissionLabel(key: SellerPermission) {
  return catalogByKey[key]?.label ?? key
}

export function permissionsInGroup(group: SellerPermissionGroupId) {
  return sellerPermissionCatalog.filter(p => p.group === group && !p.expandsTo)
}

/** Map nav item / module id → minimum permission to see the link */
export const sellerNavPermissionMap: Record<string, SellerPermission> = {
  dashboard: 'dashboard.view',
  products: 'products.view',
  product_tags: 'products.view',
  importer_technolife: 'products.import',
  categories: 'categories.view',
  brands: 'brands.view',
  attributes: 'attributes.view',
  inventory: 'inventory.view',
  warehouses: 'warehouses.view',
  orders: 'orders.view',
  returns: 'returns.view',
  refunds: 'refunds.view',
  shipping: 'shipping.view',
  customers: 'customers.view',
  reviews: 'reviews.view',
  questions: 'questions.view',
  banners: 'banners.view',
  deals: 'deals.view',
  promotions: 'promotions.view',
  notifications: 'notifications.view',
  marketing: 'marketing.view',
  discounts: 'discounts.view',
  campaigns: 'campaigns.view',
  blog: 'blog.view',
  pages: 'pages.view',
  about: 'about.view',
  faq: 'pages.view',
  media: 'media.view',
  footer: 'footer.view',
  finance: 'finance.view',
  finance_transactions: 'transactions.view',
  finance_payments: 'payments.view',
  finance_settlements: 'settlements.view',
  finance_reconciliation: 'financial_reconciliation.view',
  finance_adjustments: 'finance.view',
  finance_reports: 'finance_reports.view',
  finance_gateways: 'finance.view',
  analytics: 'analytics.view',
  admins: 'admins.view',
  roles: 'roles.view',
  audit: 'audit.view',
  activity: 'activity.view',
  shop: 'settings.view',
  settings: 'settings.view',
  system: 'system.view',
  navigation: 'navigation.view',
  mega_menu: 'mega_menu.view',
  permissions: 'permissions.view',
  seo: 'seo.view',
  account: 'dashboard.view',
}

/** Page path prefix → required view permission */
export const sellerRoutePermissionMap: { prefix: string, permission: SellerPermission }[] = [
  { prefix: '/seller/importer', permission: 'products.import' },
  { prefix: '/seller/products/tags', permission: 'products.view' },
  { prefix: '/seller/products', permission: 'products.view' },
  { prefix: '/seller/categories', permission: 'categories.view' },
  { prefix: '/seller/brands', permission: 'brands.view' },
  { prefix: '/seller/attributes', permission: 'attributes.view' },
  { prefix: '/seller/orders', permission: 'orders.view' },
  { prefix: '/seller/customers', permission: 'customers.view' },
  { prefix: '/seller/returns', permission: 'returns.view' },
  { prefix: '/seller/refunds', permission: 'refunds.view' },
  { prefix: '/seller/shipping', permission: 'shipping.view' },
  { prefix: '/seller/reviews', permission: 'reviews.view' },
  { prefix: '/seller/questions', permission: 'questions.view' },
  { prefix: '/seller/finance/transactions', permission: 'transactions.view' },
  { prefix: '/seller/finance/payments', permission: 'payments.view' },
  { prefix: '/seller/finance/settlements', permission: 'settlements.view' },
  { prefix: '/seller/finance/reconciliation', permission: 'financial_reconciliation.view' },
  { prefix: '/seller/finance/adjustments', permission: 'finance.view' },
  { prefix: '/seller/finance/reports', permission: 'finance_reports.view' },
  { prefix: '/seller/finance/gateways', permission: 'finance.view' },
  { prefix: '/seller/finance', permission: 'finance.view' },
  { prefix: '/seller/banners', permission: 'banners.view' },
  { prefix: '/seller/deals', permission: 'deals.view' },
  { prefix: '/seller/promotions', permission: 'promotions.view' },
  { prefix: '/seller/notifications', permission: 'notifications.view' },
  { prefix: '/seller/marketing', permission: 'marketing.view' },
  { prefix: '/seller/discounts', permission: 'discounts.view' },
  { prefix: '/seller/campaigns', permission: 'campaigns.view' },
  { prefix: '/seller/blog/categories', permission: 'blog_categories.view' },
  { prefix: '/seller/blog/tags', permission: 'blog_tags.view' },
  { prefix: '/seller/blog', permission: 'blog.view' },
  { prefix: '/seller/pages', permission: 'pages.view' },
  { prefix: '/seller/faq', permission: 'pages.view' },
  { prefix: '/seller/about', permission: 'about.view' },
  { prefix: '/seller/seo', permission: 'seo.view' },
  { prefix: '/seller/media', permission: 'media.view' },
  { prefix: '/seller/footer', permission: 'footer.view' },
  { prefix: '/seller/system', permission: 'system.view' },
  { prefix: '/seller/settings', permission: 'settings.view' },
  { prefix: '/seller/navigation', permission: 'navigation.view' },
  { prefix: '/seller/mega-menus', permission: 'mega_menu.view' },
  { prefix: '/seller/roles/permissions', permission: 'permissions.view' },
  { prefix: '/seller/activity', permission: 'activity.view' },
  { prefix: '/seller/shop', permission: 'settings.view' },
  { prefix: '/seller/admins', permission: 'admins.view' },
  { prefix: '/seller/roles', permission: 'roles.view' },
  { prefix: '/seller/audit', permission: 'audit.view' },
  { prefix: '/seller/inventory', permission: 'inventory.view' },
  { prefix: '/seller/warehouses', permission: 'warehouses.view' },
]

function uniquePermissions(list: SellerPermission[]) {
  return [...new Set(list)]
}

function expandPermission(key: SellerPermission): SellerPermission[] {
  const meta = catalogByKey[key]
  if (!meta?.expandsTo?.length) return [key]
  return uniquePermissions([key, ...meta.expandsTo.flatMap(expandPermission)])
}

export function expandPermissions(list: SellerPermission[]): SellerPermission[] {
  return uniquePermissions(list.flatMap(expandPermission))
}

const viewOnly = sellerEditablePermissions.filter(p => p.endsWith('.view') || p === 'analytics.view')

export const sellerDefaultRolePermissions: Record<SellerSystemRoleKey, SellerPermission[]> = {
  SUPER_ADMIN: [...sellerAllPermissions],
  ADMIN: sellerAllPermissions.filter(p => ![
    'roles.create', 'roles.update', 'roles.delete', 'roles.manage',
    'admins.create', 'admins.update', 'admins.delete', 'admins.manage',
  ].includes(p)),
  PRODUCT_MANAGER: [
    'dashboard.view', 'analytics.view',
    'products.view', 'products.create', 'products.update', 'products.delete', 'products.import',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'brands.view', 'brands.create', 'brands.update', 'brands.delete',
    'attributes.view', 'attributes.create', 'attributes.update', 'attributes.delete',
    'inventory.view', 'inventory.update',
    'warehouses.view', 'warehouses.create', 'warehouses.update', 'warehouses.delete',
    'media.view', 'media.manage', 'seo.view', 'seo.update',
    'mega_menu.view', 'mega_menu.create', 'mega_menu.update', 'mega_menu.delete',
  ],
  ORDER_MANAGER: [
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update', 'orders.cancel', 'orders.delete', 'orders.refund', 'orders.export',
    'returns.view', 'returns.manage', 'shipping.view', 'shipping.manage',
    'refunds.view', 'refunds.create', 'refunds.manage',
    'customers.view', 'customers.create', 'customers.update', 'customers.export', 'customers.block',
    'products.view', 'inventory.view',
  ],
  CONTENT_MANAGER: [
    'dashboard.view',
    'blog.view', 'blog.create', 'blog.update', 'blog.delete', 'blog.publish',
    'blog_categories.view', 'blog_categories.create', 'blog_categories.update', 'blog_categories.delete',
    'blog_tags.view', 'blog_tags.create', 'blog_tags.update', 'blog_tags.delete',
    'pages.view', 'pages.create', 'pages.update', 'pages.delete', 'pages.publish',
    'about.view', 'about.update', 'media.view', 'media.manage',
    'footer.view', 'footer.update',
    'banners.view', 'banners.create', 'banners.update', 'banners.delete',
    'seo.view', 'seo.update',
    'mega_menu.view', 'mega_menu.create', 'mega_menu.update', 'mega_menu.delete',
    'navigation.view', 'navigation.update',
  ],
  MARKETING_MANAGER: [
    'dashboard.view', 'analytics.view',
    'marketing.view', 'marketing.manage',
    'banners.view', 'banners.create', 'banners.update', 'banners.delete',
    'deals.view', 'deals.create', 'deals.update', 'deals.delete',
    'discounts.view', 'discounts.create', 'discounts.update', 'discounts.delete',
    'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
    'campaigns.view', 'campaigns.create', 'campaigns.update', 'campaigns.delete',
    'promotions.view', 'promotions.create', 'promotions.update', 'promotions.delete',
    'notifications.view', 'notifications.create', 'notifications.update', 'notifications.delete', 'notifications.send',
    'media.view', 'media.manage',
    'products.view', 'categories.view', 'brands.view',
  ],
  FINANCE_MANAGER: [
    'dashboard.view', 'analytics.view',
    'finance.view', 'finance.manage',
    'transactions.view', 'transactions.export',
    'payments.view', 'payments.manage',
    'settlements.view', 'settlements.manage',
    'finance_reports.view', 'finance_reports.export',
    'financial_adjustments.create',
    'financial_reconciliation.view', 'financial_reconciliation.manage',
    'refunds.view', 'refunds.create', 'refunds.manage',
    'orders.view', 'orders.export',
    'customers.view',
  ],
  SUPPORT_MANAGER: [
    'dashboard.view',
    'orders.view', 'orders.export', 'orders.update',
    'returns.view', 'returns.manage',
    'refunds.view',
    'customers.view', 'customers.create', 'customers.update', 'customers.export',
    'reviews.view', 'reviews.moderate', 'reviews.delete',
    'questions.view', 'questions.answer', 'questions.delete',
    'shipping.view',
    'products.view',
  ],
  /** @deprecated Prefer SUPPORT_MANAGER — same defaults for backward compatibility */
  SUPPORT_AGENT: [
    'dashboard.view',
    'orders.view', 'orders.export',
    'returns.view',
    'refunds.view',
    'customers.view', 'customers.create', 'customers.update', 'customers.export',
    'reviews.view', 'reviews.moderate', 'reviews.delete',
    'questions.view', 'questions.answer', 'questions.delete',
    'products.view',
  ],
  VIEWER: [...viewOnly],
}

/** @deprecated use sellerDefaultRolePermissions */
export const sellerRolePermissions = sellerDefaultRolePermissions

export function resolveSellerAdminRole(accountRole: string | null | undefined): SellerSystemRoleKey | null {
  if (accountRole === 'admin') return 'SUPER_ADMIN'
  return null
}

export function permissionsForRole(role: SellerSystemRoleKey): SellerPermission[] {
  return expandPermissions(sellerDefaultRolePermissions[role] ?? [])
}

export function setHasPermission(set: Set<SellerPermission>, permission: SellerPermission) {
  if (set.has(permission)) return true
  const meta = catalogByKey[permission]
  if (meta?.expandsTo?.length) {
    return meta.expandsTo.every(p => setHasPermission(set, p))
  }
  // Having a manage/alias that expands to this permission
  for (const item of sellerPermissionCatalog) {
    if (item.expandsTo?.includes(permission) && set.has(item.key)) return true
  }
  // questions.moderate ↔ answer
  if (permission === 'questions.answer' && set.has('questions.moderate')) return true
  if (permission === 'questions.moderate' && set.has('questions.answer')) return true
  // coupons ↔ promotions (codes live under promotions)
  if (permission.startsWith('coupons.') && set.has(permission.replace('coupons.', 'promotions.') as SellerPermission)) return true
  if (permission.startsWith('promotions.') && set.has(permission.replace('promotions.', 'coupons.') as SellerPermission)) return true
  // Legacy import/export hubs → section permissions
  if (permission === 'imports.view' || permission === 'imports.create' || permission === 'imports.manage') {
    if (
      setHasPermission(set, 'products.import')
      || setHasPermission(set, 'products.create')
      || setHasPermission(set, 'categories.create')
      || setHasPermission(set, 'brands.create')
      || setHasPermission(set, 'inventory.update')
    ) return true
  }
  if (permission === 'exports.view' || permission === 'exports.create') {
    if (
      setHasPermission(set, 'products.view')
      || setHasPermission(set, 'orders.view')
      || setHasPermission(set, 'orders.export')
      || setHasPermission(set, 'customers.view')
      || setHasPermission(set, 'customers.export')
    ) return true
  }
  // Reverse: legacy hub grants on related section actions
  if (
    (permission === 'products.create'
      || permission === 'categories.create'
      || permission === 'brands.create'
      || permission === 'inventory.update')
    && (set.has('imports.create') || set.has('imports.manage') || set.has('imports.view'))
  ) return true
  if (
    (permission === 'orders.export' || permission === 'customers.export')
    && (set.has('exports.create') || set.has('exports.view'))
  ) return true
  // admin_users.* ↔ admins.*
  if (permission.startsWith('admin_users.')) {
    const mapped = permission.replace('admin_users.', 'admins.') as SellerPermission
    if (setHasPermission(set, mapped)) return true
  }
  if (permission.startsWith('admins.') && set.has(permission.replace('admins.', 'admin_users.') as SellerPermission)) return true
  // audit_logs.view ↔ audit.view
  if (permission === 'audit_logs.view' && set.has('audit.view')) return true
  if (permission === 'audit.view' && set.has('audit_logs.view')) return true
  return false
}
