import { sellerNavItems } from '~/data/seller'

export function useSellerLayout() {
  const route = useRoute()
  const device = useDevice()
  const isMobile = computed(() => device.isMobile)

  const isDashboard = computed(
    () => route.path === '/seller' || route.path === '/seller/',
  )

  const isOrderDetail = computed(() =>
    /^\/seller\/orders\/[^/]+/.test(route.path),
  )

  const isProductCreate = computed(() =>
    route.path === '/seller/products/new' || route.path === '/seller/products/new/',
  )

  const pageTitle = computed(() => {
    if (isDashboard.value) {
      return 'پیشخوان فروشنده'
    }
    if (isOrderDetail.value) {
      return 'جزئیات سفارش'
    }
    if (isProductCreate.value) {
      return 'افزودن محصول'
    }
    const item = sellerNavItems.find(
      i => i.to !== '/seller' && (route.path === i.to || route.path.startsWith(`${i.to}/`)),
    )
    return item?.label ?? 'پنل فروشنده'
  })

  const showDesktopSidebar = computed(() => !isMobile.value)

  return {
    isMobile,
    isDashboard,
    isOrderDetail,
    isProductCreate,
    pageTitle,
    showDesktopSidebar,
  }
}
