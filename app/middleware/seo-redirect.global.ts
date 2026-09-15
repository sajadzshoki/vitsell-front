export default defineNuxtRouteMiddleware((to) => {
  // Skip private / auth surfaces — robots disallow these too
  if (
    to.path.startsWith('/seller')
    || to.path.startsWith('/account')
    || to.path === '/login'
  ) {
    return
  }

  const { findByPath, ensureLoaded } = useSellerRedirects()
  ensureLoaded()

  const hit = findByPath(to.path)
  if (!hit?.destination) return

  const dest = hit.destination.trim()
  if (!dest || dest === to.path || dest === to.fullPath) return

  // Only allow same-origin path redirects
  if (!dest.startsWith('/') || dest.startsWith('//')) return

  const permanent = hit.type === 301 || hit.type === 308
  return navigateTo(dest, {
    redirectCode: permanent ? 301 : 302,
  })
})
