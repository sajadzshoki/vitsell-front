export default defineNuxtRouteMiddleware((to) => {
  const { isAdminApp } = useAppMode()
  if (!isAdminApp) return

  const { isLoggedIn } = useShop()
  const path = to.path
  const onLogin = path === '/login'
  const isBlogPreview = path.startsWith('/blog/')
    && (to.query.preview === '1' || to.query.preview === 'true')

  // Guest on admin app → always login (except already there)
  if (!isLoggedIn.value) {
    if (onLogin) return
    return navigateTo({
      path: '/login',
      query: path === '/' ? undefined : { redirect: to.fullPath },
    })
  }

  // Logged-in admin → keep inside /seller (و پیش‌نمایش بلاگ با ?preview=1)
  if (onLogin || path === '/' || (!path.startsWith('/seller') && !isBlogPreview)) {
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
