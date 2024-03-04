<template>
    <div
            v-click-outside="()=>focused = false"
            class="flex relative p-3 gap-1 b-rd-2 border-(0.4 solid) items-start"
            :class="[value && !focused ? 'border-gray-200 bg-white' : focused ? 'border-primary-500 bg-white' : 'bg-gray-100 border-transparent']">
        <TheNuxtIcon v-if="prependIcon" :name="prependIcon" icon-type="svg"
                     :class="[iconColor ? iconColor : 'text-gray-400']"/>
      <IRDatePicker v-if="date" v-model="value" format="YYYY-MM-DD[T]HH:mm:ssZ" class="text-text"
                  display-format="jDD jMMMM jYYYY" :placeholder="placeholder"/>
        <input v-if="inputType !=='textarea'" dir="rtl"
               v-model="value" :type="inputType"
               :inputmode="inputMode"
               class="flex-grow bg-transparent placeholder-gray-400 font-extrabold text-sm" :disabled="disabled"
               :placeholder="!focused ? placeholder : value || ''" @focus="date ? inputType = 'date' : focused = true"/>
        <textarea v-else v-model="value"
                  class="border-none text-base font-medium grow c-gray-400 placeholder:(c-gray-400) outline-none bg-transparent h-full"
                  :placeholder="placeholder" :disabled="disabled"
                  @focus="date ? inputType = 'date' : ''" @blur="date ? inputType = 'text' : ''"/>
        <TheNuxtIcon v-if="password" :name="inputType === 'text' ? 'eye-slash' : 'eye'" icon-type="svg"
                     class="!text-gray-400 cursor-pointer"
                     @click="inputType = inputType ==='text' ? 'password' : 'text'"/>

        <TheNuxtIcon v-if="appendIcon" :name="appendIcon" icon-type="svg" @click="$emit('append')"
                     :class="[iconColor ? iconColor : 'text-gray-400']" class="text-5"/>
        <span v-if="appendText">{{ appendText }}</span>
        <div v-if="focused && focusable || value && focusable"
             class="absolute top-0 right-0 transform -translate-y-1/2 -translate-x-1/6 px-2 py-0 bg-white z-2 ">
            <p class="text-(sm gray-900) font-extrabold">{{ placeholder }}</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    prependIcon: {
        type: String,
        default: ''
    },
    appendIcon: {
        type: String,
        default: ''
    },
    appendText: {
        type: String,
        default: ''
    },
    inputType: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    password: {
        type: Boolean,
        default: false
    },
    date: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    inputMode: {
        type: String,
        default: ''
    },
    iconColor: {
        type: String,
        default: ''
    },
    handler: {
        default: undefined
    },
    focusable: {
        type: Boolean,
        default: true
    },
})
const emit = defineEmits(['append','update:modelValue'])
const value = defineModel()

const focused = ref(false)
</script>
