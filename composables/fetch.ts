import type {NitroFetchOptions, NitroFetchRequest} from "nitropack";

export const BASE_URL = "https://schema.vistatest.site"
// export const BASE_URL = "http://localhost:3333"
export const APP_CODE = "divar"

// const BASE_URL = ""
export const useGet = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'get'> = {}, controller: any = undefined): Promise<{
    result?: T,
    error?: any
}> => {
    controller = new AbortController()
    const signal = controller.signal
    const {$toast} = useNuxtApp()
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
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast?.error(msg || JSON.stringify(error?.data))
        return {error}
    }
}
export const useDelete = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest, 'delete'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const {$toast} = useNuxtApp()
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
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error(msg || JSON.stringify(error?.data))
        return {error}
    }
}

export const usePost = async <T, R = T>(URL: string, data: R, config: NitroFetchOptions<NitroFetchRequest, 'post'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const {$toast} = useNuxtApp()
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
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error(msg || JSON.stringify(error?.data))
        return {error}
    }
}

export const usePut = async <T,R = T>(URL: string, data: Partial<R>, config: NitroFetchOptions<NitroFetchRequest, 'put'> = {}): Promise<{
    result?: T,
    error?: any
}> => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')

    _set(config, ['headers', 'app-code'], APP_CODE)
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'PUT',
            body: data as Record<string, any>,
            ...config,
        })
        return {result}
    } catch (error) {
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error(msg || JSON.stringify(error?.data))
        return {error}
    }
}