import { sellerNavItems } from '~/data/seller'

export function useSellerLayout() {
  const route = useRoute()
  const device = useDevice()
  const isMobile = computed(() => device.isMobile)

  const isDashboard = computed(
    () => route.path === '/seller' || route.path === '/seller/',
  )

  const pageTitle = computed(() => {
    if (isDashboard.value) {
      return 'پیشخوان فروشنده'
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
    pageTitle,
    showDesktopSidebar,
  }
}
