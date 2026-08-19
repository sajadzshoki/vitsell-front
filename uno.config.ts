import {
    defineConfig,
    presetAttributify,
    presetUno,
    transformerDirectives,
} from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
    theme: {
        fontFamily: {
            sans: 'Dana, sans-serif',
        },
        colors: {

        },
        boxShadow: {
            headerLayout:'0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
            header: '0px 3px 2px 0px rgba(0, 0, 0, 0.05)',
            image:'2px 1px 4px 0px rgba(0, 0, 0, 0.25)',
            profileHeader:'0px 1px 4px 0px rgba(0, 0, 0, 0.04)',
            notification:'0px -4px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 4px 0px rgba(0, 0, 0, 0.05)',
            chat:' 0px -2px 10px 0px rgba(0, 0, 0, 0.15)'
        },
    },
    shortcuts: {
        default: 'flex flex-col items-center w-full border-(1 solid gray-2) rounded-2 p-2 gap-3 bg-gray-200',
        flexCol: 'flex flex-col',
        flexCenter: 'items-center justify-center',
        mainBorder:'border-(1 solid gray-200)',
        primaryBorder:'border-(1 solid primary-600)',
        'max-w-8xl':'max-w-1400px'
    },
    transformers: [
        transformerVariantGroup(),
        transformerDirectives({
            // the defaults
            applyVariable: ['--at-apply', '--uno-apply', '--uno'],
            // or disable with:
            // applyVariable: false
        })
    ],
    presets: [
        presetUno(),
        presetAttributify(),
    ],
})
