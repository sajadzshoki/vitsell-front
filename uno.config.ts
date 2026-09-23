import {
    defineConfig,
    presetAttributify,
    presetUno,
    transformerDirectives,
} from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

/**
 * Nuxt UI / Tailwind v4 and UnoCSS presetUno both emit the same class names
 * with different CSS. In the production bundle Uno is appended last, so its
 * rules win; in `nuxt dev` Tailwind usually wins. Let Tailwind own these.
 *
 * Transforms: Tailwind uses `rotate: 90deg`; Uno uses `transform: rotate(90deg)`.
 * Both apply → angles double (90→180).
 *
 * Rings: Nuxt UI draws borders with `ring` / `ring-default` (1px, --tw-ring-*).
 * Uno's `.ring` is a 3px halo (`--un-ring-color: #93c5fd80`) and overwrites
 * `box-shadow`, so UModal and other overlays show a ring only on the server build.
 */
const TW_OWNED_BLOCKLIST = [
    /^rotate-/,
    /^-rotate-/,
    /^scale-/,
    /^-scale-/,
    /^translate-/,
    /^-translate-/,
    /^skew-/,
    /^-skew-/,
    'transform',
    'transform-gpu',
    'transform-cpu',
    'transform-none',
    // `ring`, `!ring-0`, `hover:ring-2`, `group-hover:ring-4`, `ring-offset-*`
    /(?:^|:)!?ring(?:-|$)/,
]

export default defineConfig({
    blocklist: TW_OWNED_BLOCKLIST,
    theme: {
        fontFamily: {
            sans: 'IRANYekanX, sans-serif',
        },
        colors: {

        },
        boxShadow: {
            headerLayout: '0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
            header: '0px 3px 2px 0px rgba(0, 0, 0, 0.05)',
            image: '2px 1px 4px 0px rgba(0, 0, 0, 0.25)',
            profileHeader: '0px 1px 4px 0px rgba(0, 0, 0, 0.04)',
            notification: '0px -4px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 4px 0px rgba(0, 0, 0, 0.05)',
            chat: ' 0px -2px 10px 0px rgba(0, 0, 0, 0.15)',
        },
    },
    shortcuts: {
        default: 'flex flex-col items-center w-full border-(1 solid gray-2) rounded-2 p-2 gap-3 bg-gray-200',
        flexCol: 'flex flex-col',
        flexCenter: 'items-center justify-center',
        mainBorder: 'border-(1 solid gray-200)',
        primaryBorder: 'border-(1 solid primary-600)',
        'max-w-8xl': 'max-w-1400px',
        'max-w-9xl': 'max-w-1540px',

    },
    transformers: [
        transformerVariantGroup(),
        transformerDirectives({
            applyVariable: ['--at-apply', '--uno-apply', '--uno'],
        }),
    ],
    presets: [
        presetUno(),
        presetAttributify(),
    ],
})
