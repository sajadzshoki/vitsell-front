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
  {
    id: 'gold',
    label: 'خرید طلای دیجیتال',
    icon: 'coins',
    to: '/category/watch',
  },
]

export const navSellerLink: NavQuickLink = {
  id: 'seller',
  label: 'فروشنده شو',
  to: '/account',
  accent: true,
}
