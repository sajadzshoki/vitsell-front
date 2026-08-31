export type NavQuickLink = {
  id: string
  label: string
  icon?: string
  to?: string
  badge?: string
  accent?: boolean
}

/** Secondary navbar links (below main bar) */
export const navQuickLinks: NavQuickLink[] = [
  {
    id: 'categories',
    label: 'دسته بندی محصولات',
    icon: 'menu-2',
    to: '/category',
  },
  {
    id: 'corporate',
    label: 'خرید سازمانی',
    icon: 'building-store',
    to: '/category/home',
  },
  {
    id: 'gift-card',
    label: 'کارت هدیه',
    icon: 'gift',
    to: '/category/fashion',
  },
  {
    id: 'stock',
    label: 'کالاهای استوک',
    icon: 'package',
    to: '/category/laptop',
    badge: 'جدید',
  },
  {
    id: 'installment',
    label: 'خرید اقساطی',
    icon: 'wallet',
    to: '/category/mobile',
  },
  // {
  //   id: 'gold',
  //   label: 'خرید طلای دیجیتال',
  //   icon: 'coins',
  //   to: '/category/watch',
  // },
]

export const navSellerLink: NavQuickLink = {
  id: 'seller',
  label: 'پنل مدیریت',
  to: '/seller',
  accent: true,
}

export type BottomNavItem = {
  id: string
  label: string
  icon: string
  iconActive?: string
  to?: string
  badge?: 'cart'
}

/** Mobile bottom navigation (Digikala-style) */
export const bottomNavItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'خانه',
    icon: 'home',
    iconActive: 'home-filled',
    to: '/',
  },
  {
    id: 'categories',
    label: 'دسته‌ها',
    icon: 'layout-grid',
    iconActive: 'layout-grid-filled',
    to: '/category',
  },
  {
    id: 'cart',
    label: 'سبد خرید',
    icon: 'shopping-cart',
    iconActive: 'shopping-cart-filled',
    to: '/cart',
    badge: 'cart',
  },
  {
    id: 'account',
    label: 'حساب من',
    icon: 'user',
    iconActive: 'user-filled',
    to: '/account',
  },
]

