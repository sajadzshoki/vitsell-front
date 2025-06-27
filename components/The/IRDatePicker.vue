<template>
  <ClientOnly>
    <div class="flex flex-col gap-1">
      <p v-if="header" class="text-(sm secondary-500) font-medium">{{ header }}</p>
      <div class="flex flex-col relative border-(1 solid) rounded-lg h-12"
           :class="[value && !focused ? 'border-gray-300 bg-transparent' : focused ? 'border-primary-500 bg-white' : 'bg-transparent border-gray-300']">
        <div class="flex p-3 rounded-full cursor-pointer" @click="click" v-on-click-outside="()=> focused = false">
          <p class="text-(xs) font-400 grow" :class="value?'':'text-gray-500'">
            {{ type==='time'? value?.replace('.',':'): (value ? moment(value).locale(locale).format('YYYY/MM/DD') : focused ? '' : '')
            }}</p>
          <TheNuxtIcon name="calendar" icon-type="svg" @click="emit('append')" class="text-5 c-gray-400"/>
<!--          <TheNuxtIcon  name="arrow-down-1" icon-type="svg" class="text-(2xl gray-600) mr-auto"-->
<!--                        :class="focused?'rotate-180':''"/>-->
        </div>
        <div v-if=" !value"
             class="absolute top-3.5 right-0 transform  px-3   ">
          <p class="text-(sm gray-700) ">{{ placeholder }}</p>
        </div>

        <date-picker
            :editable="true"
            :format="type==='time'? 'hh.mm':'YYYY-MM-DDTHH:mm:ssZ'"
            display-format="jYYYY-jMM-jDD HH:mm"
            @close="show=false"
            :locale="locale"
            custom-input="#my-custom-editable-input"
            :show="show"
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
  type?:string;
}>(),{
  placeholder:'انتخاب کنید',
  focusable:true,
  locale:'fa',
  type:'datetime'

})
const emit = defineEmits(['append'])
const value = defineModel()
const show = ref(false)
const focused = ref(false)
const click = () => {
  show.value = !show.value
  focused.value = true
}
const now = new moment
const test = [moment(now).locale('fa').format('jYYYY/jMM/jDD'), '1300/01/01']
</script>


