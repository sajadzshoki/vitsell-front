// @ts-nocheck
const isAdminApp = process.env.NUXT_PUBLIC_APP_MODE === 'admin'
const storeUrl = process.env.NUXT_PUBLIC_STORE_URL || 'https://vitsell.ir'

function isProductionStoreHost(url) {
    try {
        const host = new URL(url).hostname.toLowerCase()
        return host === 'vitsell.ir' || host === 'www.vitsell.ir'
    }
    catch {
        return false
    }
}

/** Admin, localhost, and staging must not advertise themselves as the production site. */
const indexable = !isAdminApp && isProductionStoreHost(storeUrl)

const privateRobotsDisallow = [
    '/seller',
    '/account',
    '/login',
    '/cart',
    '/wishlist',
    '/notifications',
    '/order',
    '/compare',
    '/tracking',
    '/api',
]

const privateNoindex = {
    robots: 'noindex, nofollow',
}

export default defineNuxtConfig({
    devtools: {enabled: false},
    ssr: true,
    /**
     * Dev only: store and admin can run together without sharing `.nuxt`.
     * Production builds (Docker) must use `.nuxt` — Vite looks up `.nuxt/tsconfig.json`.
     */
    buildDir: isAdminApp && process.env.NODE_ENV !== 'production' ? '.nuxt-admin' : '.nuxt',
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
        "@nuxtjs/device",
            '@nuxtjs/robots',
    '@nuxtjs/sitemap'
    ],
    site: {
        url: storeUrl,
        name: 'vitsell',
        indexable,
    },
    robots: indexable
        ? {
            sitemap: ['/sitemap.xml'],
            groups: [
                {
                    userAgent: ['*'],
                    allow: ['/'],
                    disallow: privateRobotsDisallow,
                },
            ],
        }
        : {
            groups: [
                {
                    userAgent: ['*'],
                    disallow: ['/'],
                },
            ],
        },
    sitemap: indexable
        ? {
            sources: ['/api/__sitemap__/urls'],
            exclude: [
                '/seller/**',
                '/account/**',
                '/login',
                '/cart',
                '/wishlist',
                '/notifications',
                '/order/**',
                '/compare',
                '/tracking',
                '/api/**',
                '/search',
            ],
        }
        : {
            exclude: ['/**'],
            sources: [],
        },
    routeRules: {
        '/seller/**': privateNoindex,
        '/account/**': privateNoindex,
        '/login': privateNoindex,
        '/cart': privateNoindex,
        '/wishlist': privateNoindex,
        '/notifications': privateNoindex,
        '/order/**': privateNoindex,
        '/compare': privateNoindex,
        '/tracking': privateNoindex,
    },

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
        // SSR loads icons via /api/_nuxt_icon; clientBundle avoids that path for static names.
        // Include .ts — many icons live in data/ as literal strings (scan skips .ts by default).
        clientBundle: {
            scan: {
                globInclude: ['**/*.{vue,jsx,tsx,md,mdc,mdx,yml,yaml,ts,js}'],
            },
            sizeLimitKb: 512,
        },
        serverBundle: {
            collections: ['tabler'],
        },
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
            apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://vitsell-back.vistatest.top/api/v1",
            /** store = فروشگاه | admin = پنل مدیریت روی دامنه جدا */
            appMode: process.env.NUXT_PUBLIC_APP_MODE || "store",
            storeUrl: process.env.NUXT_PUBLIC_STORE_URL || "https://vitsell.ir",
            adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || "https://seller.vitsell.ir",
            /** Front app version `{channel}.{major}.{minor}` e.g. beta.0.1 — combine with API APP_VERSION in admin sidebar */
            appVersion: process.env.NUXT_PUBLIC_APP_VERSION || "beta.0.1",
            neshanMapKey: process.env.NUXT_PUBLIC_NESHAN_MAP_KEY || "web.37352c820ec747ed91a5d0f0a41062bc",
            neshanServiceKey: process.env.NUXT_PUBLIC_NESHAN_SERVICE_KEY || "service.be5378e73c174469993104db8b41a771",
        },
    },

    vite: {
        resolve: {
            // Prevent mixed npm/pnpm copies of intlify from breaking vue-i18n imports
            // (e.g. toDevtoolsGroupId missing from a stale @intlify/shared@11.4.8).
            dedupe: [
                'vue-i18n',
                '@intlify/shared',
                '@intlify/core',
                '@intlify/core-base',
                '@intlify/message-compiler',
                '@intlify/devtools-types',
            ],
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
                if (existsSync(publicDir)) {
                    const { fixSpaHtmlInDir } = await import('./scripts/fix-spa-html.mjs')
                    const result = await fixSpaHtmlInDir(publicDir)
                    if (result.fixed) {
                        console.log(`[fix-spa-html] close: fixed ${result.fixed}/${result.files} HTML files`)
                    }
                }
            }
            catch (err) {
                console.warn('[fix-spa-html] close hook skipped:', err?.message || err)
            }
            try {
                const { pathToFileURL } = await import('node:url')
                const { join } = await import('node:path')
                await import(pathToFileURL(join(process.cwd(), 'scripts/patch-nitro-entry.mjs')).href)
            }
            catch (err) {
                console.warn('[ssr-entry] patch skipped:', err?.message || err)
            }
        },
    },

    compatibilityDate: "2025-03-09"
})