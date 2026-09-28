import { sellerLiveNavItems } from '~/data/seller'

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

  const isAdminCreate = computed(() =>
    route.path === '/seller/admins/new' || route.path === '/seller/admins/new/',
  )
  const isAdminDetail = computed(() =>
    /^\/seller\/admins\/[^/]+/.test(route.path) && !isAdminCreate.value,
  )
  const isAdminChild = computed(() => isAdminCreate.value || isAdminDetail.value)

  const isRoleCreate = computed(() =>
    route.path === '/seller/roles/new' || route.path === '/seller/roles/new/',
  )
  const isRoleDetail = computed(() =>
    /^\/seller\/roles\/[^/]+/.test(route.path) && !isRoleCreate.value,
  )
  const isRoleChild = computed(() => isRoleCreate.value || isRoleDetail.value)

  const isMegaMenuCreate = computed(() =>
    route.path === '/seller/mega-menus/new' || route.path === '/seller/mega-menus/new/',
  )

  const isMegaMenuEdit = computed(() =>
    /^\/seller\/mega-menus\/[^/]+/.test(route.path) && !isMegaMenuCreate.value,
  )

  const pageTitle = computed(() => {
    if (isDashboard.value) {
      return 'پیشخوان مدیریت'
    }
    if (isOrderDetail.value) {
      return 'جزئیات سفارش'
    }
    if (isAdminCreate.value) return 'افزودن ادمین'
    if (isAdminDetail.value) return 'جزئیات ادمین'
    if (isRoleCreate.value) return 'نقش جدید'
    if (isRoleDetail.value) return 'ویرایش نقش'
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
    if (isMegaMenuCreate.value) {
      return 'افزودن مگا منو'
    }
    if (isMegaMenuEdit.value) {
      return 'ویرایش مگا منو'
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
    if (route.path === '/seller/couriers/new' || route.path === '/seller/couriers/new/') {
      return 'افزودن پیک'
    }
    if (/^\/seller\/couriers\/[^/]+/.test(route.path)) {
      return 'ویرایش پیک'
    }
    const matches = sellerLiveNavItems.filter(
      i => i.to && i.to !== '/seller' && (route.path === i.to || route.path.startsWith(`${i.to}/`)),
    )
    const item = matches.sort((a, b) => (b.to?.length ?? 0) - (a.to?.length ?? 0))[0]
    return item?.label ?? 'پنل مدیریت'
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
    isMegaMenuCreate,
    isMegaMenuEdit,
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
    isAdminChild,
    isRoleChild,
    pageTitle,
    showDesktopSidebar,
  }
}
