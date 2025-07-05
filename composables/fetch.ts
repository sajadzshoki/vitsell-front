import type {NitroFetchOptions, NitroFetchRequest} from "nitropack";

export const BASE_URL = "https://test-back.vistatest.site"
// export const BASE_URL = "http://192.168.3.233:3333"
export const APP_CODE = "test"

// const BASE_URL = ""

const errorHandler = (error: any, config: Record<string, any>) => {
    // @ts-ignore
    const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
    // @ts-ignore
    if (!config?.headers?.['no-error']) {
        const {$toast} = useNuxtApp()
        // @ts-ignore
        $toast?.error(msg || JSON.stringify(error?.data))
    }
    return {error}
}

export const useGet = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'get'> | {
    headers?: Record<string, any>
} = {}, controller: any = undefined): Promise<{
    result?: T,
    error?: any
}> => {
    controller = new AbortController()
    const signal = controller.signal
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    _set(config, ['headers', 'app-code'], APP_CODE)
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'GET',
            signal,
            ...config,
        })
        return {result}
    } catch (error) {
        return errorHandler(error, config)
    }
}
export const useDelete = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'delete'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    _set(config, ['headers', 'app-code'], APP_CODE)
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'DELETE',
            ...config,
        })
        return {result}
    } catch (error) {
        return errorHandler(error, config)
    }
}

export const usePost = async <T, R = T>(URL: string, data: R , config: NitroFetchOptions<NitroFetchRequest, 'post'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    _set(config, ['headers', 'app-code'], APP_CODE)
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'POST',
            body: data as Record<string, any>,
            ...config,
        })
        return {result}
    } catch (error) {
        return errorHandler(error, config)
    }
}

export const usePut = async <T, R = T>(URL: string, data: Partial<R>, config: NitroFetchOptions<NitroFetchRequest, 'put'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    _set(config, ['headers', 'app-code'], APP_CODE)
    _set(config, ['headers', 'no-error'], true)
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'PUT',
            body: data as Record<string, any>,
            ...config,
        })
        return {result}
    } catch (error) {
        return errorHandler(error, config)
    }
}