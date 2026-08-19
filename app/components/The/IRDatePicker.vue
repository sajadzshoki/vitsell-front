<template>
  <ClientOnly>
    <div class="flex flex-col gap-1">
      <p v-if="header" class="text-(xs) font-500 leading-6"
         :class="[validation&&'text-red',headerClass]">{{ header }}</p>
      <div class="flex flex-col relative border-(1 solid) rounded-lg h-12"
           :class="[value && !focused ? 'border-gray-300 bg-transparent' :
            focused ? 'border-primary-600 bg-white' :
             'bg-transparent border-gray-300',validation&&'border-red']">
        <div class="flex items-center p-3 rounded-full cursor-pointer" @click="click" v-on-click-outside="()=> focused = false">
          <p v-if="!range" class="text-(xs) font-400 grow" :class="value?'':'text-gray-500'">
            {{ type==='time'? value?.replace('.',':'): (value ? moment(value).locale(locale).format('YYYY/MM/DD') : focused ? '' : '')
            }}</p>
          <p class="text-(xs) font-400 grow" :class="rangeClass" v-else>
            {{showDate }}
          </p>
          <TheNuxtIcon  name="arrow-down-1" icon-type="svg" class="text-(2xl gray-600) mr-auto"
                        :class="[focused?'rotate-180':'',iconClass]" />
        </div>
        <div v-if=" !value"
             class="absolute top-3.5 right-0 transform  px-3   ">
          <p class="text-(sm gray-700) ">{{ placeholder }}</p>
        </div>
        <date-picker
            :editable="true"
            :format="type==='time'? 'HH.mm':'YYYY-MM-DDTHH:mm:ssZ'"
            display-format="jYYYY-jMM-jDD HH:mm"
            @close="show=false"
            :locale="locale"
            :range="range"
            auto-submit
            clearable
            custom-input="#my-custom-editable-input"
            :show="show"
            :max="withMax && (max || getMaximum)"
            :min="withMin && (min || getMaximum)"
            color="#2E48BB"
            :type="type"
            v-model="value"
            compact-time
        />
        <input id="my-custom-editable-input" hidden>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components'
import DatePicker from 'vue3-persian-datetime-picker'
import moment from "jalali-moment";


const props = withDefaults(defineProps<{
  placeholder?:string;
  disabled?:boolean;
  focusable?:boolean;
  locale?:string;
  header?:string;
  headerClass?:string;
  type?:string;
  validation?:boolean;
  withMax?:boolean;
  range?:boolean;
  max?:any;
  withMin?:boolean;
  min?:any;
}>(),{
  placeholder:'انتخاب کنید',
  focusable:true,
  locale:'fa',
  type:'date'

})
const emit = defineEmits(['append'])
const value = defineModel()
const show = ref(false)
const focused = ref(false)
const click = () => {
  show.value = !show.value
  focused.value = true
}
const showDate = computed(()=>{
  if((typeof value.value !=='string') && moment(value?.value[0]).isSame(value?.value[1],'day')){
    return moment(value?.value[0]).locale(props.locale).format('YYYY/MM/DD')
  }
  else if(typeof value.value !=='string'){
    return (moment(value?.value[0]).locale(props.locale).format('YYYY/MM/DD') +
        ' - ' + moment(value.value?.[1]).locale(props.locale).format('YYYY/MM/DD'))
  }
  else{
    return moment(value.value).locale(props.locale).format('YYYY/MM/DD')
  }
})

const getMaximum = computed(() => moment().format('YYYY-MM-DDTHH:mm:ssZ'))
</script>


