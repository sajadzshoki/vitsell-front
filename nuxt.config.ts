// @ts-nocheck
export default defineNuxtConfig({
    devtools: {enabled: false},
    ssr: false,
    devServer: {
        port: 4000,
      },
    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        "@unocss/nuxt",
        "@nuxtjs/i18n",
        "@nuxt/icon",
        "nuxt-icons",
        // "nuxt-lodash",
        '@vueuse/nuxt',
        "nuxt-swiper",
        "@nuxtjs/device"
    ],

    css: [
        '~/assets/css/main.css',
        "@unocss/reset/normalize.css",
        "@/assets/fonts/fontiran.css",
        "vue3-toastify/dist/index.css",
    ],
    ui: {
        colorMode: true,
    },
    colorMode: {
        classSuffix: '',
        preference: 'light',
        fallback: 'light',
    },
    fonts: false,
    icon: {
        serverBundle: {
            collections: ['tabler']
        }
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

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3333/api/v1",
        },
    },

    compatibilityDate: "2025-03-09"
})