<template>
  <div class="max-w-md flex flex-col gap-10 mx-auto px-6">
    <div class=" flex flex-col py-2 justify-between gap-4">
      <div class="flex ">
        <label for="start-time" class="text-2.5 leading-5.5 font-medium">من</label>
        <input
            id="start-time"
            type="text"
            v-model="formattedStartTime"
            @input="handleStartTimeInput"
            @blur="handleStartTimeBlur"
            class="border-b-(1 solid gray-50) text-(center gray-500) leading-6.5"
        />
        <label for="start-time" class="text-2.5 leading-5.5 font-medium">ساعة</label>
      </div>
      <div class="flex">
        <label for="end-time" class="text-2.5 leading-5.5 font-medium">إلى</label>
        <input
            id="end-time"
            type="text"
            v-model="formattedEndTime"
            @input="handleEndTimeInput"
            @blur="handleEndTimeBlur"
            class="border-b-(1 solid gray-50) text-(center gray-500) leading-6.5"
        />
        <label for="end-time" class="text-2.5 leading-5.5 font-medium">ساعة</label>
      </div>
    </div>

    <vue-slider
        v-model="timeRange"
        :min="0"
        :max="23"
        :interval="1"
        :marks="timeMarks"
        :tooltip="'always'"
        :dot-size="20"
        :tooltip-formatter="formatTimeTooltip"
        :enable-cross="false"
        tooltip-placement="bottom"
        :process-style="{ backgroundColor: '#FDC135' }"
        :rail-style="{ backgroundColor: '#E6E6E6' }"
        :dot-style="{ backgroundColor: '#FDC135', boxShadow: 'none' }"
    >
      <template #mark="{ value }">
        <div
            class="w-[2px] h-[2px] rounded-full"
            :style="{
            backgroundColor: value >= timeRange[0] && value <= timeRange[1] ? '#FED26B' : '#C2C2C2',
          }"
        ></div>
      </template>
    </vue-slider>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

// تبدیل ساعت به فرمت 24 ساعته
const formatTime = (hour) => {
  return `${hour}:00`
}

// تبدیل فرمت نمایشی به عدد ساعت
const unformatTime = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0]) || 0
  return Math.max(0, Math.min(23, hour))
}

// اعتبارسنجی ساعت شروع
const validateStartTime = (hour) => {
  return Math.max(0, Math.min(hour, timeRange.value[1] - 1))
}

// اعتبارسنجی ساعت پایان
const validateEndTime = (hour) => {
  return Math.max(timeRange.value[0] + 1, Math.min(hour, 23))
}

const timeRange = ref([8, 17]) // محدوده پیش‌فرض 8 صبح تا 5 بعدازظهر
const formattedStartTime = ref(formatTime(timeRange.value[0]))
const formattedEndTime = ref(formatTime(timeRange.value[1]))

// مدیریت ورودی ساعت شروع
const handleStartTimeInput = (e) => {
  const rawValue = e.target.value.replace(/\D/g, '')
  const hour = parseInt(rawValue) || 0
  formattedStartTime.value = formatTime(hour)
  timeRange.value = [validateStartTime(hour), timeRange.value[1]]
}

const handleStartTimeBlur = () => {
  const hour = validateStartTime(unformatTime(formattedStartTime.value))
  timeRange.value = [hour, timeRange.value[1]]
  formattedStartTime.value = formatTime(hour)
}

// مدیریت ورودی ساعت پایان
const handleEndTimeInput = (e) => {
  const rawValue = e.target.value.replace(/\D/g, '')
  const hour = parseInt(rawValue) || 0
  formattedEndTime.value = formatTime(hour)
  timeRange.value = [timeRange.value[0], validateEndTime(hour)]
}

const handleEndTimeBlur = () => {
  const hour = validateEndTime(unformatTime(formattedEndTime.value))
  timeRange.value = [timeRange.value[0], hour]
  formattedEndTime.value = formatTime(hour)
}

// همگام‌سازی با تغییرات اسلایدر
watch(timeRange, (newVal) => {
  formattedStartTime.value = formatTime(newVal[0])
  formattedEndTime.value = formatTime(newVal[1])
})

// فرمت نمایشی برای tooltip
function formatTimeTooltip(hour) {
  return formatTime(hour)
}

// ایجاد نشانگرها برای هر ساعت
const timeMarks = {}
for (let i = 0; i <= 23; i++) {
  timeMarks[i] = i % 4 === 0 ? formatTime(i) : '' // نمایش هر 4 ساعت یکبار
}
</script>

<style>
/* استایل‌های قبلی بدون تغییر */
.vue-slider-dot-handle {
  width: 20px !important;
  height: 20px !important;
}
.vue-slider-dot-tooltip {
  background-color: transparent !important;
  color: white !important;
  font-weight: 500 !important;
  font-size: 10px !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
  transform: translateY(-10px) !important;
}
.vue-slider-dot-tooltip-inner {
  border-color: transparent !important;
  color: #333333 !important;
  font-weight: 500 !important;
  font-size: 10px !important;
  background-color: transparent;
}
.vue-slider-dot-tooltip-bottom {
  bottom: -20px !important;
  left: 50% !important;
  transform: translateX(-50%) translateY(0) !important;
}
.vue-slider-marks {
  display: flex !important;
  flex-direction: row-reverse !important;
  justify-content: space-between !important;
  align-items: center !important;
  z-index: 10 !important;
}
.vue-slider-mark {
  width: 2px !important;
  height: 2px !important;
}
.vue-slider-dot {
  z-index: 11 !important;
}
</style>