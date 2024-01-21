// @ts-nocheck
export default defineNuxtConfig({
    devtools: {enabled: true},
    modules: [
        "@unocss/nuxt",
        "@nuxtjs/i18n",
        "nuxt-icon",
        "nuxt-icons",
        "nuxt-lodash"
    ],
    css: [
        "@unocss/reset/normalize.css",
        "@/assets/fonts/fontiran.css",
        "vue3-toastify/dist/index.css",
        "@/assets/styles/main.scss"
    ],
    lodash: {
        prefix: "_",
        prefixSkip: ["is"],
        upperAfterPrefix: false,
        exclude: [],
        alias: [
            // ["camelCase", "stringToCamelCase"], // => stringToCamelCase
            // ["kebabCase", "stringToKebab"], // => stringToKebab
            // ["isDate", "isLodashDate"], // => _isLodashDate
        ],
    },
})
