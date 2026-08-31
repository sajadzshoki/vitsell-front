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

  const isCategoryCreate = computed(() =>
    route.path === '/seller/categories/new' || route.path === '/seller/categories/new/',
  )

  const isCategoryEdit = computed(() =>
    /^\/seller\/categories\/[^/]+/.test(route.path) && !isCategoryCreate.value,
  )

  const isBannerCreate = computed(() =>
    route.path === '/seller/banners/new' || route.path === '/seller/banners/new/',
  )

  const isBannerEdit = computed(() =>
    /^\/seller\/banners\/[^/]+/.test(route.path) && !isBannerCreate.value,
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
    if (isCategoryCreate.value) {
      return 'افزودن دسته‌بندی'
    }
    if (isCategoryEdit.value) {
      return 'ویرایش دسته‌بندی'
    }
    if (isBannerCreate.value) {
      return 'افزودن بنر'
    }
    if (isBannerEdit.value) {
      return 'ویرایش بنر'
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
    isCategoryCreate,
    isCategoryEdit,
    isBannerCreate,
    isBannerEdit,
    pageTitle,
    showDesktopSidebar,
  }
}
