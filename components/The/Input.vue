<template>
  <div class="flex flex-col gap-1.5">
    <p v-if="label" :class="labelClass">{{ label }}</p>
    <div
        v-on-click-outside="()=>focused = false" class="flex relative px-3 py-1 gap-1 h-10 items-center"
        :class="[value && !focused ? valueClassName : focused ? focusClassName : bgStyle,className]">
      <TheNuxtIcon v-if="prependIcon" :name="prependIcon" icon-type="svg" :class="[iconColor ? iconColor : 'text-gray-400']"/>
      <TheIRDatePicker v-if="date" v-model="value" format="YYYY-MM-DD[T]HH:mm:ssZ" class="text-text"
                       display-format="jDD jMMMM jYYYY" :placeholder="placeholder"/>
      <input v-if="inputType !=='textarea'" dir="rtl" v-model="value" :type="inputType" :inputmode="inputMode"
             class="flex-grow bg-transparent placeholder-gray-50 text-gray-900 font-300 text-xs" :disabled="disabled"
             :placeholder="!focused ? placeholder : value || ''" @focus="date ? inputType = 'date' : focused = true"/>
      <textarea v-else v-model="value" :placeholder="placeholder" :disabled="disabled"
                class="border-none text-sm font-400 grow c-gray-900 placeholder:(c-gray-400) outline-none bg-transparent h-24"
                @focus="date ? inputType = 'date' : ''" @blur="date ? inputType = 'text' : ''"/>
      <TheNuxtIcon v-if="password" :name="inputType === 'text' ? 'eye-slash' : 'eye'" icon-type="svg"
                   class="!text-gray-400 cursor-pointer" @click="inputType = inputType ==='text' ? 'password' : 'text'"/>
      <TheNuxtIcon v-if="appendIcon" :name="appendIcon" :icon-type="appendIconType" @click="$emit('append')"
                   :class="[iconColor ? iconColor : 'text-gray-400',appendIconClass]"
                   class="!svg:(w-3 h-3) p-2 bg-bg bg-opacity-30 border-(1 solid primary-700) justify-center rounded-full"/>
      <p dir="ltr" class="font-400 text-xs text-gray-900 whitespace-nowrap" v-if="appendText">{{ appendText }}</p>
    </div>
  </div>
</template>

<script setup>
import {vOnClickOutside} from '@vueuse/components'

const props = defineProps({
  className: {
    type: String,
    default: 'rounded-md bg-bg'
  },
  valueClassName: {
    type: String,
    default: 'border-gray-200 bg-bg'
  },
  focusClassName: {
    type: String,
    default: 'border-(1 solid gray-100) !bg-bg'
  },
  labelClass: {
    type: String,
    default: 'text-(xs gray-600) font-400 leading-6'
  },
  prependIcon: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: ''
  },
  appendIconType: {
    type: String,
    default: 'svg'
  },
  appendIconClass: {
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
  label: {
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
  bgStyle: {
    type: String,
    default: 'bg-bg border-(1 solid gray-50)'
  },
  handler: {
    default: undefined
  },
  focusable: {
    type: Boolean,
    default: false
  },
})
defineEmits(['append', 'update:modelValue'])
const value = defineModel()

const focused = ref(false)
</script>
