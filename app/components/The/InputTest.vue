<template>
  <div class="flex flex-col gap-1.5 relative">

    <p v-if="header"
       class="text-(sm gray-800) leading-6.5 px-1 font-500"
       :class="[headerClass, {'text-red' :focused },{'text-red':validation}]"
    >
      {{ header.replace('*', '') }}
      <span v-if="header.includes('*')" class="text-red">*</span>
    </p>

    <div
        v-on-click-outside="()=>focused = false"
        class="flex relative  rounded-lg b-(1 solid gray-400)  bg-gray-50 px-3 py-2 gap-1 h-12 items-center"
        :class="[value && !focused ? className : focused ? focusClass : '',
        className ,{'border-red':validation},{'!bg-gray-100':disabled},{'h-26':inputTypeLocal==='textarea'}]">
      <TheNuxtIcon v-if="prependIcon" :name="prependIcon" icon-type="svg"
                   :class="[iconColor ? iconColor : 'text-gray-400']"/>
      <slot/>
      <textarea v-if="inputTypeLocal =='textarea' "
                v-model="value"
                :placeholder="placeholder || 'توضیحات'"
                :disabled="disabled"
                class="border-none text-sm font-400 grow c-gray-900 placeholder:(text-gray-600) outline-none bg-transparent h-20"
      />
      <input v-else
             dir="rtl"
             v-model="value"
             @update:model-value="(e)=>toLocal(e)"
             :type="inputTypeLocal"
             :inputmode="inputMode"
             class="flex-grow  bg-transparent placeholder-(gray-600 text-base) text-gray-900 text-xs"
             :placeholder="placeholder  || 'وارد کنید'"
             :class="inputClass"
             :disabled="disabled"
             @focus=" focused = true"
      />
      <p>{{toLocal(value)}}</p>


      <TheNuxtIcon v-if="password || inputTypeLocal === 'password'"
                   :name="inputTypeLocal === 'text' ? 'eye-slash' : 'eye'"
                   icon-type="svg"
                   class="text-gray-900 cursor-pointer"
                   @click="inputTypeLocal = inputTypeLocal ==='text' ? 'password' : 'text'"
      />

      <TheNuxtIcon v-if="appendIcon"
                   :name="appendIcon"
                   :icon-type="appendIconType"
                   @click="handleAppendIcon"
                   :class="[iconColor ? iconColor : ' text-gray-400',appendIconClass]"
                   class=" p-2 pr-1 !svg:(w-5 h-5)  bg-opacity-30 justify-center rounded-full cursor-pointer"
      />
      <p dir="rtl" class="font-400 text-xs text-gray-900 whitespace-nowrap" v-if="appendText">{{ appendText }}</p>
    </div>
    <p v-if="errorMessage" class="text-(xs red) px-2">{{ errorMessage }}</p>
  </div>
</template>


<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'

const props = withDefaults(defineProps<{
  inputClass?: string;
  className?: string;
  focusClass?: string;
  prependIcon?: string;
  appendIcon?: string;
  appendIconType?: string;
  appendIconClass?: string;
  appendText?: string;
  inputType?: string;
  placeholder?: string;
  header?: string;
  headerClass?: string;
  password?: boolean;
  disabled?: boolean;
  inputMode?: string;
  iconColor?: string;
  focusable?: boolean;
  validation?: boolean;
  maxLength?: number;
  separable?: boolean
  errorMessage?: string;

}>(), {
  focusClass: 'b-(2 solid primary-600) ',
  appendIconType: 'svg',
  focusable: true,
  inputType: 'text',
  justChar: false
})
const onInputLimit = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.value.length > props.maxLength) {
    input.value = input.value.slice(0, props.maxLength);
    value.value = input.value;
  }
};
const emit = defineEmits(['append', 'update:modelValue', 'clearInput'])
const value = defineModel()
const focused = ref(false);

const handleAppendIcon = () => {
  emit('append');
  emit('clearInput')
}
const inputTypeLocal = ref(props.password ? 'password' : props.inputType)


// function formatNumberWithCommas(val: string | number): string {
//   const str = typeof val === 'number' ? val.toString() : val || ''
//   return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
// }
//
// function filterInput(e: Event) {
//   const input = e.target as HTMLInputElement;
//
//
//   if (input.value.length > props.maxLength) {
//     input.value = input.value.slice(0, props.maxLength);
//     value.value = input.value;
//   }
//
//   let newValue = input.value
//   if (props.inputType === 'textNumber') {
//     const cleanedValue = newValue.replace(/[^0-9]/g, '')
//     input.value = props.separateNumbers ? formatNumberWithCommas(cleanedValue) : cleanedValue
//     value.value = cleanedValue
//
//   } else if (props.inputType === 'text' && props.justChar) {
//     const cleanedValue = newValue.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '')
//     input.value = cleanedValue
//     value.value = cleanedValue
//
//   } else if (props.inputType === 'number' && props.inputMode === 'numeric') {
//     const numericValue = newValue.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
//     input.value = numericValue
//     value.value = numericValue
//
//   } else {
//     value.value = newValue
//   }
// }
</script>
