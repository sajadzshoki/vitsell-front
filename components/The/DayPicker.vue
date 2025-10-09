<template>
  <div class="flexCol -mx-4">
    <div v-if="withMonth" class="flex bg-white border-b-(1 solid gray-100) justify-between items-center py-3 px-6">
      <p class="flex gap-1 cursor-pointer items-center select-none"
         @click="handlePrevWeek">
        <TheNuxtIcon name="arrow-left" icon-type="svg" class="text-lg rotate-180"/>
        هفته قبل
      </p>

      <p class="font-600 text-lg">{{ currentMonthFa }}</p>

      <p class="flex gap-1 cursor-pointer flex-row-reverse select-none items-center"
         @click="handleNextWeek">
        <TheNuxtIcon name="arrow-left" icon-type="svg" class="text-lg"/>
        هفته بعد
      </p>

    </div>
    <div class="flex items-center justify-between gap-4 px-4 pb-2 overflow-x-auto ">
      <div class="flexCol items-center select-none px-3 cursor-pointer"
           :class="selectedDay==item.date&&'border-b-(1 solid primary-600)'"
           @click="selectDay(item.date)"
           v-for="item in days"
      >
        <p class="text-(xs gray-600 nowrap) font-400 leading-6"
           :class="selectedDay==item.date?'!text-primary-600':''">
          {{ item.today ? 'امروز' : isoToWeekDayFirstLetter(item.date) }}</p>
        <p class="text-(sm ) leading-6.5 font-500" :class="selectedDay==item.date?'!text-primary-600':''">{{
            item.day
          }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'jalali-moment';
import { isoToWeekDay, isoToWeekDayFirstLetter } from '~/composables/global';

const { withMonth = false, startDay = 0, endDay = 14 } = defineProps<{
  withMonth?: boolean,
  startDay?: number,
  endDay?: number
}>();

// Base anchor (today) — we slide a window over this using weekOffset
const anchor = ref(moment());

// Selected day model
const selectedDay = defineModel<string>();
if (!selectedDay.value) {
  selectedDay.value = moment().toISOString();
}

// How far (in days) we have shifted the visible window relative to props start/end
// We change this in steps of 7
const weekOffset = ref(0);

// Utility to build the visible days from [fromDay, toDay)
const buildDays = (base: moment.Moment, fromDay: number, toDay: number) => {
  const list = [];
  for (let i = fromDay; i < toDay; i++) {
    const dayMoment = base.clone().add(i, 'day'); // preserve Jalali context

    const jalaliDay = moment(dayMoment.format('YYYY-MM-DD'), 'YYYY-MM-DD')
        .locale('fa')
        .format('D');

    const isToday = dayMoment.isSame(moment(), 'day');

    const day: any = {
      title: isToday ? 'امروز' : dayMoment.format('dddd'),
      day: jalaliDay,
      date: dayMoment.toISOString(),
      today: isToday || undefined,
    };

    list.push(day);
  }
  return list;
};

// Reactive window bounds derived from props + weekOffset
const fromDay = computed(() => startDay + weekOffset.value);
const toDay   = computed(() => endDay + weekOffset.value);

// Visible days
const days = computed(() => buildDays(anchor.value, fromDay.value, toDay.value));

const selectDay = (iso: string) => {
  selectedDay.value == iso ? selectedDay.value = '' : selectedDay.value = iso;
};

// ---- Week header (month indicator) -----------------------------------------
/**
 * We show the month name of the *start of the visible week window*.
 * If your design prefers the month of the selected day or mid-week,
 * change weekStartMoment to that instead.
 */
const weekStartMoment = computed(() =>
    anchor.value.clone().add(fromDay.value, 'day')
);

// Jalali month/year for header
const currentMonthFa = computed(() =>
    weekStartMoment.value.locale('fa').format('jMMMM jYYYY')
);

// If you need to limit navigation (e.g., no future beyond a certain date),
// add your own guards here. For now, both directions are allowed.
const handlePrevWeek = () => {
  weekOffset.value -= 7;
};

const handleNextWeek = () => {
  weekOffset.value += 7;
};

</script>