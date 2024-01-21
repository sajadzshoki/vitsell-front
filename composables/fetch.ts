
export const BASE_URL = "http://localhost:3333"
// export const BASE_URL = ""

// const BASE_URL = ""
export const useGet = async (URL: string, config = {headers: {}}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    try {
        const result = await $fetch(URL, {
            baseURL: BASE_URL,
            method: 'GET',
            ...config,
            headers: {
                'Authorization': token.value || '',
                ...(config?.headers || {})
            },

        })
        return {result}
    } catch (error) {
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error( msg || JSON.stringify(error?.data))
        return {error}
    }
}
export const useDelete = (URL: string, config = {}) => $fetch(URL, {
    baseURL: BASE_URL,
    method: 'DELETE',
    ...config
})

export const usePost = async (URL: string, data: Object, config = {headers: {}}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    try {
        const result = await $fetch(URL, {
            baseURL: BASE_URL,
            method: 'POST',
            body: data,
            ...config,
            headers: {
                'Authorization': token.value || '',
                ...(config?.headers || {})
            },
        })
        return {result}
    } catch (error) {
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error( msg || JSON.stringify(error?.data))
        return {error}
    }
}

export const usePut = async (URL: string, data: Object, config = {headers: {}}) => {
    const {$toast} = useNuxtApp()
    const token = useCookie('token')
    // const loading = useState('loading')
    try {
        const result = await $fetch(URL, {
            baseURL: BASE_URL,
            method: 'PUT',
            body: data,
            ...config,
            headers: {
                'Authorization': token.value || '',
                ...(config?.headers || {})
            },
        })
        return {result}
    } catch (error) {
        // @ts-ignore
        const msg = error?.data?.errors?.map(e => (e.field + ':' + e.message)).join(' , ')
        // @ts-ignore
        $toast.error( msg || JSON.stringify(error?.data))
        return {error}
    }
}
