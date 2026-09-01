import { sellerRoutePermissionMap } from '~/data/seller-permissions'

/**
 * Global seller route permission gate (after auth/admin on pages).
 * Skips when not logged in / not admin so auth middleware can handle first.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/seller')) return
  if (
    to.path.startsWith('/seller/forbidden')
    || to.path.startsWith('/seller/account')
    || to.path.startsWith('/seller/login')
  ) {
    return
  }

  const { isLoggedIn } = useShop()
  const { profile } = useAccount()
  if (!isLoggedIn.value || profile.value?.role !== 'admin') return

  // Dashboard root requires dashboard.view
  if (to.path === '/seller' || to.path === '/seller/') {
    const { can } = useSellerPermissions()
    if (!can('dashboard.view')) {
      return navigateTo({
        path: '/seller/forbidden',
        query: { from: to.fullPath },
      })
    }
    return
  }

  const match = sellerRoutePermissionMap.find(item =>
    to.path === item.prefix || to.path.startsWith(`${item.prefix}/`),
  )
  if (!match) return

  const { can } = useSellerPermissions()
  if (!can(match.permission)) {
    return navigateTo({
      path: '/seller/forbidden',
      query: { from: to.fullPath },
    })
  }
})
