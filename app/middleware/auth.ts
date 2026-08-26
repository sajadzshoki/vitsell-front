export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useShop()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
