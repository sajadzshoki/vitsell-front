export type AppMode = 'store' | 'admin'

function originOf(url: string): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  }
  catch {
    return null
  }
}

/**
 * Resolve store vs admin. Prefers runtimeConfig.appMode, but on the client
 * also trusts the page origin so a mis-loaded env (shared .nuxt, wrong dotenv)
 * cannot call store auth from the admin host.
 */
export function resolveAppMode(config: {
  appMode?: string
  storeUrl?: string
  adminUrl?: string
}): AppMode {
  const configured = String(config.appMode || 'store') === 'admin' ? 'admin' : 'store'
  if (!import.meta.client) return configured

  const here = window.location.origin
  const adminOrigin = originOf(String(config.adminUrl || ''))
  const storeOrigin = originOf(String(config.storeUrl || ''))

  if (adminOrigin && here === adminOrigin) return 'admin'
  if (storeOrigin && here === storeOrigin) return 'store'
  return configured
}

export function useAppMode() {
  const config = useRuntimeConfig()
  const storeUrl = String(config.public?.storeUrl || 'http://localhost:4000')
  const adminUrl = String(config.public?.adminUrl || 'http://localhost:4001')
  const mode = resolveAppMode({
    appMode: String(config.public?.appMode || 'store'),
    storeUrl,
    adminUrl,
  })
  const isAdminApp = mode === 'admin'
  const isStoreApp = !isAdminApp
  const authCookieName = isAdminApp ? 'admin_token' : 'token'

  return {
    mode,
    isAdminApp,
    isStoreApp,
    authCookieName,
    storeUrl,
    adminUrl,
  }
}
