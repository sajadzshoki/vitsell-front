export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn } = useShop()
  const { profile, profileLoaded, fetchProfile } = useAccount()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/courier/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!profileLoaded.value || !profile.value.role) {
    await fetchProfile()
  }

  if (profile.value.role !== 'courier') {
    return navigateTo('/courier/login')
  }
})
