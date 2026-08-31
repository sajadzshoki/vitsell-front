export default defineNuxtRouteMiddleware((to) => {
  const { isAdminApp } = useAppMode()
  if (!isAdminApp) return

  const { isLoggedIn } = useShop()
  const path = to.path
  const onLogin = path === '/login'

  // Guest on admin app → always login (except already there)
  if (!isLoggedIn.value) {
    if (onLogin) return
    return navigateTo({
      path: '/login',
      query: path === '/' ? undefined : { redirect: to.fullPath },
    })
  }

  // Logged-in admin → keep inside /seller (and away from login/home)
  if (onLogin || path === '/' || !path.startsWith('/seller')) {
    const raw = to.query.redirect
    if (
      typeof raw === 'string'
      && raw.startsWith('/seller')
      && !raw.startsWith('//')
    ) {
      return navigateTo(raw)
    }
    return navigateTo('/seller')
  }
})
