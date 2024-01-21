import {
    defineConfig,
    presetAttributify,
    presetUno,
    transformerDirectives,
} from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
    theme: {
    },
    shortcuts: {},
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
