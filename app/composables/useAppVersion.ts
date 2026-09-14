import { combineAppVersions } from '~/utils/appVersion'

type HealthPayload = {
  status?: string
  version?: string
}

/**
 * Front version from `NUXT_PUBLIC_APP_VERSION`; back from API `GET /health`.
 * Combined: channel + front pair + back pair (e.g. beta.0.1.0.1).
 */
export function useAppVersion() {
  const config = useRuntimeConfig()
  const frontVersion = computed(() => {
    const v = config.public.appVersion
    return typeof v === 'string' && v.trim() ? v.trim() : 'beta.0.1'
  })

  const backVersion = useState<string | null>('api-app-version', () => null)

  async function fetchBackVersion() {
    if (backVersion.value) return backVersion.value
    try {
      const origin = getUploadOrigin()
      const data = await $fetch<HealthPayload>(`${origin}/health`, {
        timeout: 5000,
      })
      if (typeof data?.version === 'string' && data.version.trim()) {
        backVersion.value = data.version.trim()
      }
    }
    catch {
      /* health optional for UI */
    }
    return backVersion.value
  }

  const combinedVersion = computed(() => {
    if (!backVersion.value) return frontVersion.value
    return combineAppVersions(frontVersion.value, backVersion.value)
  })

  return {
    frontVersion,
    backVersion,
    combinedVersion,
    fetchBackVersion,
  }
}
