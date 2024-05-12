export default defineNuxtPlugin((nuxtApp) => {
    // const isLoading = useState('loading')
    const {start,finish} = useLoadingIndicator({
        duration: 5e3,
        throttle: 200
    })
    nuxtApp.hook('page:start', () => {
        start()
    })
    nuxtApp.hook('page:loading:end', () => {
        finish()
    })
})
