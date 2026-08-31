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

  const isProductDetail = computed(() =>
    /^\/seller\/products\/[^/]+/.test(route.path) && !isProductCreate.value,
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

  const isBlogCreate = computed(() =>
    route.path === '/seller/blog/new' || route.path === '/seller/blog/new/',
  )

  const isBlogEdit = computed(() =>
    /^\/seller\/blog\/[^/]+/.test(route.path) && !isBlogCreate.value,
  )

  const isDealCreate = computed(() =>
    route.path === '/seller/deals/new' || route.path === '/seller/deals/new/',
  )

  const isDealEdit = computed(() =>
    /^\/seller\/deals\/[^/]+/.test(route.path) && !isDealCreate.value,
  )

  const isNotificationCreate = computed(() =>
    route.path === '/seller/notifications/new'
    || route.path === '/seller/notifications/new/',
  )

  const isPromoCodeCreate = computed(() =>
    route.path === '/seller/promotions/codes/new'
    || route.path === '/seller/promotions/codes/new/',
  )

  const isPromoCodeEdit = computed(() =>
    /^\/seller\/promotions\/codes\/[^/]+/.test(route.path) && !isPromoCodeCreate.value,
  )

  const isContentPromoCreate = computed(() =>
    route.path === '/seller/promotions/promos/new'
    || route.path === '/seller/promotions/promos/new/',
  )

  const isContentPromoEdit = computed(() =>
    /^\/seller\/promotions\/promos\/[^/]+/.test(route.path) && !isContentPromoCreate.value,
  )

  const isPromotionChild = computed(
    () =>
      isPromoCodeCreate.value
      || isPromoCodeEdit.value
      || isContentPromoCreate.value
      || isContentPromoEdit.value,
  )

  const pageTitle = computed(() => {
    if (isDashboard.value) {
      return 'پیشخوان مدیریت'
    }
    if (isOrderDetail.value) {
      return 'جزئیات سفارش'
    }
    if (isProductCreate.value) {
      return 'افزودن محصول'
    }
    if (isProductDetail.value) {
      return 'جزئیات محصول'
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
    if (isBlogCreate.value) {
      return 'افزودن مطلب'
    }
    if (isBlogEdit.value) {
      return 'ویرایش مطلب'
    }
    if (isDealCreate.value) {
      return 'افزودن شگفت‌انگیز'
    }
    if (isDealEdit.value) {
      return 'ویرایش شگفت‌انگیز'
    }
    if (isNotificationCreate.value) {
      return 'ارسال اعلان'
    }
    if (isPromoCodeCreate.value) {
      return 'افزودن کد تخفیف'
    }
    if (isPromoCodeEdit.value) {
      return 'ویرایش کد تخفیف'
    }
    if (isContentPromoCreate.value) {
      return 'افزودن پرومو'
    }
    if (isContentPromoEdit.value) {
      return 'ویرایش پرومو'
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
    isProductDetail,
    isCategoryCreate,
    isCategoryEdit,
    isBannerCreate,
    isBannerEdit,
    isBlogCreate,
    isBlogEdit,
    isDealCreate,
    isDealEdit,
    isNotificationCreate,
    isPromoCodeCreate,
    isPromoCodeEdit,
    isContentPromoCreate,
    isContentPromoEdit,
    isPromotionChild,
    pageTitle,
    showDesktopSidebar,
  }
}
