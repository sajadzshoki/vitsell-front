import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

/** Fallback when runtimeConfig is unavailable (e.g. early module load). Prefer getApiBase(). */
// export const BASE_URL = 'https://digishop-back.vistatest.top/api/v1'
export const BASE_URL = 'http://127.0.0.1:3333/api/v1'
export const APP_CODE = 'test'

export function getApiBase() {
  try {
    const config = useRuntimeConfig()
    const base = config.public?.apiBase
    if (typeof base === 'string' && base.length) return base
  }
  catch {
    /* outside Nuxt context */
  }
  return BASE_URL
}

/** Backend origin without `/api/v1` — for `/uploads/...` assets. */
export function getUploadOrigin() {
  const base = getApiBase().replace(/\/+$/, '')
  return base.replace(/\/api\/v1$/i, '') || base
}

const UPLOAD_FILE_RE = /\/uploads\/([\w.-]+\.(?:jpe?g|png|webp|gif|mp4|webm|mov|pdf|txt|docx?))$/i

/**
 * Make media URLs loadable in the browser.
 * Relative `/uploads/...` and legacy absolute hosts (e.g. 0.0.0.0) rewrite to the API origin.
 */
export function resolveMediaUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw

  const origin = getUploadOrigin()
  const pathMatch = raw.match(UPLOAD_FILE_RE)
  if (pathMatch && origin) {
    return `${origin}/uploads/${pathMatch[1]}`
  }
  if (raw.startsWith('/') && origin) {
    return `${origin}${raw}`
  }
  return raw
}

export function getAuthCookieName() {
  try {
    return useAppMode().authCookieName
  }
  catch {
    return 'token'
  }
}

function authHeaderValue() {
  const token = useCookie<string | null>(getAuthCookieName())
  if (!token.value) return ''
  return token.value.startsWith('Bearer ') ? token.value : `Bearer ${token.value}`
}

const errorHandler = (error: any, config: Record<string, any>) => {
  const msg = error?.data?.errors?.map((e: any) => (`${e.field}:${e.message}`)).join(' , ')
  if (!config?.headers?.['no-error']) {
    const { $toast } = useNuxtApp()
    $toast?.error(msg || JSON.stringify(error?.data))
  }
  return { error }
}

export const useGet = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'get'> | {
  headers?: Record<string, any>
} = {}, controller: any = undefined): Promise<{
  result?: T
  error?: any
}> => {
  controller = new AbortController()
  const signal = controller.signal
  _set(config, ['headers', 'Authorization'], authHeaderValue())
  _set(config, ['headers', 'app-code'], APP_CODE)
  try {
    const result = await $fetch<T>(URL, {
      baseURL: getApiBase(),
      method: 'GET',
      signal,
      ...config,
    })
    return { result }
  }
  catch (error) {
    return errorHandler(error, config)
  }
}

export const useDelete = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'delete'> = {}): Promise<{
  result?: T
  error?: any
}> => {
  _set(config, ['headers', 'Authorization'], authHeaderValue())
  _set(config, ['headers', 'app-code'], APP_CODE)
  try {
    const result = await $fetch<T>(URL, {
      baseURL: getApiBase(),
      method: 'DELETE',
      ...config,
    })
    return { result }
  }
  catch (error) {
    return errorHandler(error, config)
  }
}

export const usePost = async <T, R = T>(URL: string, data: R, config: NitroFetchOptions<NitroFetchRequest, 'post'> = {}): Promise<{
  result?: T
  error?: any
}> => {
  _set(config, ['headers', 'Authorization'], authHeaderValue())
  _set(config, ['headers', 'app-code'], APP_CODE)
  try {
    const result = await $fetch<T>(URL, {
      baseURL: getApiBase(),
      method: 'POST',
      body: data as Record<string, any>,
      ...config,
    })
    return { result }
  }
  catch (error) {
    return errorHandler(error, config)
  }
}

export const usePut = async <T, R = T>(URL: string, data: Partial<R>, config: NitroFetchOptions<NitroFetchRequest, 'put'> = {}): Promise<{
  result?: T
  error?: any
}> => {
  _set(config, ['headers', 'Authorization'], authHeaderValue())
  _set(config, ['headers', 'app-code'], APP_CODE)
  try {
    const result = await $fetch<T>(URL, {
      baseURL: getApiBase(),
      method: 'PUT',
      body: data as Record<string, any>,
      ...config,
    })
    return { result }
  }
  catch (error) {
    return errorHandler(error, config)
  }
}

export const usePatch = async <T, R = T>(URL: string, data: Partial<R>, config: NitroFetchOptions<NitroFetchRequest, 'patch'> = {}): Promise<{
  result?: T
  error?: any
}> => {
  _set(config, ['headers', 'Authorization'], authHeaderValue())
  _set(config, ['headers', 'app-code'], APP_CODE)
  try {
    const result = await $fetch<T>(URL, {
      baseURL: getApiBase(),
      method: 'PATCH',
      body: data as Record<string, any>,
      ...config,
    })
    return { result }
  }
  catch (error) {
    return errorHandler(error, config)
  }
}
