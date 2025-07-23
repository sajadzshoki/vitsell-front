
<template>
  <div class="flex flex-col gap-1.5 relative bg-bg">

    <p v-if="header" class="text-(sm gray-900) leading-6.5 px-1"
       :class="[headerClass , focused &&'text-primary-600',validation&&'text-red'] ">
      {{ header }}
    </p>

    <div
        v-on-click-outside="()=>focused = false"
        class="flex relative  rounded-lg bg-gray-50 px-3 py-2 gap-1 h-12 items-center"
        :class="[value && !focused ? valueClassName : focused ? focusClassName : bgStyle,
        className ,
        validation&&'border-red',
        disabled?'!bg-gray-100':'',
        inputTypeLocal==='textarea'&&'h-26']">

      <TheNuxtIcon v-if="prependIcon" :name="prependIcon" icon-type="svg" :class="[iconColor ? iconColor : 'text-gray-400']"  />

      <slot name="prependComponent" />
      <!--     <TheIRDatePicker v-if="date" v-model="value" format="YYYY-MM-DD[T]HH:mm:ssZ" class="text-text" :class="calendarClass" display-format="jDD jMMMM jYYYY" :placeholder="placeholder"/>&ndash;&gt;-->

      <input v-if="inputTypeLocal !=='textarea' && !date "
             dir="rtl"
             v-model="value"
             :type="inputTypeLocal"
             :inputmode="inputMode"
             :value="inputType === 'textNumber' && separateNumbers ? formatNumberWithCommas(value) : value"
             class="flex-grow h-9 bg-transparent placeholder-(gray-600 text-base) text-gray-900 font-300 text-xs"
             :class="inputClass"
             :disabled="disabled"
             @input="filterInput"
             :placeholder="placeholder  || 'وارد کنید'"
             @focus="date ? inputTypeLocal = 'date' : focused = true"
      />
<!--             @input="onInputLimit"-->
      <textarea v-else-if="!date"
                v-model="value"
                :placeholder="placeholder || 'توضیحات'"
                :disabled="disabled"
                class="border-none text-sm font-400 grow c-gray-900 placeholder:(text-gray-600) outline-none bg-transparent h-20"
                @focus="date ? inputTypeLocal = 'date' : ''"
                @blur="date ? inputTypeLocal = 'text' : ''"
      />

      <TheNuxtIcon v-if="password"
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
                   class=" p-2 pr-1 bg-bg bg-opacity-30 justify-center rounded-full cursor-pointer"
      />
      <p dir="rtl" class="font-400 text-xs text-gray-900 whitespace-nowrap" v-if="appendText">{{ appendText }}</p>
    </div>
  </div>
</template>



<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'
const props= withDefaults(defineProps<{
  inputClass?: string;
  calendarClass?: string;
  className?: string;
  valueClassName?: string;
  focusClassName?: string;
  prependIcon?: string;
  appendIcon?: string;
  appendIconType?: string;
  appendIconClass?: string;
  appendText?: string;
  inputType?:string;
  placeholder?: string;
  header?: string;
  headerClass?: string;
  password?: boolean;
  date?: boolean;
  disabled?: boolean;
  inputMode?: string;
  iconColor?: string;
  bgStyle?: string;
  focusable?: boolean;
  validation?:boolean;
  justChar?: boolean;
  maxLength?: number;
  separateNumbers?: boolean

}>(),{
  valueClassName:'border-(1 solid gray-400) bg-bg',
  focusClassName:'border-(2 solid primary-600) !bg-bg',
  labelClass:'',
  appendIconType:'svg',
  focusable: true,
  appendIconClass:'!svg:(w-5 h-5)',
  inputType:'text',
  justChar:false
})
const onInputLimit = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.value.length > props.maxLength) {
    input.value = input.value.slice(0, props.maxLength);
    value.value = input.value;
  }
};
const emit = defineEmits(['append', 'update:modelValue','clearInput'])
const value = defineModel()
const focused = ref(false);

const handleAppendIcon = ()=>{
  emit('append');
  emit('clearInput')
}
const inputTypeLocal = ref(props.password ? 'password' : props.inputType)


function formatNumberWithCommas(val: string | number): string {
  const str = typeof val === 'number' ? val.toString() : val || ''
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function filterInput(e: Event) {
  const input = e.target as HTMLInputElement;


  if (input.value.length > props.maxLength) {
    input.value = input.value.slice(0, props.maxLength);
    value.value = input.value;
  }

  let newValue = input.value
  if (props.inputType === 'textNumber') {
    const cleanedValue = newValue.replace(/[^0-9]/g, '')
    input.value = props.separateNumbers ? formatNumberWithCommas(cleanedValue) : cleanedValue
    value.value = cleanedValue

  } else if (props.inputType === 'text' && props.justChar) {
    const cleanedValue = newValue.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '')
    input.value = cleanedValue
    value.value = cleanedValue

  } else if (props.inputType === 'number' && props.inputMode === 'numeric') {
    const numericValue = newValue.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
    input.value = numericValue
    value.value = numericValue

  } else {
    value.value = newValue
  }
}
</script>
