import type {NitroFetchOptions, NitroFetchRequest} from "nitropack";

// export const BASE_URL = "https://back.mobipharma.ir"
export const BASE_URL = "http://localhost:3333"

// const BASE_URL = ""
export const useGet = async <T>(URL: string, config: NitroFetchOptions<NitroFetchRequest,'get'> = {}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'GET',
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
export const useDelete =  async <T>(URL: string, data: Record<string, any>, config: NitroFetchOptions<NitroFetchRequest,'delete'>) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'DELETE',
            body: data,
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

export const usePost = async <T>(URL: string, data?: Record<string, any>, config: NitroFetchOptions<NitroFetchRequest,'post'> = {}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'POST',
            body: data,
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

export const usePut =  async <T>(URL: string, data: Record<string, any>, config: NitroFetchOptions<NitroFetchRequest,'put'> = {}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    _set(config, ['headers', 'Authorization'], token.value || '')
    try {
        const result = await $fetch<T>(URL, {
            baseURL: BASE_URL,
            method: 'PUT',
            body: data,
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
