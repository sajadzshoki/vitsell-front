export type AppMode = 'store' | 'admin'

export function useAppMode() {
  const config = useRuntimeConfig()
  const mode = (String(config.public?.appMode || 'store') as AppMode)
  const isAdminApp = mode === 'admin'
  const isStoreApp = !isAdminApp
  const authCookieName = isAdminApp ? 'admin_token' : 'token'
  const storeUrl = String(config.public?.storeUrl || '/')
  const adminUrl = String(config.public?.adminUrl || '')

  return {
    mode,
    isAdminApp,
    isStoreApp,
    authCookieName,
    storeUrl,
    adminUrl,
  }
}
