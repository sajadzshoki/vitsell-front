<template>
    <div class="flex relative items-center b-rd-3 gap-2 cursor-pointer border-1"
         v-on-click-outside="()=>dropdown=false"
         :class="[dropdown ? 'border-secondary-900' : 'border-transparent'], [bgColor ? bgColor : 'bg-white'], [height ? height : ''] ,[px ? px : ''] , [width ? width : '']"
         @click="!disabled ? dropdown = !dropdown : ''">
        <TheNuxtIcon v-if="!disabled" :name="prependIcon" icon-type="svg" class="text-xl text-text"
                     :class="[textColor ? textColor : 'c-black-900' ]"/>
        <p class="flex c-gray-400 text-sm font-medium select-none gap-2 grow" :class="[value ? ''  : 'c-opacity-50']">
            <TheNuxtIcon v-if="icon" :name="icon" class="rounded-full text-lg" icon-type="svg"/>
            {{ title || $t('لطفا یک گزینه را انتخاب کنید') }}
        </p>
        <p v-if="value" class="c-gray-400 text-sm font-extrabold">
            {{ typeof value?.label === 'number' ? value.label.toLocaleString() + ' ' + value.key : value }}</p>
        <TheNuxtIcon v-if="!disabled" :name="appendIcon" icon-type="svg" class="text-xl text-text"
                     :class="[textColor ? textColor : 'c-black-900' ]"/>
        <div
                v-show="dropdown"
                class="flex flex-col items-stretch absolute top-12 right-0 w-full bg-white rounded-lg max-h-40vh overflow-auto shadow-card">
            <TheDropdownModal :items="data" v-model="value"/>
        </div>
    </div>
</template>

<script setup>
import { vOnClickOutside } from '@vueuse/components'
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    appendText: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: 'title'
    },
    data: {
        type: Array,
        default: () => ([])
    },
    disabled: {
        type: Boolean,
        default: false
    },
    bgColor: {
        type: String,
        default: 'bg-gray-100'
    },
    textColor: {
        type: String,
        default: ''
    },
    appendIcon: {
        type: String,
        default: ''
    },
    prependIcon: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: 'h-12'
    },
    width: {
        type: String,
        default: ''
    },
    px: {
        type: String,
        default: ''
    },
})
const value = defineModel()
const dropdown = ref(false)
</script>

