import {
    defineConfig,
    presetAttributify,
    presetUno,
    transformerDirectives,
} from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
    theme: {
        colors: {
            primary: {
                100: '#D3E1FE',
                200: '#A1C0FC',
                300: '#6F9FFB',
                400: '#3E7FF9',
                500: '#0C5EF8',
                600: '#064ACB',
                700: '#05389A',
                800: '#032668',
                900: '#021436'
            },
            secondary: {
                100: '#D9F2E1',
                200: '#B3E5C3',
                300: '#8CD9A6',
                400: '#66CC88',
                500: '#40BF6A',
                600: '#339955',
                700: '#267340',
                800: '#194D2B',
                900: '#0D2716'
            },
            gray: {
                30: '#F7F7F7',
                50: '#F2F2F2',
                60: '#F4F4F4',
                70: '#f3f3f3',
                75: '#E5E5E5',
                100: '#E5E5E5',
                125: '#F9F9F9',
                150: '#F6F6F6',
                200: '#CCCCCC',
                300: '#B2B2B2',
                400: '#999999',
                450: '#9A9A9A',
                500: '#808080',
                600: '#666666',
                650: '#878787',
                700: '#4D4D4D',
                750: '#D9D9D9',
                800: '#333333',
                900: '#1A1A1A',
                950: '#101010'
            },
            orange: '#CC6805',
            yellow: '#FFC832',
            green: '#40BF6A',
            red: '#DF2040',
            screen: '#F9F9F9',
            form:'#F7F7F7'
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
        primaryBorder:'border-(1 solid primary-600)'
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
