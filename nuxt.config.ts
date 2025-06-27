// @ts-nocheck
export default defineNuxtConfig({
    devtools: {enabled: true},
    ssr: false,

    modules: [
        "@unocss/nuxt",
        "@nuxtjs/i18n",
        "nuxt-icon",
        "nuxt-icons",
        "nuxt-lodash",
        '@vueuse/nuxt',
        "nuxt-swiper",
        "@nuxtjs/device"
    ],

    css: [
        "@unocss/reset/normalize.css",
        "@/assets/fonts/fontiran.css",
        "vue3-toastify/dist/index.css",
        "@/assets/styles/main.scss"
    ],

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