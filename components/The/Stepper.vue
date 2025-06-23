
<template>
  <div class="flex justify-between relative w-full">
    <div class="border-(1 dashed primary-600) w-96% absolute top-5px right-7"></div>

    <div v-for="(step, index) in steps" :key="step.key" class="flexCol items-center">
      <div class="w-3 h-3 rounded-full z-1" :class="getDotClass(index)" />
      <p class="text-(sm) leading-7" :class="getTextClass(index)">
        {{ step.label }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
// Step type
interface Step {
  key: string
  label: string
  isMatch: () => boolean
}

// Props
const props = defineProps<{
  steps: Step[]
}>()
// sample:
// const steps = [
//   { key: 'chooseTime', label: 'انتخاب زمان', isMatch: () => route.name === 'doctor-id-booking' },
//   { key: 'personalInfo', label: 'ورود اطلاعات', isMatch: () => route.path.includes('personalInfo') },
//   { key: 'payment', label: 'پرداخت', isMatch: () => route.path.includes('payment') },
// ]

const activeStepIndex = computed(() =>
    props.steps.findIndex((step) => step.isMatch())
)
const getDotClass = (index: number) => {
  if (index < activeStepIndex.value) return 'bg-primary-600'
  if (index === activeStepIndex.value) return 'border-(2 solid primary-600) bg-white'
  return 'border-(2 solid gray-300) bg-white'
}

const getTextClass = (index: number) => {
  if (index === activeStepIndex.value) return 'font-500 text-primary-600'
  if (index < activeStepIndex.value) return 'text-primary-600'
  return 'text-gray-500'
}
</script>