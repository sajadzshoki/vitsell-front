<template>
  <div class="w-full flex flex-col gap-10   ">
    <div class=" flex flex-col py-2 justify-between gap-4">
      <div class="flex items-center gap-2">
        <label for="min" class="text-2.5 leading-5.5 font-medium">از</label>
        <input
            id="min"
            type="text"
            v-model="formattedMin"
            @input="handleMinInput"
            @blur="handleMinBlur"
            class="border-(1 solid gray-200) px-2 !h-12 rounded-md text-( gray-500) leading-6.5"
        />
        <label for="min" class="text-2.5 leading-5.5 font-medium">تومان</label>
      </div>
      <div class="flex items-center  gap-2">
        <label for="max" class="text-2.5 leading-5.5 font-medium">تا</label>
        <input
            id="max"
            type="text"
            v-model="formattedMax"
            @input="handleMaxInput"
            @blur="handleMaxBlur"
            class="border-(1 solid gray-200) px-2 !h-12 rounded-md text-( gray-500) leading-6.5"
        />
        <label for="max" class="text-2.5 leading-5.5 font-medium">تومان</label>
      </div>
    </div>

    <vue-slider
        v-model="range"
        :min="0"
        :max="500000"
        :marks="marks"
        :tooltip="'always'"
        :dot-size="20"
        :tooltip-formatter="formatTooltip"
        :enable-cross="false"
        tooltip-placement="bottom"
        :process-style="{ backgroundColor: '#2B7CFF' }"
        :rail-style="{ backgroundColor: '#E6E6E6' }"
        :dot-style="{ backgroundColor: '#2B7CFF', boxShadow: 'none' }"
    >
      <template #mark="{ value }">
        <div
            class="w-[2px] h-[2px] rounded-full"
            :style="{
            backgroundColor: value >= range[0] && value <= range[1] ? '#FED26B' : '#C2C2C2',
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

const minModel = defineModel('min', { default: 0 })
const maxModel = defineModel('max', { default: 500000 })

const MIN_VALUE = 0
const MAX_VALUE = 500000

const formatNumber = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const unformatNumber = (s) => parseInt(String(s).replace(/,/g, '')) || 0

const formattedMin = ref(formatNumber(minModel.value.toString()))
const formattedMax = ref(formatNumber(maxModel.value.toString()))

const range = ref([minModel.value, maxModel.value])

const validateMin = (v) => Math.max(MIN_VALUE, Math.min(v, range.value[1] - 1))
const validateMax = (v) => Math.max(range.value[0] + 1, Math.min(v, MAX_VALUE))

// inputs -> range -> models
const handleMinInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '')
  formattedMin.value = formatNumber(raw)
  range.value = [validateMin(unformatNumber(raw)), range.value[1]]
}
const handleMinBlur = () => {
  const v = validateMin(unformatNumber(formattedMin.value))
  range.value = [v, range.value[1]]
  formattedMin.value = formatNumber(v.toString())
}

const handleMaxInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '')
  formattedMax.value = formatNumber(raw)
  range.value = [range.value[0], validateMax(unformatNumber(raw))]
}
const handleMaxBlur = () => {
  const v = validateMax(unformatNumber(formattedMax.value))
  range.value = [range.value[0], v]
  formattedMax.value = formatNumber(v.toString())
}

// keep slider bound to range, and sync both ways with models
watch(range, (val) => {
  minModel.value = val[0]
  maxModel.value = val[1]
  formattedMin.value = formatNumber(val[0].toString())
  formattedMax.value = formatNumber(val[1].toString())
})

watch([minModel, maxModel], ([mi, ma]) => {
  range.value = [validateMin(mi), validateMax(ma)]
})

function formatTooltip(value) { return formatNumber(value.toString()) }

const step = MAX_VALUE / 10
const marks = {}
for (let i = 0; i <= 10; i++) marks[Math.round(i * step)] = ''
</script>
<style>
.vue-slider{
  padding: 0 16px  !important;
}
.vue-slider-dot-handle {
  width: 18px !important;
  height: 18px !important;
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