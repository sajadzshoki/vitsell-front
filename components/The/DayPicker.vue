<template>
  <div class="flex items-center justify-between gap-4 px-4 pb-2 overflow-x-auto ">
    <div class="flexCol items-center select-none px-3 cursor-pointer"
         :class="selectedDay==item.date&&'border-b-(1 solid primary-600)'"
         @click="selectDay(item.date)"
         v-for="item in days"
    >
      <p class="text-(xs gray-600 nowrap) font-400 leading-6"
         :class="selectedDay==item.date?'!text-primary-600':''">
        {{item.today?'امروز':isoToWeekDayFirstLetter(item) }}</p>
      <p class="text-(sm ) leading-6.5 font-500" :class="selectedDay==item.date?'!text-primary-600':''">{{
          item.day
        }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'jalali-moment';
import {isoToWeekDay, isoToWeekDayFirstLetter} from "~/composables/global";

const now = ref(moment())
const selectedDay = defineModel()
if (!selectedDay.value) {
  const today = moment().toISOString()
  selectedDay.value = today
}
const getDays = (baseMoment: moment.Moment) => {
  const monthDays = [];

  for (let i = 0; i < 11; i++) {
    const dayMoment = baseMoment.clone().add(i, 'day'); // Adds i days, preserving full Jalali context

    const jalaliDay = moment(dayMoment.format('YYYY-MM-DD'), 'YYYY-MM-DD').locale('fa').format('D'); // Jalali day

    const isToday = dayMoment.isSame(moment(), 'day');

    const day: any = {
      title: isToday ? 'امروز' : dayMoment.format('dddd'),
      day: jalaliDay,
      date: dayMoment.toISOString(), // this will now pass correctly to your isoToWeekDayFirstLetter
    };

    if (isToday) {
      day.today = true;
    }

    monthDays.push(day);
  }

  return monthDays;
}



const days = ref(getDays(now.value))


const selectDay = (item: any) => {
  selectedDay.value = item
}
</script>