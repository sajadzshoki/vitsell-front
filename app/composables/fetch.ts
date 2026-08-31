import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

/** Fallback when runtimeConfig is unavailable (e.g. early module load). Prefer getApiBase(). */
export const BASE_URL = 'http://localhost:3333/api/v1'
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

export function getAuthCookieName() {
  try {
    const config = useRuntimeConfig()
    return config.public?.appMode === 'admin' ? 'admin_token' : 'token'
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
