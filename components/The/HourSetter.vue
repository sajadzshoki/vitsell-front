<template>
  <div class="bg-secondary-500 py-4 px-3 rounded-lg flex items-center justify-between w-full cursor-pointer"
       :class="modal && 'border-( 2 solid primary-500)'"
       @click="modal=true">
    <p class="text-(xs gray-500)">{{ time ? time?.replace('.',':') :'ساعت' }}</p>
    <TheNuxtIcon name="time" icon-type="svg" class="text-gray-300"/>
  </div>
  <TheModal title="ورود ساعت" v-if="modal" @close="modal = false" :with-close="false">
    <div class="flex gap-2 ">
      <div class="flexCol gap-2">
        <div class=" rounded-lg h-18 w-full flex flexCenter"
             :class="focusM ? 'bg-primary-200 border-(3 solid primary-600)':'bg-secondary-700'"
             v-on-click-outside="()=>focusM = false">
          <input
              ref="minuteRef"
              v-model="minute"
              type="number"
              @click="minute='null'"
              class="text-( 3xl center) font-600 h-18 "
              :class="focusM ? 'text-primary-600':'text-white'"
              placeholder="00"
              @keydown.up="addMinute"
              @change="onMinuteChange"
              @focus="focusM=true"
              @keydown.enter="submit"
          />
        </div>
        <p class="text-(xs gray-400) mr-1">دقیقه</p>
      </div>
      <h1 class="text-12">:</h1>
      <div class="flexCol gap-2">
        <div class=" rounded-lg h-18 w-full flex flexCenter"
             :class="focusH ? 'bg-primary-200 border-(3 solid primary-600)':'bg-secondary-700'"
             v-on-click-outside="()=>focusH = false">
          <input
              ref="hourRef"
              v-model="hour"
              type="number"
              @click="hour=null"
              class="text-(white 3xl center) font-600 h-18"
              :class="focusH ? 'text-primary-600':'text-white'"
              placeholder="00"
              @keydown.up="addHour"
              @change="onHourChange"
              @focus="focusH=true"

              @input="checkHourLength"

          />
        </div>
        <p class="text-(xs gray-400) mr-1">ساعت</p>
      </div>
    </div>
    <div class="mt-4 mr-2 flex gap-4 cursor-pointer">

      <p class="text-( primary-300)"
         @click="submit"
         :class="(!minute || !hour) && '!opacity-20'"
         >تایید</p>
      <p class="text-( )" @click="modal=false">لغو</p>
    </div>
  </TheModal>

</template>

<script setup lang="ts">
import Input from "~/components/The/Input.vue";
import {vOnClickOutside} from '@vueuse/components'
const time = defineModel()
const modal = ref(false)
const focusM = ref(false)
const focusH = ref(false)
const hour = ref()
const minute = ref()
const hourRef = ref<HTMLInputElement | null>(null)
const minuteRef = ref<HTMLInputElement | null>(null)
const submit = ()=>{
  time.value = hour.value.toString() + '.' + minute.value.toString()
  modal.value = false
}
const onMinuteChange = () => {
  if (minute.value > 59) minute.value = 59
  if (minute.value < 0 || isNaN(minute.value)) minute.value = 0
}

const onHourChange = () => {
  if (hour.value > 23) hour.value = 23
  if (hour.value < 0 || isNaN(hour.value)) hour.value = 0
}
const addMinute = () => {
  // minute.value = (minute.value || 0) + 1
  if (minute.value > 59) minute.value = 0
}

const addHour = () => {
  // hour.value = (hour.value || 0) + 1
  if (hour.value > 23) hour.value = 0
}
const checkHourLength = () => {
  const val = hourRef.value?.value
  if (val?.length >= 2) {
    nextTick(() => minuteRef.value?.focus())
  }
}
</script>

