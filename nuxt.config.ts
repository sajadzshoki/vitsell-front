// @ts-nocheck
export default defineNuxtConfig({
    devtools: {enabled: true},
    ssr: false,

    modules: [
        '@nuxt/ui',
        "@unocss/nuxt",
        "@nuxtjs/i18n",
        "nuxt-icon",
        "nuxt-icons",
        // "nuxt-lodash",
        '@vueuse/nuxt',
        "nuxt-swiper",
        "@nuxtjs/device"
    ],

    css: [
        // "@nuxt/ui/css",
        // '@nuxt/ui/styles',

        '~/assets/css/main.css',
        "@unocss/reset/normalize.css",
        "@/assets/fonts/fontiran.css",
        "vue3-toastify/dist/index.css",
        "@/assets/styles/main.scss"
    ],
    ui: {
        colorMode: false,
    },
    lodash: {
        prefix: "_",
        // prefixSkip: ["is"],
        upperAfterPrefix: false,
        exclude: [],
        alias: [
            // ["camelCase", "stringToCamelCase"], // => stringToCamelCase
            // ["kebabCase", "stringToKebab"], // => stringToKebab
            // ["isDate", "isLodashDate"], // => _isLodashDate
        ],
    },
    imports: {
        presets: [
            {
                from: 'lodash-es',
                imports: [
                    // put the lodash functions you actually use here:
                    ['debounce', '_debounce'],
                    ['cloneDeep', '_cloneDeep'],
                    ['get', '_get'],
                    ['set', '_set'],
                    ['uniqBy', '_uniqBy'],
                    ['sortBy', '_sortBy'],
                    ['orderBy', '_orderBy'],
                    ['clone', '_clone'],
                ],
            },
        ],
    },
    i18n: {
        locales: [
            {code: 'en', language: 'en-US'},
            {code: 'fa', language: 'fa-IR'}
        ],
        defaultLocale: 'fa',
        strategy: 'no_prefix',
        types: 'composition',
        warnHtmlMessage: false
    },

    compatibilityDate: "2025-03-09"
})