import { accountNavItems } from '~/data/account'
import { settingsPageTitle } from '~/data/settings'

export function useAccountLayout() {
  const route = useRoute()
  const device = useDevice()
  const isMobile = computed(() => device.isMobile)

  const isDashboard = computed(
    () => route.path === '/account' || route.path === '/account/',
  )

  const pageTitle = computed(() => {
    if (isDashboard.value) {
      return 'پیشخوان'
    }
    if (route.path === '/account/settings') {
      return settingsPageTitle
    }
    const item = accountNavItems.find(
      i => i.to !== '/account' && (route.path === i.to || route.path.startsWith(`${i.to}/`)),
    )
    return item?.label ?? 'حساب کاربری'
  })

  const showDesktopSidebar = computed(() => !isMobile.value)

  return {
    isMobile,
    isDashboard,
    pageTitle,
    showDesktopSidebar,
  }
}
