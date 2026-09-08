// @ts-nocheck
const isAdminApp = process.env.NUXT_PUBLIC_APP_MODE === 'admin'

export default defineNuxtConfig({
    devtools: {enabled: false},
    ssr: false,
    /** Separate dirs so `dev:store` + `dev:admin` don't clobber each other's prepared config */
    buildDir: isAdminApp ? '.nuxt-admin' : '.nuxt',
    devServer: {
        port: isAdminApp ? 4001 : 4000,
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
            // apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://digishop-back.vistatest.top/api/v1",
            apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:3333/api/v1",
            /** store = فروشگاه | admin = پنل مدیریت روی دامنه جدا */
            appMode: process.env.NUXT_PUBLIC_APP_MODE || "store",
            storeUrl: process.env.NUXT_PUBLIC_STORE_URL || "https://digishop.vistatest.top",
            adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || "https://digishop-admin.vistatest.top",
        },
    },

    hooks: {
        async 'nitro:build:public-assets'(nitro) {
            const { fixSpaHtmlInDir } = await import('./scripts/fix-spa-html.mjs')
            const publicDir = nitro.options.output.publicDir
            const result = await fixSpaHtmlInDir(publicDir)
            if (result.fixed) {
                console.log(`[fix-spa-html] fixed ${result.fixed}/${result.files} HTML files in ${publicDir}`)
            }
        },
        async close() {
            // Prerender HTML is written after public-assets; run again on generate close.
            try {
                const { existsSync } = await import('node:fs')
                const { join } = await import('node:path')
                const publicDir = join(process.cwd(), '.output', 'public')
                if (!existsSync(publicDir)) return
                const { fixSpaHtmlInDir } = await import('./scripts/fix-spa-html.mjs')
                const result = await fixSpaHtmlInDir(publicDir)
                if (result.fixed) {
                    console.log(`[fix-spa-html] close: fixed ${result.fixed}/${result.files} HTML files`)
                }
            }
            catch (err) {
                console.warn('[fix-spa-html] close hook skipped:', err?.message || err)
            }
        },
    },

    compatibilityDate: "2025-03-09"
})