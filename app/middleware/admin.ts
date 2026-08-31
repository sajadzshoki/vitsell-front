export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn } = useShop()
  const { profile, profileLoaded, fetchProfile } = useAccount()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!profileLoaded.value || !profile.value.role) {
    await fetchProfile()
  }

  if (profile.value.role !== 'admin') {
    const { storeUrl, isAdminApp } = useAppMode()
    if (isAdminApp && storeUrl) {
      if (import.meta.client) {
        window.location.href = storeUrl
        return abortNavigation()
      }
    }
    return navigateTo('/login')
  }
})
