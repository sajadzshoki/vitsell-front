export default defineNuxtRouteMiddleware((to) => {
  const { isAdminApp } = useAppMode()
  if (!isAdminApp) return

  const path = to.path
  const allowed = path === '/login' || path.startsWith('/seller')
  if (allowed) return

  const { isLoggedIn } = useShop()
  return navigateTo(isLoggedIn.value ? '/seller' : '/login')
})
