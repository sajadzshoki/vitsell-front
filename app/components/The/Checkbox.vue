<template>
  <div class="flex items-center gap-1 ">
    <div
        class="flex flexCenter  cursor-pointer border-(1 solid)    relative"
        @click="toggleCheck"
        :class="[isChecked ?'border-(1 gray-800 solid)':'border-gray-500',circle?'rounded-full border-primary-600 w-6 h-6':'h-5 w-5 b-rd-1']"
    >
      <div v-if="isChecked" class="  bg-primary-600 relative flex flexCenter" :class="circle?'rounded-full w-4.5 h-4.5':'!w-3.6 !h-3.6 b-rd-0.5'">
        <TheNuxtIcon name="Tick" icon-type="svg"/>
      </div>
    </div>
    <p class="text-(sm ) leading-6.5" :class="labelClass">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
const check = defineModel<any>() // support both boolean or array

const props = defineProps<{
  value?: string | number
  multi?: boolean
  label?: string,
  labelClass?: string,
  circle?:boolean
}>()

const isChecked = computed(() => {
  if (props.multi && Array.isArray(check.value)) {
    return check.value.includes(props.value)
  }
  return !!check.value
})

const toggleCheck = () => {
  if (props.multi && Array.isArray(check.value)) {
    const index = check.value.indexOf(props.value)
    if (index === -1) {
      check.value.push(props.value)
    } else {
      check.value.splice(index, 1)
    }
  } else {
    check.value = !check.value
  }
}
</script>
