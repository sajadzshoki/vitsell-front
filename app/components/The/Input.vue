
<template>
  <div class="flex flex-col gap-1.5 relative bg-bg">

    <p v-if="header"
       class="text-(sm gray-800) leading-6.5 px-1 font-medium"
       :class="[headerClass, focused && 'text-red',validation&&'text-red']"
    >
      {{ header.replace('*', '') }}
      <span v-if="header.includes('*')" class="text-red">*</span>
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
      <input v-if="inputTypeLocal !=='textarea' "
             dir="rtl"
             v-model="modelValueComputed"
             :type="inputTypeLocal"
             :inputmode="inputMode"
             class="flex-grow h-9 bg-transparent placeholder-(gray-600 text-base) text-gray-900 font-300 text-xs"
             :class="inputClass"
             :disabled="disabled"
             @input="onInputLimit"
             :placeholder="placeholder  || 'وارد کنید'"
             @focus=" focused = true"
      />
      <textarea v-else-if="!date"
                v-model="value"
                :placeholder="placeholder || 'توضیحات'"
                :disabled="disabled"
                class="border-none text-sm font-400 grow c-gray-900 placeholder:(text-gray-600) outline-none bg-transparent h-20"

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
  maxLength?:number;
  separatable?:boolean;

}>(),{
  valueClassName:'border-(1 solid gray-400) bg-bg',
  focusClassName:'border-(2 solid primary-600) !bg-bg',
  labelClass:'',
  appendIconType:'svg',
  focusable: true,
  appendIconClass:'!svg:(w-5 h-5)',
  inputType:'text',

})

const emit = defineEmits(['append', 'update:modelValue','clearInput'])
const value = defineModel()
const focused = ref(false);

const handleAppendIcon = ()=>{
  emit('append');
  emit('clearInput')
}
const inputTypeLocal = ref(props.password ? 'password' : props.inputType)

const onInputLimit = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.value.length > props.maxLength) {
    input.value = input.value.slice(0, props.maxLength);
    value.value = input.value;
  }
};
const modelValueComputed = computed({
  get() {
    if (props.separatable && value.value) {
      return String(value.value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return value.value;
  },
  set(newValue) {
    if (props.separatable) {
      value.value = String(newValue).replace(/,/g, "");
    } else {
      value.value = newValue;
    }
  }
});


</script>
