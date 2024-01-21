import {Props} from "nuxt/dist/head/runtime/types";

export const modelValue = {
    type: [String, Array, Boolean, Number, Object],
    default: ''
}
export const modelEmit = 'update:modelValue'
export const modelEmits = (name = 'modelValue') => `update:${name}`
export const useModel = (props : Props, emit: any, name = 'modelValue', callback = (e: any) => e) => computed({
    get() {
        return props[name]
    },
    set(value) {
        emit(`update:${name}`, callback(value))
    }
})