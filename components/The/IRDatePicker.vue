<template>
  <ClientOnly>
    <div class="flex flex-col gap-1">
      <p v-if="head" class="text-(sm secondary-500) font-medium">{{ head }}</p>
      <div class="flex flex-col relative border-(1 solid) rounded-lg h-12"
           :class="[value && !focused ? 'border-gray-300 bg-transparent' : focused ? 'border-primary-500 bg-white' : 'bg-transparent border-gray-300']">
        <div class="flex p-3 rounded-full cursor-pointer" @click="click" v-on-click-outside="()=> focused = false">
          <p class="c-gray-400 text-base font-medium grow">
            {{
              value ? moment(value).locale(locale).format('D MMMM YYYY | HH:mm') : focused ? '' : placeholder
            }}</p>
          <TheNuxtIcon name="calendar" icon-type="svg" @click="emit('append')" class="text-5 c-gray-400"/>
        </div>
        <div v-if="focused && focusable || value"
             class="absolute top-0 right-0 transform -translate-y-1/2 -translate-x-1/6 px-2 bg-white z-2 ">
          <p class="text-(sm gray-900) font-extrabold">{{ placeholder }}</p>
        </div>
        <!--            <date-picker v-model="dateTime" :show="show" :editable="true" format="YYYY-MM-DD"-->
        <!--                         display-format="jYYYY/jMM/jDD" @close="show=false" custom-input="#my-custom-editable-input"/>-->
        <date-picker
            :editable="true"
            format="YYYY-MM-DDTHH:mm:ssZ"
            display-format="jYYYY-jMM-jDD HH:mm"
            @close="show=false"
            :locale="locale"
            custom-input="#my-custom-editable-input"
            :show="show"
            color="#2E48BB"
            type="datetime"
            v-model="value"
            compact-time
        />
        <input id="my-custom-editable-input" hidden>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import {vOnClickOutside} from '@vueuse/components'
import DatePicker from 'vue3-persian-datetime-picker'
import moment from "jalali-moment";

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  focusable: {
    type: Boolean,
    default: true
  },
  locale: {
    type: String,
    default: 'en'
  },
  head: {
    type: String,
    default: ''
  }
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


